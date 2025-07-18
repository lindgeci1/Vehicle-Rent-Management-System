import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { api } from "@/apiClient";  // ← use centralized client

function VehicleYearChart({ height = 260 }) {
  const [years, setYears] = useState([]);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await api.get("/vehicles/vehicles");  // ← swapped axios

        const vehicles = response.data.$values || response.data;
        const yearMap = {};
        vehicles.forEach(vehicle => {
          const year = vehicle.year;
          yearMap[year] = (yearMap[year] || 0) + 1;
        });

        const sortedYears = Object.keys(yearMap)
          .map(Number)
          .sort((a, b) => a - b)
          .map(String);
        setYears(sortedYears);
        setCounts(sortedYears.map(year => yearMap[year]));
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    fetchVehicleData();
  }, []);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Vehicles by Manufacturing Year
      </Typography>
      <LineChart
        xAxis={[{ scaleType: "point", data: years }]}
        series={[
          {
            data: counts,
            label: "Vehicles",
            color: "#64748B", // blue-gray-500
          },
        ]}
        width={undefined}
        height={height}
      />
    </Card>
  );
}

export default VehicleYearChart;
