using VRMS.Application.Enums;

namespace VRMS.Application.ErrorModelException
{
    [Serializable]
    public sealed class BadArgumentException(string message) : Exception(message)
    {
        public ErrorCode Code => ErrorCode.BadArgument;
    }
}
