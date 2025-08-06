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
  Chip,
  Divider,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  DoneAll as DoneAllIcon,
  HourglassEmpty as HourglassIcon
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';
import { useNavigate } from 'react-router-dom';
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB');
}

const useCustomerUsernames = (payments) => {
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const newUsernames = {};
      for (const p of payments) {
        try {
          const res = await api.get(`/Payments/customer-username/${p.paymentId}`);
          newUsernames[p.paymentId] = res.data.username;
        } catch {
          newUsernames[p.paymentId] = 'Unknown';
        }
      }
      setUsernames(newUsernames);
    };
    if (payments.length > 0) fetchUsernames();
  }, [payments]);

  return usernames;
};

function PaymentViewCustomer({ payments, onPay }) {
  const theme = useTheme();
  const usernames = useCustomerUsernames(payments);
const navigate = useNavigate();
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

  // 2) Filter so a Customer sees only their own payments
  const filteredPayments =
    role === 'Customer'
      ? payments.filter((p) => reservationMap[p.reservationId] === userId)
      : payments;

  // 3) Group payments by reservationId
  const groupedByReservation = filteredPayments.reduce((acc, p) => {
    if (!acc[p.reservationId]) acc[p.reservationId] = [];
    acc[p.reservationId].push(p);
    return acc;
  }, {});

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
<Box className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-6">
  <Box textAlign="center" mb={5}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 600,
        color: '#0f172a',
      }}
    >
      Your Records
    </Typography>
    <Typography
      variant="body2"
      className="text-blue-gray-500 italic px-2 mt-6"
      textAlign="center"
    >
      Manage your payments securely and track all transactions related to your vehicle reservations in one place.
    </Typography>
  </Box>

      {/* Empty State */}
  {filteredPayments.length === 0 && (
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
        <PaymentIcon
          sx={{
            fontSize: 60,
            color: 'gray'
          }}
        />
      </Box>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        No Payments Yet
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your payment records will appear here once you make a transaction.
      </Typography>
    </Box>
  )}

      {/* Groups by reservationId */}
      {Object.entries(groupedByReservation).map(([reservationId, paymentsForRes]) => {
        // If vehicle info is loaded, show mark + model. Otherwise fallback to the ID.
        const vehicleInfo = reservationVehicles[reservationId];

        return (
          <Box key={reservationId} mb={4}>
            {/* Section Header */}
            <Typography variant="h6" fontWeight={600} mb={1}>
              {vehicleInfo
                ? `Reservation for ${vehicleInfo.mark} ${vehicleInfo.model}`
                : `Reservation #${reservationId}`}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Payment Cards for this reservation */}
            <Grid container spacing={3}>
              {paymentsForRes.map((p) => (
                <Grid item xs={12} md={6} key={p.paymentId}>
<Card
  elevation={1}
  sx={{
    borderRadius: 2,
    transition: 'box-shadow 0.2s ease-in-out',
    width: 580,
    margin: 'auto',
    boxShadow: 2,
    bgcolor: 'background.paper',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: 4,
    },
  }}
>
  {/* Card Header */}
  <CardHeader
    avatar={
      <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
        <PaymentIcon fontSize="medium" />
      </Avatar>
    }
    title={
      <Typography variant="subtitle1" fontWeight={600}>
        {usernames[p.paymentId] ? `Payment for ${usernames[p.paymentId]}` : 'Payment for Customer'}
      </Typography>
    }
    subheader={
      <Typography variant="caption" color="text.secondary">
        Payment ID: {p.paymentId}
      </Typography>
    }
    sx={{ pb: 1 }}
  />

  <Divider sx={{ mx: 2 }} />

  {/* Card Content */}
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
        Payment Details
      </Typography>

      {/* Row 1: Description & Prepayment */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Description" value={p.description} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow label="Prepayment" value={`€${p.prepaymentAmount?.toFixed(2) ?? 'N/A'}`} />
        </Grid>
        {/* Row 2: Total Price & Issued Date */}
        <Grid item xs={12} sm={6}>
          <InfoRow label="Total Price" value={`€${p.totalPrice?.toFixed(2) ?? 'N/A'}`} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <InfoRow
            label="Issued At"
            value={formatDate(p.dateIssued)}
            icon={<CalendarIcon fontSize="small" />}
          />
        </Grid>
        {/* Row 3: Status */}
        <Grid item xs={12}>
          <InfoChipRow
            label="Status"
            value={p.paymentStatus}
            successCondition={p.paymentStatus === 'pre-paid' || p.paymentStatus === 'paid'}
            successIcon={<DoneAllIcon fontSize="small" />}
            failIcon={<HourglassIcon fontSize="small" />}
          />
        </Grid>
      </Grid>
    </Box>
  </CardContent>

  <Divider sx={{ mx: 2 }} />

  {/* Card Actions */}
  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
    <Button
      variant="contained"
      color="primary"
      size="small"
      startIcon={<PaymentIcon />}
      disabled={
        p.paymentStatus?.toLowerCase() === 'pre-paid' ||
        p.stripeStatus === 'succeeded'
      }
      onClick={() => onPay(p)}
      sx={{
        textTransform: 'none',
        boxShadow: 'none',
        fontSize: 13,
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      {p.paymentStatus?.toLowerCase() === 'pre-paid' ||
      p.stripeStatus === 'succeeded'
        ? 'Paid'
        : 'Pay Now'}
    </Button>
<Button
  variant="outlined"
  color="secondary"
  size="small"
  startIcon={<DescriptionIcon />}
  onClick={() => navigate('/dashboard/receipt', {
    state: {
      paymentId: p.paymentId || p.PaymentId,  // Use the correct case matching your object
    }
  })}
  sx={{
    textTransform: 'none',
    fontSize: 13,
    ml: 1,
    pointerEvents:
      p.paymentStatus?.toLowerCase() === 'paid' ||
      p.paymentStatus?.toLowerCase() === 'pre-paid'
        ? 'auto'
        : 'none',
    opacity:
      p.paymentStatus?.toLowerCase() === 'paid' ||
      p.paymentStatus?.toLowerCase() === 'pre-paid'
        ? 1
        : 0.5
  }}
  disabled={
    !(
      p.paymentStatus?.toLowerCase() === 'paid' ||
      p.paymentStatus?.toLowerCase() === 'pre-paid'
    )
  }
>
  Go to Receipt
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
  );
}

const InfoRow = ({ label, value, icon }) => (
<Stack
  direction="row"
  alignItems="center"
  spacing={1}
  sx={{ width: '100%', justifyContent: 'flex-start' }}
>
  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0, minWidth: 120 }}>
    {icon}
    <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
      {label}:
    </Typography>
  </Stack>
  <Typography variant="body2" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
    {value || 'N/A'}
  </Typography>
</Stack>

);



const InfoChipRow = ({
  label,
  value,
  successCondition,
  successIcon,
  failIcon
}) => {
  const theme = useTheme();
  const isSuccess = !!successCondition;
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={0}>
      <Typography
        variant="body2"
        fontWeight={500}
        color="text.primary"
        sx={{ minWidth: 90 /* smaller minWidth for label */ }}
      >
        {label}:
      </Typography>
      <Chip
        size="small"
        label={value ?? 'N/A'}
        color={isSuccess ? 'success' : 'warning'}
        icon={isSuccess ? successIcon : failIcon}
        sx={{
          ml: 4.5,  // small margin-left
          minWidth: 96,
          fontSize: 12,
          fontWeight: 500,
          backgroundColor: isSuccess
            ? theme.palette.success.light
            : theme.palette.warning.light,
          color: isSuccess
            ? theme.palette.success.contrastText
            : theme.palette.warning.contrastText
        }}
      />
    </Stack>
  );
};



export default PaymentViewCustomer;
