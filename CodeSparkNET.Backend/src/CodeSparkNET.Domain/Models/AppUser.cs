using Microsoft.AspNetCore.Identity;

namespace CodeSparkNET.Domain.Models
{
    /// <summary>
    /// Represents an application user with extended profile data
    /// in addition to the default ASP.NET IdentityUser fields.
    /// </summary>
    public class AppUser : IdentityUser
    {
        /// <summary>
        /// Full name of the user.
        /// </summary>
        public string? FullName { get; set; }

        /// <summary>
        /// Date and time when the user registered (UTC).
        /// </summary>
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Indicates whether the user has given consent for email marketing.
        /// </summary>
        public bool EmailMarketingConsent { get; set; }

        /// <summary>
        /// Date and time when the email address was added (UTC).
        /// </summary>
        public DateTime EmailAddAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Date and time when the email was confirmed (UTC). 
        /// Default value is DateTime.MinValue if not confirmed.
        /// </summary>
        public DateTime EmailConfirmedAt { get; set; } = DateTime.MinValue;

        /// <summary>
        /// Date and time when the email was last changed (UTC). 
        /// Default value is DateTime.MinValue if never changed.
        /// </summary>
        public DateTime EmailChangedAt { get; set; } = DateTime.MinValue;

        public bool ConfirmAd { get; set; }

        /// <summary>
        /// Navigation property representing the list of courses assigned to the user.
        /// </summary>
        public ICollection<UserCourse> UserCourses { get; set; }
    }
}
