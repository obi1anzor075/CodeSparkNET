using CodeSparkNET.Application.Dtos.Account;
using CodeSparkNET.WEB.ViewModels.Account;

namespace CodeSparkNET.WEB.Mappers.Account
{
    public static class ForgotPasswordMappings
    {
        public static ForgotPasswordDto ToDto(this ForgotPasswordViewModel vm)
        {
            if (vm == null) return null;
            return new ForgotPasswordDto
            {
                Email = vm.Email?.Trim().ToLowerInvariant()
            };
        }
    }
}
