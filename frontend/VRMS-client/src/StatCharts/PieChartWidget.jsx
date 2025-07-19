import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { PieChart } from "@mui/x-charts/PieChart";
import { api } from "@/apiClient";

function PieChartWidget({ height = 260 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await api.get("/vehicles/vehicles");
        const vehicles = response.data.$values || response.data;

        const fuelTypeMap = {};
        vehicles.forEach(vehicle => {
          const fuel = vehicle.fuelType || "Unknown";
          fuelTypeMap[fuel] = (fuelTypeMap[fuel] || 0) + 1;
        });

        const pieData = Object.entries(fuelTypeMap).map(([fuel, count], index) => ({
          id: index,
          value: count,
          label: fuel,
        }));

        setData(pieData);
      } catch (error) {
        console.error("Error fetching fuel type data:", error);
      }
    };

    fetchVehicleData();
  }, []);

  return (
     <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
          <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Vehicles by Fuel Type
      </Typography>
      <PieChart
        series={[{
          data,
          innerRadius: 30,
          outerRadius: 80,
          paddingAngle: 5,
          cornerRadius: 4,
        }]}
        width={undefined}
        height={height}
      />
    </Card>
  );
};

export default PieChartWidget;
