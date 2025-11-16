namespace CodeSparkNET.Application.Dtos.Account.Profile
{
    public record UserProfileResponse(
        string Id,
        string UserName,
        string Email,
        string Roles,
        DateTime? EmailAddAt,
        DateTime? EmailConfirmedAt,
        DateTime? EmailChangedAt,
        List<AllUserCoursesDto> AllUserCourses);
}
