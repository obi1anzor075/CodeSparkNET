namespace CodeSparkNET.Application.Dtos.Account.Profile
{
    public record UserProfileRequest(
        string UserName,
        string Email,
        string Roles,
        DateTime? EmailAddAt,
        DateTime? EmailConfirmedAt,
        DateTime? EmailChangedAt,
        List<AllUserCoursesDto> AllUserCourses);

    public record UserProfileFullRequest(
        string UserId,
        string UserName,
        string Email,
        string Roles,
        DateTime? EmailAddAt,
        DateTime? EmailConfirmedAt,
        DateTime? EmailChangedAt,
        List<AllUserCoursesDto> AllUserCourses);
}
