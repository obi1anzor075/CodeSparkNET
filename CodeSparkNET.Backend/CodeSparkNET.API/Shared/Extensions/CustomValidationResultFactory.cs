using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Results;

namespace CodeSparkNET.API.Shared.Extensions;

public class CustomValidationResultFactory : IFluentValidationAutoValidationResultFactory
{
    public IActionResult CreateActionResult(ActionExecutingContext context, ValidationProblemDetails? validationProblemDetails)
    {
        IDictionary<string, string[]> errors = validationProblemDetails?.Errors ??
                                               new Dictionary<string, string[]>();

        if (errors == null || errors.Count == 0)
        {
            errors = context.ModelState
                .Where(kv => kv.Value != null && kv.Value.Errors.Count > 0)
                .ToDictionary(
                    kv => kv.Key ?? string.Empty,
                    kv => kv.Value.Errors
                                .Select(e => e.ErrorMessage)
                                .Where(s => !string.IsNullOrEmpty(s))
                                .ToArray()
                );
        }

        var problem = new ValidationProblemDetails(errors)
        {
            Title = "Validation failed",
            Status = StatusCodes.Status400BadRequest,
            Detail = "One or more validation errors occurred. See the 'errors' property for details.",
            Instance = context.HttpContext?.Request?.Path
        };

        problem.Extensions["traceId"] = Activity.Current?.Id ?? context.HttpContext?.TraceIdentifier;

        var result = new ObjectResult(problem)
        {
            StatusCode = StatusCodes.Status400BadRequest
        };

        result.ContentTypes.Add("application/problem+json");

        return result;
    }
}
