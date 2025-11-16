using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class AddLessonViewModelValidator : AbstractValidator<AddLessonViewModel>
    {
        public AddLessonViewModelValidator()
        {
            RuleFor(x => x.ModuleSlug)
                .NotEmpty().WithMessage("ModuleSlug обязателен.")
                .MaximumLength(200).WithMessage("ModuleSlug слишком длинный.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("ModuleSlug может содержать только строчные латинские буквы, цифры и дефис.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Название урока обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(200).WithMessage("Название не должно превышать 200 символов.");

            RuleFor(x => x.Slug)
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.")
                .Matches(@"^[a-z0-9\-]+$").When(x => !string.IsNullOrWhiteSpace(x.Slug))
                .WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.");

            RuleFor(x => x.Body)
                .MaximumLength(100_000).WithMessage("Текст урока слишком большой.")
                .NotEmpty().When(x => x.IsPublished).WithMessage("Тело урока обязательно для опубликованного урока.");
        }
    }
}
