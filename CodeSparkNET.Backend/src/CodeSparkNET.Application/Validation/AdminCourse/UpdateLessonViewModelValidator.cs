using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class UpdateLessonViewModelValidator : AbstractValidator<UpdateLessonViewModel>
    {
        public UpdateLessonViewModelValidator()
        {

            RuleFor(x => x.ModuleId)
                .NotEmpty().WithMessage("Идентификатор модуля обязателен.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Название урока обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(200).WithMessage("Название не должно превышать 200 символов.");

            RuleFor(x => x.Slug)
                .Matches(@"^[a-z0-9\-]+$")
                .WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.")
                .When(x => !string.IsNullOrEmpty(x.Slug));

            RuleFor(x => x.Body)
                .MaximumLength(100000)
                .WithMessage("Содержимое урока не должно превышать 100 000 символов.")
                .When(x => !string.IsNullOrEmpty(x.Body));

            RuleFor(x => x.Position)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Позиция не может быть отрицательной.");
        }
    }
}
