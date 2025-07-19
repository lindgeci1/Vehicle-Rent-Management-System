import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Card, Typography, Tooltip } from "@material-tailwind/react";
import { api } from "@/apiClient";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
function AdvancedReservationCalendar({ height = 600 }) {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));

  // Palette for reservation backgrounds
  const colors = [
    "#60A5FA", // blue
    "#F87171", // red
    "#34D399", // green
    "#FBBF24", // yellow
    "#A78BFA", // purple
    "#6EE7B7", // teal
  ];

  const getColorForReservation = (reservationId) =>
    colors[reservationId % colors.length];

  useEffect(() => {
    async function fetchData() {
      try {
        const [resReservations, resCustomers, resVehicles] = await Promise.all([
          api.get("/reservations/reservations"),
          api.get("/customers/customers"),
          api.get("/vehicles/vehicles"),
        ]);

        setReservations(
          resReservations.data?.$values || resReservations.data || []
        );
        setCustomers(resCustomers.data?.$values || resCustomers.data || []);
        setVehicles(resVehicles.data?.$values || resVehicles.data || []);
      } catch (error) {
        console.error("Failed fetching data", error);
      }
    }
    fetchData();
  }, []);

  const getCustomerById = (id) => customers.find((c) => c.userId === id);
  const getVehicleById = (id) => vehicles.find((v) => v.vehicleId === id);

const getCalendarDays = () => {
  const startDay = currentMonth.startOf("month");
  const endDay = currentMonth.endOf("month");
  const totalDays = endDay.diff(startDay, "day") + 1;
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(startDay.add(i, "day"));
  }
  return days;
};


const getReservationsForDay = (day) =>
  reservations.filter((res) => {
    if (res.status !== 1) return false; // Only include status === 1
    const start = dayjs(res.startDate);
    const end = dayjs(res.endDate);
    return day.isBetween(start, end, "day", "[]"); // Exact inclusive match
  });


  const getCustomerLabel = (customer) => {
    if (!customer) return "Unknown";
    if (customer.firstName && customer.lastName)
      return `${customer.firstName[0]}${customer.lastName[0]}`;
    return customer.username || `C${customer.userId}`;
  };

  return (
    <Card
      className="p-4 rounded-md border border-gray-200 shadow-sm"
      style={{ height }}
    >
      {/* Month navigation */}
<div className="flex justify-between items-center mb-4">
  <button
    className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 shadow-sm flex items-center justify-center"
    onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
    aria-label="Previous Month"
  >
    <FiChevronLeft size={20} />
  </button>
  <Typography variant="h6" className="font-semibold text-gray-800">
    {currentMonth.format("MMMM YYYY")}
  </Typography>
  <button
    className="text-gray-800 hover:text-blue-600 transition-colors px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 shadow-sm flex items-center justify-center"
    onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
    aria-label="Next Month"
  >
    <FiChevronRight size={20} />
  </button>
</div>


      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-300 pb-2 text-xs font-semibold text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center select-none">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-1 mt-2"
        style={{
          maxHeight: height - 120,
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "#9CA3AF transparent",
        }}
      >
        {getCalendarDays().map((day) => {
          const dayReservations = getReservationsForDay(day);
          const isCurrentMonth = day.month() === currentMonth.month();

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`border rounded p-1 min-h-[100px] flex flex-col justify-start transition-colors duration-150 hover:shadow-md cursor-default ${
                isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"
              }`}
              style={{ height: 110 }}
            >
              <div className="text-lg font-bold mb-1 select-none text-gray-700">{day.date()}</div>


              <div
                className="flex flex-col gap-1 overflow-y-auto"
                style={{ maxHeight: 80 }}
              >
                {dayReservations.length === 0 && (
                  <div className="text-[10px] text-gray-300 italic select-none">
                    No reservations
                  </div>
                )}

                {dayReservations.slice(0, 3).map((res) => {
                  const customer = getCustomerById(res.customerId);
                  const vehicle = getVehicleById(res.vehicleId);
                  const bgColor = getColorForReservation(res.reservationId);

                  return (
                    <Tooltip
                      key={res.reservationId}
                      content={
                        <div>
                          <strong>Vehicle:</strong>{" "}
                          
                          {vehicle ? `${vehicle.mark} ${vehicle.model}` : "Unknown"}
                          <br />
                          <strong>Customer:</strong>{" "}
                          {customer
                            ? `${customer.username}`
                            : "Unknown"}
                          <br />
                          <strong>Reservation ID:</strong> {res.reservationId}
                          <br />
                          <strong>Start:</strong>{" "}
                          {dayjs(res.startDate).format("YYYY-MM-DD")}
                          <br />
                          <strong>End:</strong> {dayjs(res.endDate).format("YYYY-MM-DD")}
                        </div>
                      }
                      placement="top"
                      animate={{ mount: { duration: 200 }, unmount: { duration: 200 } }}
                      delay={200}
                    >
                      <div
                        className="text-[11px] px-1 rounded cursor-default select-none truncate shadow-sm hover:shadow-md transition-shadow duration-200"
                        style={{ backgroundColor: bgColor }}
                        title={`Vehicle: ${
                            vehicle ? `${vehicle.mark} ${vehicle.model}` : "Unknown"
                        } reserved by Customer: ${
                            customer ? `${customer.username}` : "Unknown"
                        }`}
                        >
                        <span className="text-black">
                            {vehicle ? vehicle.mark : `V${res.vehicleId}`} -{" "}
                            {customer ? getCustomerLabel(customer) : `C${res.customerId}`}
                        </span>
                        </div>

                    </Tooltip>
                  );
                })}

                {dayReservations.length > 3 && (
                  <div
                    className="text-xs text-blue-600 cursor-pointer select-none"
                    onClick={() =>
                      alert(
                        `There are ${dayReservations.length} reservations on ${day.format(
                          "YYYY-MM-DD"
                        )}. Implement a modal or popup to show full list!`
                      )
                    }
                  >
                    +{dayReservations.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default AdvancedReservationCalendar;
