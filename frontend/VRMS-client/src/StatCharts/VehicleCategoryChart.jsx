import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { LineChart } from "@mui/x-charts/LineChart";
import { api } from "@/apiClient";  // ← use centralized client

function VehicleCategoryChart({ height = 260 }) {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const response = await api.get("/vehicles/vehicles");  // ← swapped axios

        const categoryMap = {};
        (response.data.$values || response.data).forEach(vehicle => {
          const category = vehicle.category || "Unknown";
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });

        const sorted = Object.keys(categoryMap).sort();
        setCategories(sorted);
        setCounts(sorted.map(cat => categoryMap[cat]));
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
      }
    };

    fetchVehicleData();
  }, []);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Vehicles by Category
      </Typography>
      <LineChart
        xAxis={[{ scaleType: "point", data: categories }]}
        series={[
          {
            data: counts,
            label: "Vehicles",
            color: "#64748B", // Tailwind blue-gray-500
          },
        ]}
        width={undefined}
        height={height}
      />
    </Card>
  );
}

export default VehicleCategoryChart;
