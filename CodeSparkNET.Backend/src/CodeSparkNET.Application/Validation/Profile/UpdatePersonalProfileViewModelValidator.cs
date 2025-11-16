using CodeSparkNET.WEB.ViewModels.Profile;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Profile
{
    public class UpdatePersonalProfileViewModelValidator : AbstractValidator<UpdatePersonalProfileViewModel>
    {
        public UpdatePersonalProfileViewModelValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Введите имя пользователя.")
                .MaximumLength(50).WithMessage("Имя пользователя не должно превышать 50 символов.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Введите почту.")
                .EmailAddress().WithMessage("Введите корректный адрес электронной почты.")
                .MaximumLength(100).WithMessage("Почта не должна превышать 100 символов.");
        }
    }
}
