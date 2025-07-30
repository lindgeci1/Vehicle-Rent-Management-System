import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { PieChart } from "@mui/x-charts/PieChart";
import { api } from "@/apiClient";

export default function VehicleTypePieChart({ userId, height = 260 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const resReservations = await api.get("/reservations/reservations");
        const reservations = (resReservations.data.$values || resReservations.data).filter(
          (r) => r.customerId === Number(userId)
        );

        const resVehicles = await api.get("/vehicles/vehicles");
        const vehicles = resVehicles.data.$values || resVehicles.data;

        const vehicleMap = {};
        vehicles.forEach((v) => {
          vehicleMap[v.vehicleId] = v;
        });

        const counts = {};
        reservations.forEach((r) => {
          const vehicle = vehicleMap[r.vehicleId];
          const category = vehicle?.category || "Unknown";
          counts[category] = (counts[category] || 0) + 1;
        });

        const pieData = Object.entries(counts).map(([label, value], i) => ({
          id: i,
          label,
          value,
        }));

        setData(pieData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (userId) fetchData();
  }, [userId]);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Reservations by Vehicle Type
      </Typography>
      <PieChart
        series={[
          {
            data,
            innerRadius: 30,
            outerRadius: 80,
            paddingAngle: 5,
            cornerRadius: 4,
          },
        ]}
        width={undefined}
        height={height}
      />
      <div className="mt-1 border-t pt-1 flex justify-between items-center">
      <Typography
        variant="small"
        color="blue-gray"
        className="mt-4 px-2 text-center text-sm italic"
      >
        This chart shows the distribution of your reservations by vehicle category,
        helping you see which types of vehicles you prefer to rent.
      </Typography>
      </div>
    </Card>
  );
}
