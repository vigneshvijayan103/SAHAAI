using FluentValidation;
using Sahaai.Application.Features.Workers.DTO;

namespace Sahaai.Application.Features.Workers.Validators
{
    public class WorkerRegisterDtoValidator : AbstractValidator<WorkerRegisterDto>
    {
        public WorkerRegisterDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full Name is required")
                .MaximumLength(100);

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("A valid email is required");

            RuleFor(x => x.Phone)
                .NotEmpty().WithMessage("Phone is required")
                .Matches(@"^[6-9]\d{9}$").WithMessage("Invalid phone number. Must be a 10-digit number starting with 6-9.");

            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required")
                .MaximumLength(50);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password).WithMessage("Passwords do not match");

            RuleFor(x => x.AadhaarNumber)
                .NotEmpty().WithMessage("Aadhaar Number is required")
                .Matches(@"^\d{12}$").WithMessage("Aadhaar Number must be a valid 12-digit number");
        }
    }
}

