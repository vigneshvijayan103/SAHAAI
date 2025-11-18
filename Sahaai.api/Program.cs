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
using Sahaai.Application.Features.Users.Interfaces;
using Sahaai.Application.Features.Users.Services;
using Sahaai.Application.Features.Users.Validators;
using Sahaai.Infrastructure.Data;
using Sahaai.Infrastructure.Repositories;
using Sahaai.Infrastructure.Services;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
Env.Load();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration["Redis:ConnectionString"];
});



// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

//Autoo mapper and fluent validation
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterUserDtoValidator>();

//Dependency Injection
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<UserAuthService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IMailkitService, MailkitService>();
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<UserProfileService>();



builder.Services.AddHttpContextAccessor();

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
                //Console.WriteLine("TOKEN RAW HEADER => " + context.Request.Headers["Authorization"]);
                //Console.WriteLine("TOKEN RECEIVED => " + context.Token);
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine("JWT AUTH FAILED: " + context.Exception?.Message); 
                if (context.Exception?.InnerException != null)
                    Console.WriteLine("Inner: " + context.Exception.InnerException.Message);
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
        httpContext.Request.EnableBuffering(); // allow body reading
        string email = "";

        using (var reader = new StreamReader(httpContext.Request.Body, leaveOpen: true))
        {
            var body = reader.ReadToEnd();
            httpContext.Request.Body.Position = 0;

            if (!string.IsNullOrWhiteSpace(body))
            {
                using var json = JsonDocument.Parse(body);
                if (json.RootElement.TryGetProperty("email", out var emailProp))
                {
                    email = emailProp.GetString() ?? "";
                }
            }
        }

        string key = string.IsNullOrWhiteSpace(email)
            ? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            : email.ToLower();

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

app.UseHttpsRedirection();
app.UseMiddleware<GlobalExceptionMiddleware>();


app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();
