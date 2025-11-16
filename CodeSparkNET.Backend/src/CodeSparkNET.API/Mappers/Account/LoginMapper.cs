using CodeSparkNET.Application.Dtos.Account;
using CodeSparkNET.WEB.ViewModels.Account;

namespace CodeSparkNET.WEB.Mappers.Account
{
    public static class LoginMapper
    {
        public static LoginDto ToDto(this LoginViewModel vm)
        {
            if (vm == null) return null;
            return new LoginDto
            {
                Email = vm.Email?.Trim().ToLowerInvariant(),
                Password = vm.Password,
                RememberMe = vm.RememberMe
            };
        }
    }
}
