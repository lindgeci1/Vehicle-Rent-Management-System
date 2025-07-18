using VRMS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace VRMS.Domain.Infra.Interfaces
{
    public interface IVehicleRepository
    {

        Task<IEnumerable<Vehicle>> GetAllVehicles();

        Task<Vehicle> GetVehicleById(int vehicleId);
        Task DeleteVehicle(int vehicleId);
        Task UpdateVehicle(Vehicle vehicle);


        //per foto kto
        Task AddPhoto(Photo photo);
        Task DeletePhotosByVehicleId(int vehicleId);

        //qesaj kshyri qa mi bo
        //Task<Vehicle> GetByIdWithPhotos(int vehicleId);
    }
}
