import React from "react";
import VehicleCategoryChart from "../../StatCharts/VehicleCategoryChart";
import VehicleFuelTypeChart from "../../StatCharts/VehicleFuelTypeChart";
import VehicleYearChart from "../../StatCharts/VehicleYearChart";
import CountCustomerView from "../../StatCharts/CountCustomerView";
import Cookies from "js-cookie";
import { decodeToken } from "../../../decodeToken";
import CountAdminView from "../../StatCharts/CountAdminView";
export function Home() {
  const token = Cookies.get("token");
  const role = decodeToken(token)?.role;

  return (
    <div className="mt-8 px-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <VehicleCategoryChart height={300} />
        <VehicleFuelTypeChart height={300} />
        <VehicleYearChart height={300} />
      </div>

      {role === "Customer" && <CountCustomerView />}
      {(role === "Admin" || role === "Agent") && <CountAdminView />}
    </div>
  );
}

export default Home;
