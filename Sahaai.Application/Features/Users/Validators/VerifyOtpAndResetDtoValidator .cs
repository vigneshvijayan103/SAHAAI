using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Sahaai.Application.Features.Users.DTO.Auth;

namespace Sahaai.Application.Features.Users.Validators
{
    public class VerifyOtpAndResetDtoValidator:AbstractValidator<VerifyOtpAndResetDto>
    {
        public VerifyOtpAndResetDtoValidator()
        {
            // Email validation
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Enter a valid email address.");

            // OTP validation
            RuleFor(x => x.Otp)
                .NotEmpty().WithMessage("OTP is required.")
                .Length(6).WithMessage("OTP must be exactly 6 digits.")
                .Matches("^[0-9]{6}$").WithMessage("OTP must contain only numbers.");

            // New password validation

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters");

            // Confirm password
            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Confirm password is required.")
                .Equal(x => x.NewPassword).WithMessage("Passwords do not match.");
        }

    }
}
