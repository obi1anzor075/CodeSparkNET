using CodeSparkNET.WEB.ViewModels.Catalogs;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Catalogs
{
    public class CatalogViewModelValidator : AbstractValidator<CatalogViewModel>
    {
        public CatalogViewModelValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Название каталога обязательно.")
                .MinimumLength(2).WithMessage("Название должно содержать минимум 2 символа.")
                .MaximumLength(150).WithMessage("Название не должно превышать 150 символов.");

            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$").WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleForEach(x => x.Products)
                .SetValidator(new CatalogProductsViewModelValidator())
                .When(x => x.Products != null);
        }
    }
}
