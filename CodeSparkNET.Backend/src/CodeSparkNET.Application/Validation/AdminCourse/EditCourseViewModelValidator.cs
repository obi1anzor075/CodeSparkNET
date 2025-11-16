using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class EditCourseViewModelValidator : AbstractValidator<EditCourseViewModel>
    {
        public EditCourseViewModelValidator()
        {
            RuleFor(x => x.Slug)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Название курса обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(150).WithMessage("Название не должно превышать 150 символов.");

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500).WithMessage("Краткое описание не должно превышать 500 символов.")
                .When(x => !string.IsNullOrEmpty(x.ShortDescription));

            RuleFor(x => x.FullDescription)
                .MaximumLength(5000).WithMessage("Полное описание не должно превышать 5000 символов.")
                .When(x => !string.IsNullOrEmpty(x.FullDescription));

            RuleFor(x => x.MainImageUrl)
                .Must(url => string.IsNullOrEmpty(url) || Uri.IsWellFormedUriString(url, UriKind.Absolute))
                .WithMessage("Некорректный URL изображения.")
                .When(x => !string.IsNullOrEmpty(x.MainImageUrl));
        }
    }
}
