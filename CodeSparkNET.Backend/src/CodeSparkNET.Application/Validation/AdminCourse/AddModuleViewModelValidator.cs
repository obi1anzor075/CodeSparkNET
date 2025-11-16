using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class AddModuleViewModelValidator : AbstractValidator<AddModuleViewModel>
    {
        public AddModuleViewModelValidator()
        {
            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug обязателен.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.");

            RuleFor(x => x.CourseSlug)
                .NotEmpty().WithMessage("CourseSlug обязателен.")
                .MaximumLength(200).WithMessage("CourseSlug не должен превышать 200 символов.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("CourseSlug может содержать только строчные латинские буквы, цифры и дефис.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Название модуля обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(200).WithMessage("Название не должно превышать 200 символов.");

            RuleFor(x => x.Position)
                .GreaterThanOrEqualTo(0).WithMessage("Позиция не может быть отрицательной.")
                .LessThanOrEqualTo(1000).WithMessage("Позиция не должна превышать 1000.");
        }
    }
}
