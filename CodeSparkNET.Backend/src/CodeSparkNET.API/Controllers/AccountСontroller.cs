using CodeSparkNET.Application.Services.User;
using CodeSparkNET.Domain.Models;
using CodeSparkNET.WEB.Mappers.Account;
using CodeSparkNET.WEB.ViewModels.Account;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharpGrip.FluentValidation.AutoValidation.Mvc.Attributes;
using System.Diagnostics;
using System.Security.Claims;

namespace CodeSparkNET.WEB.Controllers
{
    /// <summary>
    /// Controller responsible for handling account-related actions such as registration, login, and password management.
    /// </summary>
    [Authorize]
    [AutoValidation]
    public class AccountController : Controller
    {
        private readonly IAccountService _accountService;
        private readonly ILogger<AccountController> _logger;

        public AccountController(
            IAccountService accountService,
            ILogger<AccountController> logger
            )
        {
            _accountService = accountService;
            _logger = logger;
        }

        /// <summary>
        /// Show register page
        /// </summary>
        /// <returns>A view for the register page.</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Register()
        {
            if (User?.Identity?.IsAuthenticated is true)
                return RedirectToAction("Index", "Home");

            return View();
        }

        /// <summary>
        /// Register user
        /// </summary>
        /// <param name="registerDto">The data transfer object containing the user's registration details.</param>
        /// <returns>A view for the registration page.</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register([FromForm] RegisterViewModel viewModel)
        {
            try
            {
                if (!ModelState.IsValid) return View(viewModel);

                var model = viewModel.ToDto();

                if (model.ConfirmToS != true)
                {
                    ModelState.AddModelError(string.Empty, "Вы не согласились с условиями использования.");
                    return View(viewModel);
                }

                var loginLink = Url.Action("Login", "Account", null, Request.Scheme);

                var result = await _accountService.RegisterAsync(model, loginLink);
                if (!result.Succeeded)
                {
                    foreach (var err in result.Errors)
                        ModelState.AddModelError(string.Empty, err.Description);
                    return View(viewModel);
                }

                _logger.LogInformation("Registered: {Email}", model.Email);

                return RedirectToAction("Login", "Account");
            }
            catch (Exception ex)
            {
                var model = viewModel.ToDto();
                _logger.LogError(ex,"{Email} has error with registering", model.Email);
                return View(viewModel);
            }
        }

        /// <summary>
        /// Show login page
        /// </summary>
        /// <returns>A view for the login page.</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Login()
        {
            if (User?.Identity?.IsAuthenticated is true)
                return RedirectToAction("Index", "Home");

            return View();
        }

        /// <summary>
        /// Login user
        /// </summary>
        /// <param name="loginViewModel">The data transfer object containing the user's login credentials.</param>
        /// <returns>A view for the login page.</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login([FromForm] LoginViewModel viewModel)
        {
            try
            {
                if (!ModelState.IsValid) return View(viewModel);

                var dto = viewModel.ToDto();

                var signResult = await _accountService.PasswordSignInAsync(dto);
                if (signResult.IsLockedOut)
                {
                    ModelState.AddModelError(string.Empty, "Ваша учетная запись временно заблокирована. Попробуйте позже.");
                    _logger.LogInformation("{Email} is locked out", dto.Email);
                    return View(viewModel);
                }

                if (!signResult.Succeeded)
                {
                    ModelState.AddModelError(string.Empty, "Неверные данные для входа.");
                    return View(viewModel);
                }

                _logger.LogInformation("Logged in: {Email}", dto.Email);

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                var dto = viewModel.ToDto();
                _logger.LogError(ex,"{Email} has error with logging", dto.Email);
                return View(viewModel);
            }
        }

        /// <summary>
        /// Logout user
        /// </summary>
        /// <returns>A redirect to the home page after logging out.</returns>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            try
            {
                // Clear cached user data on logout
                var email = User.Identity?.Name;
                if (!string.IsNullOrEmpty(email))
                {
                    // await _cacheService.ClearCachedUserAsync(email);
                }

                await _accountService.SignOutAsync();

                _logger.LogInformation("Logged out: {Email}", email);

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                var email = User.FindFirst(ClaimTypes.Email);
                _logger.LogError(ex, "{Email} has error with signing out", email);
                return View();
            }
        }

        /// <summary>
        /// Show forgot password page
        /// </summary>
        /// <returns>A view for the forgot password page.</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        /// <summary>
        /// Send password reset link to user email
        /// </summary>
        /// <param name="model">The data transfer object containing the email for which the password reset link is requested.</param>
        /// <returns>A view for requesting a password reset.</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword([FromForm] ForgotPasswordViewModel viewModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var modelErrors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToArray();

                    return BadRequest(new { success = false, errors = modelErrors });
                }
                
                var dto = viewModel.ToDto();

                await _accountService.SendPasswordResetLinkAsync(dto.Email);

                _logger.LogInformation("{Email} successfully requested shange password letter", dto.Email);

                return Json(new { success = true, message = "Проверьте вашу почту." });

            }
            catch (Exception ex)
            {
                var dto = viewModel.ToDto();
                _logger.LogError(ex, "{Email} has error with request change password letter", dto.Email);
                return Json(new {success = false, message = "Ошибка запроса. Попробуйт позже."});
            }
        }

        /// <summary>
        /// Show reset password page
        /// </summary>
        /// <param name="email">The email address associated with the account for which the password is being reset.</param>
        /// <param name="token">The token used to verify the password reset request.</param>
        /// <returns>A view for resetting the password with pre-filled email and token.</returns>
        [HttpGet]
        [AllowAnonymous]
        public IActionResult ResetPassword(string email, string token)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
                return BadRequest("Ошибка сброса пароля");

            var vm = new ResetPasswordViewModel
            {
                Email = email,
                Token = token
            };
            return View(vm);
        }


        /// <summary>
        /// Reset user password
        /// </summary>
        /// <param name="model">The data transfer object containing the email, token, and new password.</param>
        /// <returns>A JSON response indicating the success or failure of the password reset operation.</returns>
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword([FromForm] ResetPasswordViewModel viewModel)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var modelErrors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToArray();

                    return BadRequest(new { success = false, errors = modelErrors });
                }

                var model = viewModel.ToDto();

                var result = await _accountService.ResetPasswordAsync(model);
                if (result.Succeeded)
                {
                    _logger.LogInformation("{Email} successfully changed password", model.Email);
                    TempData["SuccessMessage"] = "Пароль успешно восстановлен.";
                    return RedirectToAction("Index", "Home");
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();
                return BadRequest(new { success = false, errors });
            }
            catch (Exception)
            {
                var model = viewModel.ToDto();
                _logger.LogError("{Email} has errorrs with changing password", model.Email);
                return BadRequest(new { success = false });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}