namespace CodeSparkNET.WEB.ViewModels.Account
{
    public class RegisterViewModel
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public bool ConfirmToS { get; set; }
        public bool ConfirmAd { get; set; }
    }
}
