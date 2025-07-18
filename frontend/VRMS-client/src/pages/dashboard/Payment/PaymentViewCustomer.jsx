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
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          My Payment Records
        </Typography>
      </Stack>

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
                      '&:hover': {
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    {/* Card Header with Avatar */}
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <PaymentIcon />
                        </Avatar>
                      }
                      titleTypographyProps={{
                        fontWeight: 600,
                        fontSize: 16,
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      title={
                        usernames[p.paymentId]
                          ? `Reservation for ${usernames[p.paymentId]}`
                          : 'Reservation for Customer'
                      }
                      subheader={formatDate(p.dateIssued)}
                      subheaderTypographyProps={{
                        color: theme.palette.text.secondary,
                        fontSize: 12
                      }}
                      sx={{ px: 2, pt: 2 }}
                    />

                    <Divider />

                    {/* Card Content: Details */}
                    <CardContent>
                      <Stack spacing={1.5}>
                        <InfoRow
                          label="Description"
                          value={p.description}
                          icon={<DescriptionIcon fontSize="small" color="action" />}
                        />
                        <InfoRow
                          label="Prepayment"
                          value={`€${p.prepaymentAmount?.toFixed(2) ?? 'N/A'}`}
                          icon={<EuroIcon fontSize="small" color="action" />}
                        />
                        <InfoRow
                          label="Total Price"
                          value={`€${p.totalPrice?.toFixed(2) ?? 'N/A'}`}
                          icon={<EuroIcon fontSize="small" color="action" />}
                        />
                        <InfoRow
                          label="Payment Date"
                          value={formatDate(p.dateIssued)}
                          icon={<CalendarIcon fontSize="small" color="action" />}
                        />
<InfoChipRow
  label="Status"
  value={p.paymentStatus}
  successCondition={p.paymentStatus === 'pre-paid' || p.paymentStatus === 'paid'}
  successIcon={<DoneAllIcon fontSize="small" />}
  failIcon={<HourglassIcon fontSize="small" />}
/>


                      </Stack>
                    </CardContent>

                    <Divider sx={{ mx: 2 }} />

                    {/* Card Actions */}
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PaymentIcon />}
                        disabled={
                          p.paymentStatus?.toLowerCase() === 'pre-paid' ||
                          p.stripeStatus === 'succeeded'
                        }
                        onClick={() => onPay(p)}
                        sx={{
                          textTransform: 'none',
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: theme.shadows[2]
                          }
                        }}
                      >
                        {p.paymentStatus?.toLowerCase() === 'pre-paid' ||
                        p.stripeStatus === 'succeeded'
                          ? 'Paid'
                          : 'Pay Now'}
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
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" fontWeight={500} color="text.primary">
        {label}:
      </Typography>
    </Stack>
    <Typography variant="body2" color="text.secondary">
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
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" fontWeight={500} color="text.primary">
        {label}:
      </Typography>
      <Chip
        size="small"
        label={value ?? 'N/A'}
        color={isSuccess ? 'success' : 'warning'}
        icon={isSuccess ? successIcon : failIcon}
        sx={{
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
