import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Chip,
  Divider,
  Stack,
  useTheme,
  IconButton
} from '@mui/material';
import {
  LocalGasStation,
  EventSeat,
  AttachMoney,
  CalendarToday,
  DirectionsCar,
  CheckCircle,
  Cancel,
  NavigateBefore,
  NavigateNext,
  SyncAlt
} from '@mui/icons-material';
import { Tooltip } from '@mui/material'; // Add this at the top
import { api } from '@/apiClient';
const BaseDialogContent = ({ vehicle }) => {
  const theme = useTheme();
  const [photoIndex, setPhotoIndex] = useState(0);
const [dailyCost, setDailyCost] = useState(null);
  useEffect(() => {
    if (vehicle?.photos?.length > 1) {
      const interval = setInterval(() => {
        setPhotoIndex(idx => (idx + 1) % vehicle.photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [vehicle]);
useEffect(() => {
  const fetchDailyCost = async () => {
    if (!vehicle?.vehicleId) return;

    try {
      const response = await api.get(`/vehicles/vehicle/${vehicle.vehicleId}/daily-cost`);
      setDailyCost(response.data); // ✅ Axios already parses JSON
    } catch (error) {
      console.error('Failed to fetch daily cost:', error);
    }
  };

  fetchDailyCost();
}, [vehicle]);

  if (!vehicle) return null;

  const photos = vehicle.photos || [];
  const currentPhoto = photos.length > 0 ? photos[photoIndex] : null;

  return (
    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
<Box sx={{ position: 'relative', height: 200, overflow: 'hidden', width: 415 }}>
  {currentPhoto ? (
    <CardMedia
      component="img"
      image={currentPhoto.url}
      alt={`${vehicle.mark} ${vehicle.model}`}
      sx={{
        height: '100%',
        width: '100%',
        objectFit: 'cover', // ensures image fills while maintaining aspect ratio
        maxHeight: 200,     // strictly enforces vertical limit
      }}
    />
  ) : (
    <Box
      sx={{
        height: 200,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.200',
        color: 'text.secondary'
      }}
    >
      No Image
    </Box>
  )}

  {photos.length > 1 && (
    <>
      <IconButton
        onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
        sx={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', color: '#fff' }}
      >
        <NavigateBefore />
      </IconButton>
      <IconButton
        onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
        sx={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', color: '#fff' }}
      >
        <NavigateNext />
      </IconButton>
    </>
  )}
</Box>


      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DirectionsCar color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={600}>
            {vehicle.mark} {vehicle.model}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Info Grid */}
        <Grid container spacing={1.0}>
          <Info icon={<CalendarToday fontSize="small" />} label="Year" value={vehicle.year} />
          <Info icon={<LocalGasStation fontSize="small" />} label="Fuel" value={vehicle.fuelType} />
          <Info icon={<EventSeat fontSize="small" />} label="Seats" value={vehicle.seatingCapacity} />
          <Info icon={<AttachMoney fontSize="small" />} label="Daily Cost" value={`$${dailyCost}`} />

          {/* <Info icon={<DirectionsCar fontSize="small" />} label="Category" value={vehicle.category} /> */}
          <Info icon={<SyncAlt fontSize="small" />} label="Transmission" value={vehicle.transmission || 'N/A'} />

        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Availability */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            Availability
          </Typography>
          <Chip
            size="small"
            label={vehicle.isAvailable ? 'Available' : 'Unavailable'}
            icon={vehicle.isAvailable ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
            color={vehicle.isAvailable ? 'success' : 'error'}
            sx={{ mt: 1, fontWeight: 'bold' }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const Info = ({ icon, label, value }) => (
  <Grid item xs={4}> {/* Changed from xs={6} to xs={4} */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}> {/* Reduce spacing */}
      {icon}
      <Stack spacing={0} sx={{ minWidth: 0 }}>
        <Typography variant="caption" fontWeight={600} noWrap>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {value}
        </Typography>
      </Stack>
    </Box>
  </Grid>
);


export default BaseDialogContent;
