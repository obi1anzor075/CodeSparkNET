using CodeSparkNET.Application.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace CodeSparkNET.WEB.Controllers
{
    [AllowAnonymous]
    [DisableRateLimiting]
    public class ErrorController : Controller
    {
        /// <summary>
        /// Returns an error view for a specific HTTP status code with a localized message and action.
        /// </summary>
        /// <param name="statusCode">The HTTP status code to display.</param>
        /// <returns>Error view with details for the specified status code.</returns>
        [Route("Error/StatusCode/{statusCode}")]
        public IActionResult StatusCode(int statusCode)
        {
            var model = new ErrorDto { StatusCode = statusCode };

            switch (statusCode)
            {
                case 400:
                    model.Title = "Некорректный запрос";
                    model.Message = "Похоже, запрос повреждён или содержит неверные параметры. Попробуйте ещё раз.";
                    model.ActionText = "Назад";
                    model.ActionUrl = "javascript:history.back()";
                    break;
                case 401:
                    model.Title = "Требуется вход";
                    model.Message = "Для доступа к этой странице необходимо войти.";
                    model.ActionText = "Войти";
                    model.ActionUrl = "/Account/Login";
                    break;
                case 403:
                    model.Title = "Доступ запрещён";
                    model.Message = "У вас нет прав для просмотра этой страницы.";
                    model.ActionText = "На главную";
                    model.ActionUrl = "/Home/Index";
                    break;
                case 404:
                    model.Title = "Страница не найдена";
                    model.Message = "Запрошенная страница не найдена. Возможно, она была удалена или вы ошиблись в адресе.";
                    model.ActionText = "Вернуться домой";
                    model.ActionUrl = "/Home/Index";
                    break;
                case 408:
                    model.Title = "Время ожидания истекло";
                    model.Message = "Запрос занял слишком много времени. Попробуйте обновить страницу.";
                    model.ActionText = "Обновить";
                    model.ActionUrl = "javascript:location.reload()";
                    break;
                case 429:
                    model.Title = "Слишком много запросов";
                    model.Message = "Вы отправили слишком много запросов за короткое время. Подождите немного и попробуйте снова.";
                    model.ActionText = "На главную";
                    model.ActionUrl = "/Home/Index";
                    break;
                case 500:
                    model.Title = "Внутренняя ошибка сервера";
                    model.Message = "Произошла ошибка на сервере. Мы уже работаем над этим.";
                    model.ActionText = "Попробовать снова";
                    model.ActionUrl = "javascript:location.reload()";
                    break;
                case 502:
                case 503:
                case 504:
                    model.Title = "Сервис временно недоступен";
                    model.Message = "Сервис временно недоступен. Попробуйте немного позже.";
                    model.ActionText = "Обновить";
                    model.ActionUrl = "javascript:location.reload()";
                    break;
                default:
                    model.Title = $"Ошибка {statusCode}";
                    model.Message = "Произошла ошибка. Попробуйте позже или свяжитесь с поддержкой.";
                    model.ActionText = "На главную";
                    model.ActionUrl = "/Home/Index";
                    break;
            }

            Response.StatusCode = statusCode;
            return View("Error", model);
        }

        /// <summary>
        /// Returns a generic error view for unexpected server errors (HTTP 500).
        /// </summary>
        /// <returns>Error view with default error details.</returns>
        [Route("/Error")]
        public IActionResult Error()
        {
            var model = new ErrorDto
            {
                StatusCode = 500,
                Title = "Внутренняя ошибка",
                Message = "Произошла непредвиденная ошибка.",
                ActionText = "На главную",
                ActionUrl = "/Home/Index"
            };

            Response.StatusCode = 500;
            return View("Error", model);
        }
    }
}
