namespace CodeSparkNET.Domain.Shared
{
    public static class General
    {
        public static Error ValueIsInvalid(string? name = null)
        {
            var forName = name ?? "Value";

            return Error.Validation($"'{forName}' is invalid");
        }

        public static Error ValueIsEmpty(string? name = null)
        {
            var forName = name ?? "Value";

            return Error.Validation($"{name} can not be empty.");
        }

        public static Error NotFound(Guid? id = null)
        {
            string forId = id is null
                ? ""
                : $" by id = {id}";

            return Error.NotFound($"Record not found{forId}");
        }

        public static Error AccessIsDenied(Guid? userId = null)
        {
            var forId = userId is null ? "" : $" by id = {userId}";

            return Error.Forbidden($"User{forId} access is denied");
        }

        public static Error ValueIsInvalidLength(string? name = null)
        {
            string forName = name is null
                ? " "
                : " " + name + " ";

            return Error.Validation($"Invalid{forName}length");
        }

        public static Error AlreadyExist(string name = "")
        {
            return Error.Validation($"Value {name} already exist");
        }
    }

    public static class Auth
    {
        public static Error NotFoundByToken()
        {
            return Error.NotFound($"Record not found by token");
        }

        public static Error IsVerified(Guid userId)
        {
            return Error.Validation($"User by {userId} is verified");
        }
    }
}
