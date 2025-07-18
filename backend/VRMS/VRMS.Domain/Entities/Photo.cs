using System;

namespace VRMS.Domain.Entities
{
    public class Photo
    {
        public Photo(int photoId, string url, string publicId, int vehicleId)
        {
            PhotoId = photoId;
            Url = url;
            PublicId = publicId;
            VehicleId = vehicleId;
        }

        public int PhotoId { get; set; }
        public string Url { get; set; }
        public string PublicId { get; set; }
        public int VehicleId { get; set; }
        public Vehicle Vehicle { get; set; }
    }
}