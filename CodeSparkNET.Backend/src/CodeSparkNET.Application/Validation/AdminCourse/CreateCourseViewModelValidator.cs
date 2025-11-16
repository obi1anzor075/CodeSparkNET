using CodeSparkNET.WEB.ViewModels.AdminCourse;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.AdminCourse
{
    public class CreateCourseViewModelValidator : AbstractValidator<CreateCourseViewModel>
    {
        public CreateCourseViewModelValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Название курса обязательно.")
                .MinimumLength(3).WithMessage("Название должно содержать минимум 3 символа.")
                .MaximumLength(150).WithMessage("Название не должно превышать 150 символов.");

            RuleFor(x => x.Slug)
                .Cascade(CascadeMode.Stop)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0).WithMessage("Цена не может быть отрицательной.")
                .LessThanOrEqualTo(1000000).WithMessage("Цена не должна превышать 1 000 000.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Валюта обязательна.")
                .Length(3).WithMessage("Код валюты должен содержать 3 символа (например, RUB, USD, EUR).");

            RuleFor(x => x.InStock)
                .GreaterThanOrEqualTo(0).WithMessage("Количество не может быть отрицательным.")
                .LessThanOrEqualTo(10000).WithMessage("Количество не должно превышать 10 000.");

            RuleFor(x => x.CatalogId)
                .MaximumLength(100).WithMessage("Идентификатор каталога не должен превышать 100 символов.")
                .When(x => !string.IsNullOrEmpty(x.CatalogId));

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
