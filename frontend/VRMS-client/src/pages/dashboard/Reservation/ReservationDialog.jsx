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
  Stack,
} from '@mui/material';
import {
  DirectionsCar,
  LocalGasStation,
  EventSeat,
  SyncAlt,
  StarRate,
} from '@mui/icons-material';
import { api } from '@/apiClient';

const ReservationDialog = ({ open, onClose, reservationId }) => {
  const [vehicle, setVehicle] = useState(null);
  const [reservation, setReservation] = useState(null);
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

  const currentPhoto = vehicle?.photos?.[0];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
        }}
      >
        <DirectionsCar fontSize="small" />
        Vehicle Overview
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {vehicle ? (
          <>
            {/* Image */}
            <Box
              sx={{
                width: '100%',
                height: 180,
                borderRadius: 1.5,
                backgroundColor: 'background.default',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: 1,
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
                <Typography variant="body2" color="text.disabled">
                  No Image Available
                </Typography>
              )}
            </Box>

<Box
  sx={{
    backgroundColor: 'background.paper',
    p: 1.5,
    borderRadius: 1.5,
    mb: 2,
    border: '1px solid',
    borderColor: 'divider',
  }}
>
  <Typography variant="subtitle1" fontWeight={600} mb={1}>
    Vehicle Information
  </Typography>
  <Grid container spacing={1.5}>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Mark:</Typography>
      <Typography variant="body2" color="text.secondary">{vehicle.mark}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Model:</Typography>
      <Typography variant="body2" color="text.secondary">{vehicle.model}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Year:</Typography>
      <Typography variant="body2" color="text.secondary">{vehicle.year}</Typography>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Fuel Type:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <LocalGasStation fontSize="small" />
        <Typography variant="body2" color="text.secondary">{vehicle.fuelType}</Typography>
      </Box>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Seats:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <EventSeat fontSize="small" />
        <Typography variant="body2" color="text.secondary">{vehicle.seatingCapacity}</Typography>
      </Box>
    </Grid>
    <Grid item xs={6}>
      <Typography variant="body2" fontWeight={600}>Transmission:</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <SyncAlt fontSize="small" />
        <Typography variant="body2" color="text.secondary">{vehicle.transmission || 'N/A'}</Typography>
      </Box>
    </Grid>
  </Grid>
</Box>



{history && (
  <Box
    sx={{
      backgroundColor: 'background.paper',
      p: 1.5,
      borderRadius: 1.5,
      border: '1px solid',
      borderColor: 'divider',
      mb: 2,
    }}
  >
    <Typography variant="subtitle1" fontWeight={600} mb={1}>
      Vehicle History
    </Typography>
    <Grid container spacing={1.5}>
      <Grid item xs={6}>
        <Typography variant="body2" fontWeight={600}>Total KM:</Typography>
        <Typography variant="body2" color="text.secondary">
          {history.km.toFixed(2)} km
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" fontWeight={600}>Number of Drivers:</Typography>
        <Typography variant="body2" color="text.secondary">
          {history.numberOfDrivers}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" fontWeight={600}>Had Accident:</Typography>
        <Typography variant="body2" color="text.secondary">
          {history.hasHadAccident ? 'Yes' : 'No'}
        </Typography>
      </Grid>
      {history.hasHadAccident && (
        <Grid item xs={12}>
          <Typography variant="body2" fontWeight={600}>Accident Description:</Typography>
          <Typography variant="body2" color="text.secondary">
            {history.accidentDescription}
          </Typography>
        </Grid>
      )}
    </Grid>
  </Box>
)}

            
          </>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Loading vehicle data...
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Info = ({ label, value, icon }) => (
  <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    {icon}
    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 60 }}>
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary" noWrap>
      {value}
    </Typography>
  </Grid>
);

const DetailRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Typography variant="body2" fontWeight={600}>
      {label}:
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      {value}
    </Typography>
  </Box>
);

export default ReservationDialog;
