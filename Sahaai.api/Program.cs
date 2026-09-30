using DotNetEnv;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Sahaai.Api.Middleware;
using Sahaai.Application.Common;
using Sahaai.Application.Features.Locations.Interfaces;
using Sahaai.Application.Features.Locations.Services;
using Sahaai.Application.Features.RequestService.Interfaces;
using Sahaai.Application.Features.RequestService.Services;
using Sahaai.Application.Features.Services.Interfaces;
using Sahaai.Application.Features.Services.Services;
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Application.Features.Users.Services;
using Sahaai.Application.Features.Users.Validators;
using Sahaai.Application.Features.Admin.Interfaces;
using Sahaai.Application.Features.Reviews.Interfaces;
using Sahaai.Application.Features.Reviews.Services;
using Sahaai.Application.Features.Workers.Interfaces;
using Sahaai.Api.Hubs;
using Sahaai.Api.Services;
using Sahaai.Domain.Entities;
using Sahaai.Domain.Enums;
using Sahaai.Infrastructure.Data;
using Sahaai.Infrastructure.Repositories;
using Sahaai.Infrastructure.Services;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
Env.TraversePath().Load();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


// In-Memory Caching (replaces Redis)
builder.Services.AddMemoryCache();
builder.Services.AddDistributedMemoryCache();



// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

//Auto mapper and fluent validation
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();


//Dependency Injection
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserAuthService, UserAuthService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
; builder.Services.AddScoped<IForgotPasswordService, ForgotPasswordService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IMailkitService, MailkitService>();
builder.Services.AddScoped<IUserAddressRepository, UserAddressRepository>();
builder.Services.AddScoped<IUserAddressService, UserAddressService>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IServiceRequestRepository, ServiceRequestRepository>();
builder.Services.AddScoped<IServiceRequestService, ServiceRequestService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddScoped<IAdminServiceRequestService, AdminServiceRequestService>();

builder.Services.AddScoped<IWorkerRepository, WorkerRepository>();
builder.Services.AddScoped<IWorkerAuthService, WorkerAuthService>();
builder.Services.AddScoped<IWorkerService, WorkerService>();
builder.Services.AddScoped<IWorkerNotificationService, WorkerNotificationService>();

builder.Services.AddScoped<IWorkerReviewRepository, WorkerReviewRepository>();
builder.Services.AddScoped<IWorkerReviewService, WorkerReviewService>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});




builder.Services.AddHttpContextAccessor();

builder.Services.AddHttpClient("Nominatim", client =>
{
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
    client.DefaultRequestHeaders.Add("User-Agent", "SahaaiApp/1.0");
});


// JWT Authentication Setup
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {

                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {


                return Task.CompletedTask;
            }
        };
    });



builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sahaai API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter JWT token like: Bearer eyJhbGciOiJIUzI1NiIs...",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});




//Rate limiting configuration
builder.Services.AddRateLimiter(options =>
{
    //Global Rate Limiting
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });


    //For OTP Resend
    options.AddPolicy("ResendOtpLimit", httpContext =>
    {
        string key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        return RateLimitPartition.GetTokenBucketLimiter(
            key,
            _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 1,
                TokensPerPeriod = 1,
                ReplenishmentPeriod = TimeSpan.FromSeconds(60),
                AutoReplenishment = true,
                QueueLimit = 0
            });
    });


    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.ContentType = "application/json";

        var endpoint = context.HttpContext.GetEndpoint();
        var limiterAttr = endpoint?.Metadata?.GetMetadata<EnableRateLimitingAttribute>();
        string policyName = limiterAttr?.PolicyName ?? "Global";


        TimeSpan? retryAfter = null;

        if (context.Lease != null &&
            context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry))
        {
            retryAfter = retry;
        }

        double seconds = retryAfter?.TotalSeconds ?? 60;

        object response;

        if (policyName == "ResendOtpLimit")
        {
            response = new
            {
                status = 429,
                policy = "ResendOtpLimit",
                retryAfter = (int)Math.Ceiling(seconds),
                message = $"You can resend OTP only after {(int)Math.Ceiling(seconds)} seconds."
            };
        }
        else
        {
            response = new
            {
                status = 429,
                policy = policyName,
                retryAfter = (int)Math.Ceiling(seconds),
                message = "Too many requests. Please try again later."
            };
        }

        await context.HttpContext.Response.WriteAsync(JsonSerializer.Serialize(response));
    };


});



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseStaticFiles();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<ActiveUserMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<RequestHub>("/hubs/request");
app.MapHub<NearbyHub>("/hubs/nearby");

// Automatic Admin Seeder
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        var authService = services.GetRequiredService<IAuthService>();

        var adminUsername = Environment.GetEnvironmentVariable("ADMIN_USERNAME") ?? "admin";
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD") ?? "Admin@123";
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@sahaai.com";
        var adminFullName = Environment.GetEnvironmentVariable("ADMIN_FULLNAME") ?? "System Administrator";
        var adminPhone = Environment.GetEnvironmentVariable("ADMIN_PHONE") ?? "9999999999";

        var adminExists = await dbContext.Users
            .Include(u => u.Login)
            .AnyAsync(u => u.Role == UserRole.Admin || u.Email == adminEmail || (u.Login != null && u.Login.Username == adminUsername));

        if (!adminExists)
        {
            authService.CreatePasswordHash(adminPassword, out byte[] hash, out byte[] salt);

            var adminUser = new User
            {
                FullName = adminFullName,
                Email = adminEmail,
                Phone = adminPhone,
                Role = UserRole.Admin,
                IsActive = true,
                IsEmailVerified = true,
                EmailVerifiedAt = DateTime.UtcNow,
                CreatedBy = "SystemSeeder",
                CreatedOn = DateTime.UtcNow,
                Login = new Login
                {
                    Username = adminUsername,
                    PasswordHash = Convert.ToBase64String(hash),
                    PasswordSalt = Convert.ToBase64String(salt)
                }
            };

            await dbContext.Users.AddAsync(adminUser);
            await dbContext.SaveChangesAsync();
            Console.WriteLine($"[Seeder] Seeded Admin account: Username='{adminUsername}', Email='{adminEmail}'.");
        }

        // Seed Emergency Services if not present
        if (!await dbContext.Service.AnyAsync())
        {
            var defaultServices = new List<Service>
            {
                new Service
                {
                    ServiceName = "Electrical Emergency",
                    Description = "Rapid assistance for short circuits, power outages, fuse replacements, and hazardous wiring issues.",
                    ImageUrl = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                },
                new Service
                {
                    ServiceName = "Plumbing & Pipe Burst",
                    Description = "Immediate fix for severe pipe leaks, overflowing drains, water heater failures, and clogged mainlines.",
                    ImageUrl = "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                },
                new Service
                {
                    ServiceName = "Roadside & Vehicle Breakdown",
                    Description = "Emergency battery jumpstart, flat tyre repair, towing support, and on-spot mechanic assistance.",
                    ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                },
                new Service
                {
                    ServiceName = "Appliance Repair & Servicing",
                    Description = "Fast diagnostics and repair for refrigerators, ACs, washing machines, and cooking hobs.",
                    ImageUrl = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                },
                new Service
                {
                    ServiceName = "Emergency Locksmith",
                    Description = "Door lockout rescue, broken key extraction, digital lock resetting, and emergency security locks.",
                    ImageUrl = "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                },
                new Service
                {
                    ServiceName = "Carpentry & Structural Fix",
                    Description = "Urgent door/window latch repairs, broken furniture stabilization, and security reinforcement.",
                    ImageUrl = "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80",
                    IsActive = true,
                    CreatedBy = "SystemSeeder",
                    CreatedOn = DateTime.UtcNow
                }
            };

            await dbContext.Service.AddRangeAsync(defaultServices);
            await dbContext.SaveChangesAsync();
            Console.WriteLine($"[Seeder] Seeded {defaultServices.Count} emergency services into database.");
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "[Seeder] An error occurred while seeding the default data.");
    }
}

app.Run();
