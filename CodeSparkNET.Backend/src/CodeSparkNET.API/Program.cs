using CodeSparkNET.Application;
using CodeSparkNET.Domain.Models;
using CodeSparkNET.Infrastructure;
using CodeSparkNET.WEB.Validation.Account;
using CodeSparkNET.WEB.Validation.AdminCourse;
using CodeSparkNET.WEB.Validation.Catalogs;
using CodeSparkNET.WEB.Validation.Profile;
using CodeSparkNET.WEB.ViewModels.Account;
using CodeSparkNET.WEB.ViewModels.AdminCourse;
using CodeSparkNET.WEB.ViewModels.Catalogs;
using CodeSparkNET.WEB.ViewModels.Profile;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using System.Globalization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// resources for localization (can be kept for API messages)
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services to the container.
// NOTE: switched from AddControllersWithViews() -> AddControllers() to remove view rendering.
builder.Services.AddControllers(options =>
{
    // Keep model-binding messages customization (still applies for API model binding).
    var mb = options.ModelBindingMessageProvider;
    mb.SetAttemptedValueIsInvalidAccessor((x, name) => "Неверное значение.");
    mb.SetMissingBindRequiredValueAccessor(name => "Не указано обязательное значение.");
    mb.SetMissingKeyOrValueAccessor(() => "Отсутствует значение.");
    mb.SetUnknownValueIsInvalidAccessor(name => "Неверное значение.");
    mb.SetValueMustBeANumberAccessor(name => "Значение должно быть числом.");
    mb.SetValueIsInvalidAccessor(name => "Неверное значение.");
});

// HttpContext accessor (OK for APIs)
builder.Services.AddHttpContextAccessor();

// Add DbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Sql"));
});

// Identity (kept — useful for token/auth flows; cookies configuration removed)
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Infrastructure / Application services
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Add FluentValidation automatic validation (works for API model binding)
builder.Services.AddFluentValidationAutoValidation(conf =>
{
    conf.EnableFormBindingSourceAutomaticValidation = true;
    conf.EnableQueryBindingSourceAutomaticValidation = true;
    conf.EnableBodyBindingSourceAutomaticValidation = true;
    conf.OverrideDefaultResultFactoryWith<CustomValidationResultFactory>();
});

// Register validators
builder.Services.AddTransient<CustomValidationResultFactory>();
// Account validators
builder.Services.AddScoped<IValidator<LoginViewModel>, LoginViewModelValidator>();
builder.Services.AddScoped<IValidator<ForgotPasswordViewModel>, ForgotPasswordViewModelValidator>();
builder.Services.AddScoped<IValidator<ResetPasswordViewModel>, ResetPasswordViewModelValidator>();
// AdminCourse validators
builder.Services.AddScoped<IValidator<AddLessonViewModel>, AddLessonViewModelValidator>();
builder.Services.AddScoped<IValidator<AddModuleViewModel>, AddModuleViewModelValidator>();
builder.Services.AddScoped<IValidator<CreateCourseViewModel>, CreateCourseViewModelValidator>();
builder.Services.AddScoped<IValidator<EditCourseViewModel>, EditCourseViewModelValidator>();
builder.Services.AddScoped<IValidator<UpdateLessonViewModel>, UpdateLessonViewModelValidator>();
builder.Services.AddScoped<IValidator<UpdateModuleViewModel>, UpdateModuleViewModelValidator>();
// Catalogs
builder.Services.AddScoped<IValidator<CatalogNamesViewModel>, CatalogNamesViewModelValidator>();
builder.Services.AddScoped<IValidator<CatalogProductDetailsViewModel>, CatalogProductDetailsViewModelValidator>();
builder.Services.AddScoped<IValidator<CatalogProductImageViewModel>, CatalogProductImageViewModelValidator>();
builder.Services.AddScoped<IValidator<CatalogProductsViewModel>, CatalogProductsViewModelValidator>();
builder.Services.AddScoped<IValidator<CatalogViewModel>, CatalogViewModelValidator>();
// Profile
builder.Services.AddScoped<IValidator<ChangePasswordViewModel>, ChangePasswordViewModelValidator>();
builder.Services.AddScoped<IValidator<PersonalProfileViewModel>, PersonalProfileViewModelValidator>();
builder.Services.AddScoped<IValidator<UpdatePersonalProfileViewModel>, UpdatePersonalProfileViewModelValidator>();

// Custom Rate Limiter (unchanged)
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress.ToString(),
            factory: partion => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 40000,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    options.OnRejected = (context, _) =>
    {
        if (context.HttpContext.Response.HasStarted)
            return new ValueTask();

        context.HttpContext.Response.StatusCode = 429;

        return new ValueTask();
    };
});

var app = builder.Build();

// Localization options (kept)
var supportedCultures = new[] { new CultureInfo("ru"), new CultureInfo("en") };
var requestLocalizationOptions = new RequestLocalizationOptions
{
    DefaultRequestCulture = new Microsoft.AspNetCore.Localization.RequestCulture("ru"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
};
app.UseRequestLocalization(requestLocalizationOptions);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();

app.UseHsts();

app.UseCors("CorsPolicy");

app.UseRouting();

app.UseStatusCodePages();

app.UseRateLimiter();


app.UseAuthentication();
app.UseAuthorization();

// Map attribute-routed API controllers
app.MapControllers();

app.Run();
