using VRMS.Application.Enums;

namespace VRMS.Application.ErrorModelException
{
    [Serializable]
    public sealed class NotFoundException(string message) : Exception(message)
    {
        public ErrorCode Code => ErrorCode.ItemNotFound;
    }
}
