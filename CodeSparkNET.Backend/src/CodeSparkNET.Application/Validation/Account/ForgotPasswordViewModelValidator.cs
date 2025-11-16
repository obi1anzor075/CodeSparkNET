using CodeSparkNET.WEB.ViewModels.Account;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Account
{
    public class ForgotPasswordViewModelValidator : AbstractValidator<ForgotPasswordViewModel>
    {
        public ForgotPasswordViewModelValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Введите email.")
                .EmailAddress().WithMessage("Введите корректный email.");
        }
    }
}
