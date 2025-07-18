// VRMS.Api/Services/PhotoService.cs
using System.IO;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using VRMS.Application.Interface;

namespace VRMS.Api.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;

        public PhotoService(IConfiguration config)
        {
            // Expects CLOUDINARY_URL in env or config
            _cloudinary = new Cloudinary();
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName, string publicId)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                PublicId = publicId
            };
            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.SecureUrl.ToString();
        }

        public async Task<bool> DeleteAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);
            return result.Result == "ok"; // you can log or throw if not
        }
    }
}
