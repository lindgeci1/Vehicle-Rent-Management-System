import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { api } from '@/apiClient';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
const glowBlinkKeyframes = `
  @keyframes glowBlink {
    0%, 100% {
      border-color: transparent;
      box-shadow: none;
    }
    50% {
      border-color: #ff6b6b; /* light red */
      box-shadow: 0 0 8px 3px #ff6b6b;
    }
  }
`;


function InjectGlobalStyles() {
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = glowBlinkKeyframes;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  return null;
}


function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d) ? 'N/A' : d.toISOString().split('T')[0];
}

const useCustomerUsernames = (receipts) => {
  const [usernames, setUsernames] = useState({});
  useEffect(() => {
    const fetchUsernames = async () => {
      const map = {};
      for (const r of receipts) {
        try {
          const res = await api.get(`/Receipts/customer-username/${r.receiptId}`);
          map[r.receiptId] = res.data.username;
        } catch {
          map[r.receiptId] = 'Unknown';
        }
      }
      setUsernames(map);
    };
    if (receipts.length > 0) fetchUsernames();
  }, [receipts]);

  return usernames;
};

const ReceiptViewCustomer = ({ receipts }) => {
  const theme = useTheme();
  const usernames = useCustomerUsernames(receipts);
const location = useLocation();
const { paymentId, receiptId } = location.state || {};
const [paymentReceipts, setPaymentReceipts] = useState([]);
const [loading, setLoading] = useState(false);
  const highlightedReceiptIds = paymentReceipts.map(r => r.receiptId);

  // reservationMap: reservationId → customerId
  const [reservationMap, setReservationMap] = useState({});
  // reservationVehicles: reservationId → { mark, model }
  const [reservationVehicles, setReservationVehicles] = useState({});

  const token = Cookies.get('token');
  const decoded = decodeToken(token);
  const userId = Number(decoded?.userId);
  const role = decoded?.role;

  // 1) Fetch all reservations once to build reservationMap
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/reservations/reservations');
        const map = {};
        const values = res.data?.$values || res.data;
        for (const r of values) {
          map[r.reservationId] = r.customerId;
        }
        setReservationMap(map);
      } catch (err) {
        console.error('Failed to fetch reservations', err);
      }
    };
    fetchReservations();
  }, []);
useEffect(() => {
  if (paymentId) {
    setLoading(true);
    api.get(`/Receipts/byPayment/${paymentId}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setPaymentReceipts(res.data);
        } else if (res.data) {
          setPaymentReceipts([res.data]);
        } else {
          setPaymentReceipts([]);
        }
      })
      .catch(() => setPaymentReceipts([]))
      .finally(() => setLoading(false));
  }
}, [paymentId]);


  // 2) Filter so a Customer sees only their own receipts
  const filteredReceipts =
    role === 'Customer'
      ? receipts.filter((r) => {
          // First build paymentId → reservationId map via payments endpoint
          // (we do this below in useEffect)
          return true; // placeholder; actual filtering happens after map is built
        })
      : receipts;

  // 3) Build paymentId → reservationId map, then apply filter for "Customer" role
  //    and finally group receipts by reservationId
  const [groupedByReservation, setGroupedByReservation] = useState({});
  useEffect(() => {
    const buildAndGroup = async () => {
      if (role !== 'Customer') {
        // simply group all receipts by r.reservationId (via payments lookup)
        const paymentsRes = await api.get('/Payments/GetPayments');
        const reservationsRes = await api.get('/reservations/reservations');
        const payments = paymentsRes.data?.$values || paymentsRes.data;
        const reservations = reservationsRes.data?.$values || reservationsRes.data;

        // Build reservationId → customerId
        const resMap = {};
        for (const r of reservations) {
          resMap[r.reservationId] = r.customerId;
        }
        setReservationMap(resMap);

        // Build paymentId → reservationId
        const paymentMap = {};
        for (const p of payments) {
          paymentMap[p.paymentId] = p.reservationId;
        }

        // Group receipts by reservationId (no filter)
        const grouping = {};
        for (const r of receipts) {
          const resId = paymentMap[r.paymentId];
          if (!grouping[resId]) grouping[resId] = [];
          grouping[resId].push(r);
        }
        setGroupedByReservation(grouping);
        return;
      }

      // If role === 'Customer', apply filter + grouping
      try {
        const paymentsRes = await api.get('/Payments/GetPayments');
        const reservationsRes = await api.get('/reservations/reservations');

        const payments = paymentsRes.data?.$values || paymentsRes.data;
        const reservations = reservationsRes.data?.$values || reservationsRes.data;

        // Build reservationId → customerId
        const resMap = {};
        for (const r of reservations) {
          resMap[r.reservationId] = r.customerId;
        }
        setReservationMap(resMap);

        // Build paymentId → reservationId
        const paymentMap = {};
        for (const p of payments) {
          paymentMap[p.paymentId] = p.reservationId;
        }

        // Filter and group
        const grouping = {};
        for (const r of receipts) {
          const resId = paymentMap[r.paymentId];
          const custId = resMap[resId];
          if (custId === userId) {
            if (!grouping[resId]) grouping[resId] = [];
            grouping[resId].push(r);
          }
        }
        setGroupedByReservation(grouping);
      } catch (err) {
        console.error('Error grouping receipts:', err);
        setGroupedByReservation({});
      }
    };

    if (receipts.length > 0) {
      buildAndGroup();
    }
  }, [receipts, role, userId]);

  // 4) Once groupedByReservation is known, fetch each reservation → vehicle → { mark, model }
  useEffect(() => {
    const fetchVehicleForReservation = async (reservationId) => {
      try {
        // a) get the reservation to read its vehicleId
        const reservationRes = await api.get(`/reservations/reservation/${reservationId}`);
        const vehicleId = reservationRes.data.vehicleId;

        // b) get the vehicle’s mark + model
        const vehicleRes = await api.get(`/vehicles/vehicle/${vehicleId}`);
        const { mark, model } = vehicleRes.data;

        setReservationVehicles((prev) => ({
          ...prev,
          [reservationId]: { mark, model }
        }));
      } catch (err) {
        console.error(`Failed to load vehicle for reservation ${reservationId}`, err);
      }
    };

    Object.keys(groupedByReservation).forEach((resId) => {
      if (!reservationVehicles[resId]) {
        fetchVehicleForReservation(resId);
      }
    });
  }, [groupedByReservation, reservationVehicles]);

  return (
    <>
     <InjectGlobalStyles />
<Box className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-6">
  <Box textAlign="center" mb={5}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 600,
        color: '#0f172a',
      }}
    >
      My Receipts
    </Typography>
    <Typography
      variant="body2"
      className="text-blue-gray-500 italic px-2 mt-6"
      textAlign="center"
    >
      This section displays all your issued receipts linked to completed payments, grouped by vehicle reservations.
    </Typography>
  </Box>

      {/* Empty State */}
      {Object.keys(groupedByReservation).length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            mb: 4,
            px: 3,
            py: 5,
            borderRadius: 3,
            backgroundColor: '#f9f9f9',
            border: '1px dashed #ccc',
            maxWidth: 500,
            mx: 'auto',
            boxShadow: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              sx={{ width: 60, height: 60, color: 'gray' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
              />
            </Box>
          </Box>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Receipts Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don’t have any receipts yet. Once a payment is completed and finalized, your receipt will appear here.
          </Typography>
        </Box>
      )}

      {/* Groups by reservationId */}
      {Object.entries(groupedByReservation).map(([reservationId, paymentsForRes]) => {
        // If vehicle info is loaded, show mark + model
        const vehicleInfo = reservationVehicles[reservationId] || {};

        return (
          <Box key={reservationId} mb={4}>
            {/* Section Header: make + model */}
            <Typography variant="h6" fontWeight={600} mb={1}>
              {vehicleInfo.mark && vehicleInfo.model
                ? `Reservation for ${vehicleInfo.mark} ${vehicleInfo.model}`
                : `Reservation #${reservationId}`}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Receipt Cards for this reservation */}
            <Grid container spacing={2}>
              {paymentsForRes.map((r) => (
                <Grid item xs={12} md={6} key={r.receiptId}>
<Card
  variant="outlined"
  sx={{
    cursor: 'default',
    borderRadius: 2,
    boxShadow: 2,
    bgcolor: 'background.paper',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    borderColor: 'transparent',  // default no border color
    ...(highlightedReceiptIds.includes(r.receiptId) && {
      animation: 'glowBlink 1.5s 3',  // 3 iterations, not infinite
      animationTimingFunction: 'ease-in-out',
    }),
    '&:hover': {
      boxShadow: 2,
    },
  }}
>


<CardHeader
  avatar={
    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
      <ReceiptIcon fontSize="medium" />
    </Avatar>
  }
  title={
    <Typography variant="subtitle1" fontWeight={600}>
      {usernames[r.receiptId] ? `Receipt for ${usernames[r.receiptId]}` : 'Receipt for Customer'}
    </Typography>
  }
  subheader={
    <Typography variant="caption" color="text.secondary">
      Receipt ID: {r.receiptId}
    </Typography>
  }
  sx={{ pb: 1.5 }}
/>

<Divider sx={{ mx: 2 }} />

<CardContent sx={{ px: 3, pb: 0 }}>
  <Box
    sx={{
      backgroundColor: '#f5f7fa',
      borderRadius: 2,
      px: 3,
      py: 2,
      mb: 2,
    }}
  >
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
      Receipt Details
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <InfoRow label="Receipt Type" value={r.receiptType} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InfoRow
          label="Amount Paid"
          value={`€${r.amount?.toFixed(2)}`}
          icon={<EuroIcon fontSize="small" />}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <InfoRow
          label="Issued At"
          value={formatDate(r.issuedAt)}
          icon={<CalendarIcon fontSize="small" />}
        />
      </Grid>
    </Grid>
  </Box>
</CardContent>



                    <Divider sx={{ mx: 2 }} />

                    <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdfIcon />}
                        href={`${import.meta.env.VITE_API_BASE_URL}/Receipts/download/${r.receiptId}`}
                        target="_blank"
                      >
                        Download PDF
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
    </>
  );
};


const InfoRow = ({ label, value, icon }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {label}:
      </Typography>
    </Stack>
    <Typography variant="body2" fontWeight={500} color="text.primary">
      {value ?? 'N/A'}
    </Typography>
  </Stack>
);


export default ReceiptViewCustomer;
