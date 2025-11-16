using CodeSparkNET.API.Shared.Extensions;
using CodeSparkNET.Application;
using CodeSparkNET.Infrastructure;
using Microsoft.EntityFrameworkCore;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Extensions;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services to the container.
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

builder.Services.AddHttpContextAccessor();

// Add DbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("Sql"));
});

// Infrastructure / Application services
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

// Add FluentValidation automatic validation (works for API model binding)
builder.Services.AddFluentValidationAutoValidation(conf =>
{
    conf.OverrideDefaultResultFactoryWith<CustomValidationResultFactory>();
});

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

builder.Services.AddCors("CorsPolicy");

//builder.WebHost.UseUrls("https://1.1.1.1:3002"); //TODO change

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();