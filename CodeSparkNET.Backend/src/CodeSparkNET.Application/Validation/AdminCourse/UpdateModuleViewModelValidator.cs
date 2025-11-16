using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class UpdateModuleViewModelValidator : AbstractValidator<UpdateModuleViewModel>
    {
        public UpdateModuleViewModelValidator()
        {
            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$")
                .WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Название модуля обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(200).WithMessage("Название не должно превышать 200 символов.")
                .When(x => !string.IsNullOrEmpty(x.Title));

            RuleFor(x => x.Position)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Позиция не может быть отрицательной.");
        }
    }
}
