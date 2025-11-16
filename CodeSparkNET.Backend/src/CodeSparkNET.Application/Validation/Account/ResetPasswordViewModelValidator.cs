using CodeSparkNET.WEB.ViewModels.Account;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Account
{
    public class ResetPasswordViewModelValidator : AbstractValidator<ResetPasswordViewModel>
    {
        public ResetPasswordViewModelValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Введите email.")
                .EmailAddress().WithMessage("Введите корректный email.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Пароль обязателен.")
                .MinimumLength(6).WithMessage("Пароль должен содержать минимум 6 символов.")
                .MaximumLength(50).WithMessage("Пароль не должен превышать 50 символов.")
                .Matches("[A-Z]").WithMessage("Пароль должен содержать хотя бы одну заглавную букву.")
                .Matches("[a-z]").WithMessage("Пароль должен содержать хотя бы одну строчную букву.")
                .Matches("[0-9]").WithMessage("Пароль должен содержать хотя бы одну цифру.");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Подтверждение пароля обязательно.")
                .Equal(x => x.Password).WithMessage("Введенные пароли не совпадают.");

            RuleFor(x => x.Token)
                .NotEmpty().WithMessage("Токен для восстановления пароля обязателен.");
        }
    }
}
