using CodeSparkNET.WEB.ViewModels.Catalogs;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Catalogs
{
    public class CatalogProductsViewModelValidator : AbstractValidator<CatalogProductsViewModel>
    {
        public CatalogProductsViewModelValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Название продукта обязательно.")
                .MinimumLength(2).WithMessage("Название должно содержать минимум 2 символа.")
                .MaximumLength(200).WithMessage("Название не должно превышать 200 символов.");

            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$")
                .WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleFor(x => x.ShortDescription)
                .MaximumLength(500)
                .WithMessage("Краткое описание не должно превышать 500 символов.")
                .When(x => !string.IsNullOrWhiteSpace(x.ShortDescription));

            RuleFor(x => x.FullDescription)
                .MaximumLength(5000)
                .WithMessage("Полное описание не должно превышать 5000 символов.")
                .When(x => !string.IsNullOrWhiteSpace(x.FullDescription));

            RuleFor(x => x.Price)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Цена не может быть отрицательной.");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Укажите валюту.")
                .Length(3).WithMessage("Код валюты должен состоять из 3 символов (например, RUB, USD, EUR).");

            RuleFor(x => x.InStock)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Количество на складе не может быть отрицательным.");

            RuleFor(x => x.ProductType)
                .NotEmpty().WithMessage("Тип продукта обязателен.")
                .MaximumLength(100).WithMessage("Тип продукта не должен превышать 100 символов.");

            RuleForEach(x => x.ProductImages)
                .SetValidator(new CatalogProductImageViewModelValidator())
                .When(x => x.ProductImages != null);
        }
    }
}
