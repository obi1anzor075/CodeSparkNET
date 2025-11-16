using CodeSparkNET.Application.Dtos.Account;
using CodeSparkNET.WEB.ViewModels.Account;

namespace CodeSparkNET.WEB.Mappers.Account
{
    public static class RegisterMapper
    {
        public static RegisterDto ToDto(this RegisterViewModel model)
        {
            if (model == null) return null;
            return new RegisterDto
            {
                UserName = model.UserName.Trim(),
                Email = model.Email.Trim().ToLowerInvariant(),
                Password = model.Password,
                ConfirmPassword = model.ConfirmPassword,
                ConfirmToS = model.ConfirmToS,
                ConfirmAd = model.ConfirmAd
            };
        }
    }
}
