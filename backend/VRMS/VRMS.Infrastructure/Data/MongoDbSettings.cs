using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VRMS.Infrastructure.Data
{
    public class MongoDbSettings
    {
        public string? ConnectionString { get; set; }
        public string? DatabaseName { get; set; }
        public string? VehicleHistoryCollection { get; set; }
        public string? VehiclePostConditionCollection { get; set; }
        public string? VehicleRatingCollection { get; set; }
        public string? VehiclePreConditionCollection { get; set; }
    }
}
