using VRMS.Application.Enums;

namespace VRMS.Application.ErrorModelException
{
    [Serializable]
    public sealed class AccessForbiddenException(string message) : Exception(message)
    {
        public ErrorCode Code => ErrorCode.AccessForbidden;
    }
}
