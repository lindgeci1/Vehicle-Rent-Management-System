import React, { useEffect, useState } from "react";
import { Typography, Card } from "@material-tailwind/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"; // <-- import Cell
import { api } from "@/apiClient";

function ReservationStatusBarChart({ height = 260 }) {
  const statusLabels = {
    0: "Pending",
    1: "Reserved",
    2: "Conflict",
  };

const statuses = [
  { label: "Pending", color: "#FCD34D" },   // lighter amber
  { label: "Reserved", color: "#6EE7B7" },  // lighter green
  { label: "Conflict", color: "#FCA5A5" },  // lighter red
];


  const [data, setData] = useState([
    { label: "Pending", count: 0, color: "#F59E0B" },
    { label: "Reserved", count: 0, color: "#10B981" },
    { label: "Conflict", count: 0, color: "#EF4444" },
  ]);

  useEffect(() => {
    async function fetchReservationData() {
      try {
        const response = await api.get("/reservations/reservations");
        const reservations = response.data.$values || response.data;

        const statusCountMap = { Pending: 0, Reserved: 0, Conflict: 0 };

        reservations.forEach((r) => {
          const label = statusLabels[r.status];
          if (label && statusCountMap.hasOwnProperty(label)) {
            statusCountMap[label]++;
          }
        });

        setData(statuses.map((s) => ({
          label: s.label,
          count: statusCountMap[s.label] || 0,
          color: s.color,
        })));
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    }

    fetchReservationData();
  }, []);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography className="mb-3 text-base font-semibold text-blue-gray-800">
        Reservation Status Overview
      </Typography>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default ReservationStatusBarChart;
