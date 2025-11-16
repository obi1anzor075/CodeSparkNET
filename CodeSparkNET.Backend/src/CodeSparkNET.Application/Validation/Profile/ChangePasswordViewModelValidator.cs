using CodeSparkNET.WEB.ViewModels.Profile;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Profile
{
    public class ChangePasswordViewModelValidator : AbstractValidator<ChangePasswordViewModel>
    {
        public ChangePasswordViewModelValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Введите текущий пароль.");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Введите новый пароль.")
                .MinimumLength(6).WithMessage("Пароль должен содержать минимум 6 символов.");

            RuleFor(x => x.ConfirmPassword)
                .NotEmpty().WithMessage("Подтвердите пароль.")
                .Equal(x => x.NewPassword).WithMessage("Пароли не совпадают.");
        }
    }
}
