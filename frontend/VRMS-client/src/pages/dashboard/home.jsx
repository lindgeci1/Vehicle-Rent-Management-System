import React from "react";
import VehicleCategoryChart from "../../StatCharts/VehicleCategoryChart";
import VehicleYearChart from "../../StatCharts/VehicleYearChart";
import PieChartWidget from "../../StatCharts/PieChartWidget";
import ReservationStatusBarChart from "../../StatCharts/ReservationStatusBarChart";
import VehicleUtilizationCalendar from "../../StatCharts/CalendarChartWidget";
import AdvancedReservationCalendar from "../../StatCharts/NewChartComponent";
import CountCustomerView from "../../StatCharts/CountCustomerView";
import ReservationStatusChart from "../../StatCharts/ReservationStatusChart";
import VehicleUsageChart from "../../StatCharts/VehicleUsageChart";
import CustomerProfileCard from "../../StatCharts/ProfileWelcomeCard";


import Cookies from "js-cookie";
import { decodeToken } from "../../../decodeToken"; 

export function Home() {
  const token = Cookies.get("token");
  const role = decodeToken(token)?.role;
  const userId = decodeToken(token)?.userId;

return (
  <div className="mt-8 px-6">
    {role === "Customer" ? (

    <div className="space-y-8">
     <div>
      <CustomerProfileCard />
    </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReservationStatusChart userId={userId} />
        <VehicleUsageChart userId={userId} />
      </div>

      <div>
        <CountCustomerView />
      </div>
    </div>
    ) : (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <VehicleCategoryChart height={200} />
          </div>
          <div className="h-[200px]">
            <VehicleYearChart height={200} />
          </div>
          <div className="h-[530px] md:col-span-2">
            <AdvancedReservationCalendar height={665} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="h-[224px]">
            <PieChartWidget height={228} />
          </div>

          <div className="h-[70px]"></div>

          <div className="h-[224px]">
            <VehicleUtilizationCalendar height={224} />
          </div>

          <div className="h-[80px]"></div>

          <div className="h-[300px]">
            <ReservationStatusBarChart height={224} />
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default Home;
