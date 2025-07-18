import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { api } from "@/apiClient";

function VehicleFuelTypeChart({ height = 260 }) {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await api.get("/vehicles/vehicles");

        const vehicles = response.data.$values || response.data;
        const fuelMap = {};

        vehicles.forEach(vehicle => {
          const fuel = vehicle.fuelType || "Unknown";
          fuelMap[fuel] = (fuelMap[fuel] || 0) + 1;
        });

        const sortedFuelEntries = Object.entries(fuelMap).sort((a, b) => b[1] - a[1]);
        const sortedFuelTypes = sortedFuelEntries.map(([type]) => type);
        const sortedCounts = sortedFuelEntries.map(([, count]) => count);

        setFuelTypes(sortedFuelTypes);
        setCounts(sortedCounts);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    fetchVehicleData();
  }, []);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Vehicles by Fuel Type
      </Typography>
      <LineChart
        xAxis={[{ scaleType: "point", data: fuelTypes }]}
        yAxis={[{ tickMinStep: 1 }]}
        series={[
          {
            data: counts,
            label: "Vehicles",
            color: "#64748B",
          },
        ]}
        width={undefined}
        height={height}
      />
    </Card>
  );
}

export default VehicleFuelTypeChart;
