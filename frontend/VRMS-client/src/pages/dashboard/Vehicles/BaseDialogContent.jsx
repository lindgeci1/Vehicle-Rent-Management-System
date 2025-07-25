import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Box,
  Divider,
  Stack,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar,
  CalendarToday,
  EventSeat,
  AttachMoney,
} from '@mui/icons-material';
import { api } from '@/apiClient';

const BaseDialogContent = ({ vehicle }) => {
  const theme = useTheme();
  const [dailyCost, setDailyCost] = useState(null);

  useEffect(() => {
    if (!vehicle?.vehicleId) return;
    const fetchDailyCost = async () => {
      try {
        const res = await api.get(`/vehicles/vehicle/${vehicle.vehicleId}/daily-cost`);
        setDailyCost(res.data);
      } catch (err) {
        console.error('Failed to fetch daily cost:', err);
      }
    };
    fetchDailyCost();
  }, [vehicle]);

  if (!vehicle) return null;

  const currentPhoto = vehicle.photos?.[0];

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        width: 300,
        height: 330, // increased height
        boxShadow: theme.shadows[3],
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ height: 300, overflow: 'hidden' }}>
        {currentPhoto ? (
          <CardMedia
            component="img"
            image={currentPhoto.url}
            alt={`${vehicle.mark} ${vehicle.model}`}
            sx={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: theme.palette.action.hover,
              color: theme.palette.text.disabled,
            }}
          >
            No Image
          </Box>
        )}
      </Box>

      <CardContent sx={{ p: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
          <DirectionsCar color="primary" fontSize="medium" />
          <Typography variant="h6" fontWeight="medium" noWrap color="text.primary">
            {vehicle.mark} {vehicle.model}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Grid container spacing={1}>
          <Info icon={<CalendarToday fontSize="medium" color="action" />} label="Year" value={vehicle.year} />
          <Info icon={<EventSeat fontSize="medium" color="action" />} label="Seats" value={vehicle.seatingCapacity} />
          <Info icon={<AttachMoney fontSize="medium" color="action" />} label="Cost" value={dailyCost ? `$${dailyCost}` : 'N/A'} />
        </Grid>
      </CardContent>
    </Card>
  );
};

const Info = ({ icon, label, value }) => (
  <Grid item xs={4}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
      {icon}
      <Stack spacing={0} sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight="medium" color="text.primary" noWrap>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {value}
        </Typography>
      </Stack>
    </Box>
  </Grid>
);

export default BaseDialogContent;
