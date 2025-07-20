import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-tailwind/react";
import { api } from "@/apiClient";
import Cookies from "js-cookie";
import { decodeToken } from "../../decodeToken";

function CountCustomerView() {
  const [counts, setCounts] = useState({
    reservations: 0,
    payments: 0,
    receipts: 0,
    ratings: 0,
  });

  const token = Cookies.get("token");
  const userId = decodeToken(token)?.userId;

  const iconMap = {
    reservations: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-8 h-8 text-blue-gray-600 mb-2 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
        />
      </svg>
    ),
    payments: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-8 h-8 text-blue-gray-600 mb-2 mx-auto"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#e0e7ef" stroke="#64748b" />
        <rect x="2" y="10" width="20" height="2" fill="#64748b" />
        <rect x="16" y="14" width="4" height="2" rx="1" fill="#64748b" />
      </svg>
    ),
    receipts: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-8 h-8 text-blue-gray-600 mb-2 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
        />
      </svg>
    ),
    ratings: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-8 h-8 text-blue-gray-600 mb-2 mx-auto"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    ),
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservationsRes, paymentsRes, receiptsRes, ratingsRes] = await Promise.all([
          api.get("/reservations/reservations"),
          api.get(`/payments/user/${userId}`),
          api.get(`/receipts/user/${userId}`),
          api.get(`/vehicle-ratings/ratings/user/${userId}`),
        ]);

        const allReservations = reservationsRes.data.$values || reservationsRes.data;
        const myReservations = allReservations.filter((r) => r.customerId === Number(userId));
        const myPayments = paymentsRes.data.$values || paymentsRes.data;
        const myReceipts = receiptsRes.data.$values || receiptsRes.data;
        const myRatings = ratingsRes.data.$values || ratingsRes.data;

        setCounts({
          reservations: myReservations.length,
          payments: myPayments.length,
          receipts: myReceipts.length,
          ratings: myRatings.length,
        });
      } catch (err) {
        console.error("Error fetching activity data:", err);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  return (
    <Card className="p-6 shadow-sm rounded-md border border-blue-gray-100 bg-white">
      <Typography className="text-lg font-semibold text-blue-gray-800 mb-4">
        Your Activity
      </Typography>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { key: "reservations", label: "My Reservations", value: counts.reservations },
          { key: "payments", label: "My Payments", value: counts.payments },
          { key: "receipts", label: "My Receipts", value: counts.receipts },
          { key: "ratings", label: "My Ratings", value: counts.ratings },
        ].map(({ key, label, value }) => (
          <div key={key} className="text-center">
            {iconMap[key]}
            <Typography className="text-sm text-blue-gray-600 mb-1">{label}</Typography>
            <Typography
              variant="h5"
              className="font-bold text-blue-gray-900"
            >
              {value}
            </Typography>
          </div>
        ))}
      </div>

      <Typography
        variant="small"
        color="blue-gray"
        className="mt-6 text-center text-sm italic text-blue-gray-600 px-4"
      >
        This overview summarizes your personal reservations, payments, receipts,
        and vehicle ratings to help you track your activity easily.
      </Typography>
    </Card>
  );
}

export default CountCustomerView;
