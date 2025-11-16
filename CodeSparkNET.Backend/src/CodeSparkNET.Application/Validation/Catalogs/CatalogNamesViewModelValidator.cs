using CodeSparkNET.WEB.ViewModels.Catalogs;
using FluentValidation;

namespace CodeSparkNET.WEB.Validation.Catalogs
{
    public class CatalogNamesViewModelValidator : AbstractValidator<CatalogNamesViewModel>
    {
        public CatalogNamesViewModelValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Название каталога обязательно.")
                .MinimumLength(2).WithMessage("Название должно содержать минимум 2 символа.")
                .MaximumLength(100).WithMessage("Название не должно превышать 100 символов.");

            RuleFor(x => x.Slug)
                .NotEmpty().WithMessage("Slug обязателен.")
                .Matches(@"^[a-z0-9\-]+$")
                .WithMessage("Slug может содержать только строчные латинские буквы, цифры и дефис.")
                .MaximumLength(200).WithMessage("Slug не должен превышать 200 символов.");

            RuleFor(x => x.PageName)
                .MaximumLength(100)
                .WithMessage("Имя страницы не должно превышать 100 символов.")
                .When(x => !string.IsNullOrEmpty(x.PageName));

            RuleFor(x => x.PageController)
                .MaximumLength(100)
                .WithMessage("Имя контроллера не должно превышать 100 символов.")
                .When(x => !string.IsNullOrEmpty(x.PageController));
        }
    }
}
