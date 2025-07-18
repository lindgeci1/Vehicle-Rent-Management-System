using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VRMS.Infrastructure.Data;
using System;

namespace VRMS.Controllers
{
    [Route("api/gps")]
    [ApiController]
    public class GpsController : ControllerBase
    {
        private readonly VRMSDbContext _context;

        public GpsController(VRMSDbContext context)
        {
            _context = context;
        }

        [HttpGet("history/active")]
        public async Task<IActionResult> GetHistoryForPickedUpVehicles()
        {
            var activeVehicleIds = await _context.Reservations
                .Where(r => r.PickedUp && !r.BroughtBack)
                .Select(r => r.VehicleId)
                .Distinct()
                .ToListAsync();

            var data = await _context.VehicleGpsHistories
                .Where(g => activeVehicleIds.Contains(g.VehicleId))
                .OrderBy(g => g.Timestamp)
                .Select(g => new
                {
                    g.VehicleId,
                    g.Latitude,
                    g.Longitude,
                    g.Timestamp,
                    g.Vehicle.Mark,
                    g.Vehicle.Model
                })
                .ToListAsync();

            return Ok(data);
        }


    }
}