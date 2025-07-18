public static class GpsSimulator
{
    private static readonly Dictionary<int, (double lat, double lng)> _vehiclePositions = new();
    private static readonly Random _rand = new();

    public static (double lat, double lng) GetNextPoint(int vehicleId)
    {
        // Initialize each vehicle with a slightly randomized starting point
        if (!_vehiclePositions.ContainsKey(vehicleId))
        {
            double baseLat = 42.6486;
            double baseLng = 21.1623;
            double deltaLat = (_rand.NextDouble() - 0.5) * 0.02; // up to ±0.01 (~1.1km)
            double deltaLng = (_rand.NextDouble() - 0.5) * 0.02;

            _vehiclePositions[vehicleId] = (baseLat + deltaLat, baseLng + deltaLng);
        }

        var (lat, lng) = _vehiclePositions[vehicleId];

        double moveLat = (_rand.NextDouble() - 0.5) * 0.005;
        double moveLng = (_rand.NextDouble() - 0.5) * 0.005;

        lat += moveLat;
        lng += moveLng;

        _vehiclePositions[vehicleId] = (lat, lng);
        return (lat, lng);
    }


    public static void ClearVehicle(int vehicleId)
    {
        _vehiclePositions.Remove(vehicleId);
    }
}
