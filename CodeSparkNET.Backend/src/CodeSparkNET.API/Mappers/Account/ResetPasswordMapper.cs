using CodeSparkNET.Application.Dtos.Account;
using CodeSparkNET.WEB.ViewModels.Account;

namespace CodeSparkNET.WEB.Mappers.Account
{
    public static class ResetPasswordMapper
    {
        public static ResetPasswordDto ToDto(this ResetPasswordViewModel model)
        {
            if (model == null) return null;
            return new ResetPasswordDto
            {
                Email = model.Email.Trim().ToLowerInvariant(),
                Password = model.Password,
                ConfirmPassword = model.ConfirmPassword,
                Token = model.Token
            };
        }
    }
}
