using CodeSparkNET.WEB.ViewModels.Account;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Account
{
    public class LoginViewModelValidator : AbstractValidator<LoginViewModel>
    {
        public LoginViewModelValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обязателен")
                .EmailAddress().WithMessage("Неверный формат email");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Пароль обязателен.")
                .MinimumLength(6).WithMessage("Пароль должен содержать минимум 6 символов.")
                .MaximumLength(50).WithMessage("Пароль не должен превышать 50 символов.")
                .Matches("[A-Z]").WithMessage("Пароль должен содержать хотя бы одну заглавную букву.")
                .Matches("[a-z]").WithMessage("Пароль должен содержать хотя бы одну строчную букву.")
                .Matches("[0-9]").WithMessage("Пароль должен содержать хотя бы одну цифру.");
        }
    }
}
