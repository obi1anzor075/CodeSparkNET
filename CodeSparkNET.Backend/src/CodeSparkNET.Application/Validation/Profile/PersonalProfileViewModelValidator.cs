using CodeSparkNET.WEB.ViewModels.Profile;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Profile
{
    public class PersonalProfileViewModelValidator : AbstractValidator<PersonalProfileViewModel>
    {
        public PersonalProfileViewModelValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Имя пользователя обязательно для заполнения.")
                .MaximumLength(50).WithMessage("Имя пользователя не может превышать 50 символов.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email обязателен для заполнения.")
                .EmailAddress().WithMessage("Введите корректный адрес электронной почты.");

            RuleFor(x => x.Roles)
                .NotEmpty().WithMessage("Необходимо указать роль пользователя.");

            RuleFor(x => x.EmailAddAt)
                .NotEmpty().WithMessage("Дата добавления email обязательна.")
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Дата добавления email не может быть в будущем.");

            RuleFor(x => x.EmailConfirmedAt)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Дата подтверждения email не может быть в будущем.")
                .When(x => x.EmailConfirmedAt != default);

            RuleFor(x => x.EmailChangedAt)
                .LessThanOrEqualTo(DateTime.UtcNow).WithMessage("Дата изменения email не может быть в будущем.")
                .When(x => x.EmailChangedAt != default);
        }
    }
}
