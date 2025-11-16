namespace CodeSparkNET.Application.Dtos.Account.Auth
{
    public record RegisterRequest(string UserName, string Email, string Password, bool CondirmAd);
}
