using CodeSparkNET.Application.Dtos.Account.Profile;
using CodeSparkNET.Application.Dtos.Profile;
using CodeSparkNET.Application.Services.Common.Email;
using CodeSparkNET.Domain.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text;

namespace CodeSparkNET.Application.Services.User
{
    public class ProfileService : IProfileService
    {
        private readonly ILogger<ProfileService> _logger;
        private readonly IUserRepository _userRepository;
        private readonly IProductRepository _productRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public ProfileService(
            ILogger<ProfileService> logger,
            IUserRepository userRepository,
            IProductRepository productRepository,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _logger = logger;
            _userRepository = userRepository;
            _productRepository = productRepository;
            _configuration = configuration;
            _emailService = emailService;
        }
        /// <summary>
        /// Updates user's personal profile.
        /// </summary>
        public async Task<IdentityResult> UpdatePersonalProfileAsync(string email, UpdatePersonalProfileDto model)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null && model == null)
                    return null;

                user.UserName = model.UserName;
                user.Email = model.Email;

                if (model.Email != user.Email)
                {
                    user.EmailChangedAt = DateTime.Now;
                }

                return await _userRepository.UpdateUserAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating personal profile for {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Sends email confirmation link.
        /// </summary>
        public async Task<bool> SendEmailConfirmationLinkAsync(string email)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user is null || (await _userRepository.IsEmailConfirmedAsync(user)))
                    return false;

                var token = await _userRepository.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

                var baseUrl = _configuration["AppSettings:BaseUrl"]?.TrimEnd('/');
                var emailEscaped = System.Net.WebUtility.UrlEncode(user.Email);
                var confirmationLink = $"{baseUrl}/Profile/ConfirmEmail/?email={emailEscaped}&token={encodedToken}";

                await _emailService.SendEmailConfirmationAsync(user.Email!, user.UserName, confirmationLink);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending email confirmation link to {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Changes the user's password.
        /// </summary>
        public async Task<IdentityResult> ChangePasswordAsync(string email, ChangePasswordDto model)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                    return null;

                return await _userRepository.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while changing password for {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Updates claims for the user (refreshes sign-in).
        /// </summary>
        public async Task UpdateUserClaims(AppUser user)
        {
            try
            {
                await _userRepository.RefreshSignInAsync(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating claims for {UserName}", user.UserName);
                throw;
            }
        }

        /// <summary>
        /// Retrieves all courses assigned to the specified user and maps them to DTOs.
        /// </summary>
        /// <param name="user">The user whose courses are being retrieved.</param>
        /// <returns>A list of DTOs containing course information and completion status for the user.</returns>
        public async Task<List<AllUserCoursesDto>> GetAllUserCoursesAsync(AppUser user)
        {
            try
            {
                var allUserCourses = await _productRepository.GetAllUserCoursesAsync(user.Id);
                if (allUserCourses == null)
                    return null;

                var allUserCoursesDto = allUserCourses.Select(c => new AllUserCoursesDto
                {
                    Name = c.Name,
                    Slug = c.Slug,
                    IsCompleted = c.UserCourses.Any(uc => uc.UserId == user.Id && uc.IsCompleted)
                }).ToList();

                return allUserCoursesDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while retrieving courses for {UserName}", user.UserName);
                throw;
            }
        }
    }
}
