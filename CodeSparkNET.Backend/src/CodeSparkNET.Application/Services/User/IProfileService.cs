using CodeSparkNET.Application.Dtos.Account.Profile;
using CodeSparkNET.Application.Dtos.Profile;
using CodeSparkNET.Domain.Models;
using Microsoft.AspNetCore.Identity;

namespace CodeSparkNET.Application.Services.User
{
    public interface IProfileService
    {
        Task<IdentityResult> UpdatePersonalProfileAsync(string email, UpdatePersonalProfileDto personalProfile);
        Task<bool> SendEmailConfirmationLinkAsync(string email);
        Task<IdentityResult> ChangePasswordAsync(string email, ChangePasswordDto model);
        Task UpdateUserClaims(AppUser user);
        Task<List<AllUserCoursesDto>> GetAllUserCoursesAsync(AppUser user);
    }
}