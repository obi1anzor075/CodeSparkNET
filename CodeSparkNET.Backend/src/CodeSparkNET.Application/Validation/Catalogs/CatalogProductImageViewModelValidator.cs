using CodeSparkNET.WEB.ViewModels.Catalogs;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Catalogs
{
    public class CatalogProductImageViewModelValidator : AbstractValidator<CatalogProductImageViewModel>
    {
        public CatalogProductImageViewModelValidator()
        {
            RuleFor(x => x.Url)
                .NotEmpty().WithMessage("URL изображения обязателен.")
                .MaximumLength(500).WithMessage("URL не должен превышать 500 символов.");
        }
    }
}
