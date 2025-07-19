import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { api } from "@/apiClient";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore); 

const getUniqueVehiclePerDayMap = (reservations) => {
  const dayMap = {};

  // Filter only reserved reservations
  const reservedReservations = reservations.filter(
     (res) => res.status === 1
  );

  reservedReservations.forEach((res) => {
    const vehicleId = res.vehicleId;
    const start = dayjs(res.startDate);
    const end = dayjs(res.endDate);

    let current = start;

    while (current.isSameOrBefore(end, 'day')) {
      const dateStr = current.format("YYYY-MM-DD");
      if (!dayMap[dateStr]) dayMap[dateStr] = new Set();
      dayMap[dateStr].add(vehicleId);

      current = current.add(1, 'day');
    }
  });

  // Convert sets to counts
  const countMap = {};
  for (const date in dayMap) {
    countMap[date] = dayMap[date].size;
  }

  return countMap;
};




const getColorClass = (count) => {
  if (count >= 15) return "bg-teal-900 text-white";
  if (count >= 12) return "bg-teal-700 text-white";
  if (count >= 10) return "bg-green-900 text-white";
  if (count >= 8) return "bg-green-700 text-white";
  if (count >= 6) return "bg-green-600 text-white";
  if (count >= 4) return "bg-green-400 text-gray-800";
  if (count >= 2) return "bg-green-200 text-gray-800";
  if (count >= 1) return "bg-green-100 text-gray-800";
  return "bg-gray-100 text-gray-500";
};


const VehicleUtilizationCalendar = () => {
  const [vehicleDayMap, setVehicleDayMap] = useState({});

const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
const startOfMonth = currentMonth.startOf("month");
const endOfMonth = currentMonth.endOf("month");


  useEffect(() => {
    async function fetchReservations() {
      try {
        const res = await api.get("/reservations/reservations");
        const data = res.data?.$values || res.data || [];
        const countMap = getUniqueVehiclePerDayMap(data);
        setVehicleDayMap(countMap);
      } catch (err) {
        console.error("Failed to fetch reservations", err);
      }
    }

    fetchReservations();
  }, []);

const renderCalendar = () => {
  const days = [];
  const startDay = currentMonth.startOf("month");  // add this line
  const totalDays = currentMonth.daysInMonth(); // safer way to get days count

  for (let i = 0; i < totalDays; i++) {
    const date = startDay.add(i, "day");
    const key = date.format("YYYY-MM-DD");
    const count = vehicleDayMap[key] || 0;
    const colorClass = getColorClass(count);

    days.push(
      <div
        key={key}
        title={`${count} vehicle${count !== 1 ? "s" : ""} reserved`}
        className={`flex items-center justify-center h-10 w-10 rounded text-sm font-medium ${colorClass}`}
      >
        {date.date()}
      </div>
    );
  }

  return days;
};


return (
  <Card className="p-4 shadow-sm rounded-md border border-gray-200 mb-6">
    <div className="flex justify-between items-center mb-2">
      <button
        onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        Previous
      </button>
      <Typography className="text-base font-semibold text-gray-800">
        Vehicle Utilization – {currentMonth.format("MMMM YYYY")}
      </Typography>
      <button
        onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
        className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        Next
      </button>
    </div>

    <div className="grid grid-cols-7 gap-1">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="text-center text-xs font-medium text-gray-500">
          {day}
        </div>
      ))}
      {renderCalendar()}
    </div>
  </Card>
);

};

export default VehicleUtilizationCalendar;
