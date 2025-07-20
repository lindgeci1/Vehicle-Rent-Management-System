import React, { useEffect, useState } from "react";
import { Card, Typography, Button } from "@material-tailwind/react";
import { api } from "@/apiClient";
import Cookies from "js-cookie";
import { decodeToken } from "../../decodeToken";
import { useNavigate } from "react-router-dom";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function CustomerProfileCard() {
  const token = Cookies.get("token");
  const userId = decodeToken(token)?.userId;
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await api.get(`/customers/customer/${userId}`);
        const customerData = res.data?.$values?.[0] || res.data;
        setCustomer(customerData);
      } catch (err) {
        console.error("Failed to fetch customer data:", err);
      }
    }

    if (userId) fetchCustomer();
  }, [userId]);

  if (!customer) {
    return (
      <Card className="p-6 shadow-sm border border-blue-gray-100 w-full">
        <Typography className="text-center italic text-gray-600">
          Loading profile...
        </Typography>
      </Card>
    );
  }

  return (
<Card className="p-6 shadow-sm border border-blue-gray-100 w-full bg-white">
  {/* Top row: Logo + Welcome message */}
  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
    <img
      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
      alt="VRMS Logo"
      className="h-28 object-contain"
    />
    <Typography variant="h5" className="text-blue-gray-900 font-semibold flex-1 ml-6">
      Welcome back, {customer.fullName || customer.username} 👋
    </Typography>
  </div>

  {/* Info Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
   {/* Info Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
  <div className="space-y-2">
    <Typography className="text-sm font-medium text-blue-gray-500 uppercase">
      Email
    </Typography>
    <Typography className="font-medium text-blue-gray-900">{customer.email}</Typography>
  </div>

  <div className="space-y-2">
    <Typography className="text-sm font-medium text-blue-gray-500 uppercase">
      Driver License Category
    </Typography>
    <Typography className="font-medium text-blue-gray-900">
      {customer.driverLicense || "N/A"}
    </Typography>
  </div>
</div>

  </div>

  {/* Bottom row: Text + Profile button */}
  <div className="mt-6 border-t pt-4 flex justify-between items-center">
    <Typography variant="small" color="blue-gray" className="text-sm italic">
      This dashboard shows your current profile data. For changes, visit the full profile page or profile menu.
    </Typography>

    <Button
      size="sm"
      onClick={() => navigate("/dashboard/profile")}
      className="flex items-center gap-2 bg-blue-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-gray-900 transition duration-200"
    >
      <UserCircleIcon className="h-5 w-5" />
      View Full Profile
    </Button>
  </div>
</Card>

  );
}
