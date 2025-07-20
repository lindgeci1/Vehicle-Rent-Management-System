import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { api } from "@/apiClient";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

// Helper: Split reservation days properly across months
function addUsageByMonth(usageMap, startDate, endDate) {
  let current = dayjs(startDate);
  const lastDay = dayjs(endDate);

  while (current.isBefore(lastDay) || current.isSame(lastDay, "day")) {
    const endOfMonth = current.endOf("month");
    const segmentEnd = endOfMonth.isBefore(lastDay) ? endOfMonth : lastDay;

    const daysInSegment = segmentEnd.diff(current, "day") + 1;
    const monthKey = current.format("MMM YYYY");

    usageMap[monthKey] = (usageMap[monthKey] || 0) + daysInSegment;

    current = segmentEnd.add(1, "day");
  }
}

export default function VehicleUsagePercentageChart({ userId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await api.get("/reservations/reservations");
        const reservations = (res.data.$values || res.data).filter(
          (r) => Number(r.customerId) === Number(userId)
        );

        const usageByMonth = {};

        reservations.forEach((r) => {
          if (!r.startDate || !r.endDate) return;
          if (!dayjs(r.startDate).isValid() || !dayjs(r.endDate).isValid()) return;

          addUsageByMonth(usageByMonth, r.startDate, r.endDate);
        });

        // Prepare data for last 12 months (including current)
        const now = dayjs();
        const months = [];
        for (let i = 11; i >= 0; i--) {
          const m = now.subtract(i, "month");
          const key = m.format("MMM YYYY");
          const daysInMonth = m.daysInMonth();
          const usedDays = usageByMonth[key] || 0;
          const usagePercent = (usedDays / daysInMonth) * 100;

          months.push({
            month: key,
            usedDays,
            daysInMonth,
            usagePercent: Math.round(usagePercent * 10) / 10, // round to 1 decimal
          });
        }

        setData(months);
      } catch (error) {
        console.error("Error fetching vehicle usage data:", error);
      }
    }

    if (userId) fetchUsage();
  }, [userId]);

  return (
    <Card className="p-4 shadow-sm rounded-md border border-blue-gray-100">
      <Typography variant="h6" className="mb-4">
        Vehicle Usage Percentage (Last 12 Months)
      </Typography>

      {data.length === 0 ? (
        <div className="text-center text-gray-600 italic">Loading chart...</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                label={{ value: "Usage %", angle: -90, position: "insideLeft", offset: 10 }}
              />
              <Tooltip
                formatter={(value, name, props) => {
                  if (name === "usagePercent") {
                    const { payload } = props;
                    return [
                      `${value}% (${payload.usedDays} of ${payload.daysInMonth} days)`,
                      "Usage",
                    ];
                  }
                  return value;
                }}
              />
              <Bar dataKey="usagePercent" fill="#4f46e5" radius={[5, 5, 0, 0]}>
                <LabelList dataKey="usagePercent" position="top" formatter={(val) => `${val}%`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Typography
            variant="small"
            color="blue-gray"
            className="mt-4 px-2 text-center text-sm italic"
          >
            This bar chart shows the percentage of days you reserved vehicles each month over the past year,
            indicating your vehicle usage relative to the total days available per month.
          </Typography>
        </>
      )}
    </Card>
  );
}
