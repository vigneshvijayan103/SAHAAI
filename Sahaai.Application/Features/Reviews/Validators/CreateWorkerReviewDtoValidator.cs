using FluentValidation;
using Sahaai.Application.Features.Reviews.DTO;

namespace Sahaai.Application.Features.Reviews.Validators
{
    public class CreateWorkerReviewDtoValidator : AbstractValidator<CreateWorkerReviewDto>
    {
        public CreateWorkerReviewDtoValidator()
        {
            RuleFor(x => x.ServiceRequestId)
                .GreaterThan(0)
                .WithMessage("Valid ServiceRequestId is required");

            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating must be between 1 and 5");

            RuleFor(x => x.ReviewText)
                .MaximumLength(1000)
                .WithMessage("Review cannot exceed 1000 characters");
        }
    }
}

