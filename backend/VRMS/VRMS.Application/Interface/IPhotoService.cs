// VRMS.Application/Interface/IPhotoService.cs
using System.IO;
using System.Threading.Tasks;

namespace VRMS.Application.Interface
{
    public interface IPhotoService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string publicId);
        Task<bool> DeleteAsync(string publicId);
    }
}
