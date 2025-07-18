import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Divider,
  Grid,
  CardMedia,
  Stack
} from '@mui/material';
import {
  DirectionsCar,
  LocalGasStation,
  EventSeat,
  CheckCircle,
  Cancel,
  SyncAlt
} from '@mui/icons-material';
import { api } from '@/apiClient';

const ReservationDialog = ({ open, onClose, reservationId }) => {
  const [vehicle, setVehicle] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
const [history, setHistory] = useState(null);

  useEffect(() => {
    if (!reservationId || !open) return;

    const fetchData = async () => {
      try {
        const resRes = await api.get(`reservations/reservation/${reservationId}`);
        setReservation(resRes.data);

        const resVeh = await api.get(`vehicles/vehicle/${resRes.data.vehicleId}`);
        setVehicle(resVeh.data);

        const resHistory = await api.get(`/vehicle-histories/vehicle/${resRes.data.vehicleId}`);
        setHistory(resHistory.data);
      } catch (err) {
        console.error('Error fetching reservation or vehicle:', err);
      }
    };

    fetchData();
  }, [reservationId, open]);

  useEffect(() => {
    if (vehicle?.photos?.length > 1) {
      const interval = setInterval(() => {
        setPhotoIndex((prev) => (prev + 1) % vehicle.photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [vehicle]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';

  const currentPhoto = vehicle?.photos?.[photoIndex];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reservation Overview
      </DialogTitle>

      <DialogContent dividers>
        {vehicle && reservation ? (
          <>
            {/* Image */}
            <Box
              sx={{
                width: '100%',
                height: 300,
                borderRadius: 2,
                backgroundColor: '#f0f0f0',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {currentPhoto ? (
                <CardMedia
                  component="img"
                  image={currentPhoto.url}
                  alt={`${vehicle.mark} ${vehicle.model}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">No Image Available</Typography>
              )}
            </Box>
{history && (
  <Box
    sx={{
      backgroundColor: '#f9f9f9',
      p: 2,
      borderRadius: 2,
      mb: 3,
      border: '1px solid #e0e0e0',
    }}
  >
    <Typography variant="h6" fontWeight={600} gutterBottom>
      Vehicle History
    </Typography>
    <Divider sx={{ mb: 2 }} />
    <Stack spacing={1.5}>
      <DetailRow label="Total KM" value={`${history.km.toFixed(2)} km`} />
      <DetailRow label="Number of Drivers" value={history.numberOfDrivers} />
      <DetailRow label="Had Accident" value={history.hasHadAccident ? 'Yes' : 'No'} />
      {history.hasHadAccident && (
        <DetailRow label="Accident Description" value={history.accidentDescription} />
      )}
    </Stack>
  </Box>
)}


            {/* Vehicle Details */}
<Box
  sx={{
    backgroundColor: '#f9f9f9',
    p: 2,
    borderRadius: 2,
    mb: 3,
    border: '1px solid #e0e0e0',
  }}
>
  <Typography variant="h6" fontWeight={600} gutterBottom>
    Vehicle Information
  </Typography>
  <Divider sx={{ mb: 2 }} />
  <Grid container spacing={2}>
    <Info label="Mark" value={vehicle.mark} />
    <Info label="Model" value={vehicle.model} />
    <Info label="Year" value={vehicle.year} />
    <Info label="Fuel Type" value={vehicle.fuelType} icon={<LocalGasStation fontSize="small" />} />
    <Info label="Seats" value={vehicle.seatingCapacity} icon={<EventSeat fontSize="small" />} />
    <Info icon={<SyncAlt fontSize="small" />} label="Transmission" value={vehicle.transmission || 'N/A'} />
  </Grid>
</Box>


            <Divider sx={{ my: 2 }} />

            {/* Reservation Details */}
<Box
  sx={{
    backgroundColor: '#f9f9f9',
    p: 2,
    borderRadius: 2,
    mb: 2,
    border: '1px solid #e0e0e0',
  }}
>
  <Typography variant="h6" fontWeight={600} gutterBottom>
    Reservation Details
  </Typography>
  <Divider sx={{ mb: 2 }} />
  <Stack spacing={1.5}>
    <DetailRow label="Start Date" value={formatDate(reservation.startDate)} />
    <DetailRow label="End Date" value={formatDate(reservation.endDate)} />
    <DetailRow
      label="Status"
      value={reservation.status === 0 ? 'Pending' : 'Reserved'}
    />
  </Stack>
</Box>

          </>
        ) : (
          <Typography variant="body2">Loading reservation data...</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Info = ({ label, value, icon }) => (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="body2" fontWeight={600}>{label}:</Typography>
      <Typography variant="body2" color="text.secondary">{value}</Typography>
    </Box>
  </Grid>
);

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" fontWeight={600}>{label}:</Typography>
    <Typography variant="body2" color="text.secondary">{value}</Typography>
  </Box>
);

export default ReservationDialog;
