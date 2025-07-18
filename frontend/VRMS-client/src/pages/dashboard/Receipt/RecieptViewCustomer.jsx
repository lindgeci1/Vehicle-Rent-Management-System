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
import {
  Receipt as ReceiptIcon,
  Euro as EuroIcon,
  CalendarToday as CalendarIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { api } from '@/apiClient';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';

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
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        My Receipts
      </Typography>

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
            No Receipts Available
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
                      borderRadius: 2,
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ReceiptIcon />
                        </Avatar>
                      }
                      title={usernames[r.receiptId] ? `Receipt for ${usernames[r.receiptId]}` : 'Receipt for Customer'}
                      titleTypographyProps={{ fontWeight: 600, fontSize: 16 }}
                    />

                    <Divider />

                    <CardContent>
                      <Stack spacing={1.5}>
                        <InfoRow label="Receipt Type" value={r.receiptType} />
                        <InfoRow
                          label="Amount Paid"
                          value={`€${r.amount?.toFixed(2)}`}
                          icon={<EuroIcon fontSize="small" />}
                        />
                        <InfoRow
                          label="Issued At"
                          value={formatDate(r.issuedAt)}
                          icon={<CalendarIcon fontSize="small" />}
                        />
                      </Stack>
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
  );
};

const InfoRow = ({ label, value, icon }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" fontWeight={500}>
        {label}:
      </Typography>
    </Stack>
    <Typography variant="body2">{value ?? 'N/A'}</Typography>
  </Stack>
);

export default ReceiptViewCustomer;
