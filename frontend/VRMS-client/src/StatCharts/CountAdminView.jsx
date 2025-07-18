import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { api } from "@/apiClient";
import Cookies from "js-cookie";
import { decodeToken } from "../../decodeToken";
import {
  UserGroupIcon,
  TruckIcon,
  UserCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  UsersIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
function CountAdminView() {
  const [counts, setCounts] = useState({
    agents: 0,
    customers: 0,
    insurancePolicies: 0,
    payments: 0,
    receipts: 0,
    reservations: 0,
    tripdetails: 0,
    users: 0,
    vehicles: 0,
    ratings: 0,
  });

  {/* ikonat me ngjyra
    const icons = {
    agents: <UserCircleIcon className="w-6 h-6 text-blue-500 mb-2 mx-auto" />,
    cars: <TruckIcon className="w-6 h-6 text-green-500 mb-2 mx-auto" />,
    customers: <UsersIcon className="w-6 h-6 text-purple-500 mb-2 mx-auto" />,
    insurancePolicies: <DocumentTextIcon className="w-6 h-6 text-yellow-500 mb-2 mx-auto" />,
    payments: <CurrencyDollarIcon className="w-6 h-6 text-green-700 mb-2 mx-auto" />,
    receipts: <ReceiptPercentIcon className="w-6 h-6 text-blue-600 mb-2 mx-auto" />,
    reservations: <ClipboardDocumentListIcon className="w-6 h-6 text-red-500 mb-2 mx-auto" />,
    tripdetails: <AcademicCapIcon className="w-6 h-6 text-indigo-500 mb-2 mx-auto" />,
    users: <UserIcon className="w-6 h-6 text-pink-500 mb-2 mx-auto" />,
    vehicles: <TruckIcon className="w-6 h-6 text-orange-500 mb-2 mx-auto" />,
    ratings: <StarIcon className="w-6 h-6 text-yellow-400 mb-2 mx-auto" />,
  };*/}

  {/*ikonat grey*/}
  const icons = {
    agents: <AcademicCapIcon className="w-6 h-6 text-gray-600 mb-2 mx-auto" />,
    customers: <UserGroupIcon className="w-6 h-6 text-gray-600 mb-2 mx-auto" />,
    insurancePolicies: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m1.5-5.25a48.39 48.39 0 00-11 0A2.25 2.25 0 003 6.52v4.697c0 5.105 3.654 9.785 8.25 10.533 4.596-.748 8.25-5.428 8.25-10.533V6.52a2.25 2.25 0 00-1.5-2.12z" />
        </svg>
    ),
    payments: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
            <rect x="2" y="6" width="20" height="12" rx="2" fill="#e0e7ef" stroke="#64748b" />
            <rect x="2" y="10" width="20" height="2" fill="#64748b" />
            <rect x="16" y="14" width="4" height="2" rx="1" fill="#64748b" />
          </svg>
    ),
    receipts: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
        </svg>
    ),
    reservations: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
    </svg>
  ),
    tripdetails: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
    ),
    users: (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
    ),
    vehicles:<DirectionsCarFilledIcon className="w-6 h-6 text-gray-600 mb-2 mx-auto" />,
    ratings: (        
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-600 mb-2 mx-auto">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>),
  };

useEffect(() => {
  const fetchData = async () => {
    try {
      const [
        vehiclesRes,
        reservationsRes,
        tripdetailsRes,
        paymentsRes,
        receiptsRes,
        insuranceRes,
        ratingsRes,
        usersRes,
        agentsRes,
        customersRes,
      ] = await Promise.all([
        api.get("/vehicles/vehicles"),
        api.get("/reservations/reservations"),
        api.get("/tripdetails/tripdetails"),
        api.get("/Payments/GetPayments"),
        api.get("/Receipts/GetReceipts"),
        api.get("/insurancePolicy/insurancePolicies"),
        api.get("/vehicle-ratings/ratings"),
        api.get("/user/users"),
        api.get("/agents/agents"),
        api.get("/customers/customers"),
      ]);

      setCounts({
        vehicles: (vehiclesRes.data?.$values || vehiclesRes.data).length,
        reservations: (reservationsRes.data?.$values || reservationsRes.data).length,
        tripdetails:  (tripdetailsRes.data?.$values  || tripdetailsRes.data).length,
        payments:          (paymentsRes.data?.$values  || paymentsRes.data).length,
        receipts:          (receiptsRes.data?.$values  || receiptsRes.data).length,
        insurancePolicies: (insuranceRes.data?.$values  || insuranceRes.data).length,
        ratings: (ratingsRes.data?.$values || ratingsRes.data).length,
        users:     (usersRes.data?.$values     || usersRes.data).length,
        agents:    (agentsRes.data?.$values    || agentsRes.data).length,
        customers: (customersRes.data?.$values || customersRes.data).length,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  fetchData();
}, []);


  return (
    <div className="mt-6">
      <Typography className="text-lg font-semibold text-blue-gray-800 mb-4">
        System Statistics
      </Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key} className="p-4 shadow-md border border-blue-gray-100">
            <div className="text-center">
            {icons[key]} {/* Ikona për secilin key */}
              <Typography className="text-sm text-blue-gray-600 mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </Typography>
              <Typography variant="h5" className="font-bold text-blue-gray-800">
                {value}
              </Typography>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CountAdminView;
