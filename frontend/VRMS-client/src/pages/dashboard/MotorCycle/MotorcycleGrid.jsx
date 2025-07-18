import React, { useState, useEffect } from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  Button
} from '@mui/material';
import {
  LocalGasStation,
  CalendarToday,
  Work,
  AttachMoney,
  CheckCircle,
  Cancel,
  DirectionsBike
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AddVehiclePhoto from '../Vehicles/AddVehiclePhoto';
import { api } from '@/apiClient';
import SpeedIcon from '@mui/icons-material/Speed';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SecurityIcon from '@mui/icons-material/Security';
import CommuteIcon from '@mui/icons-material/Commute'; // For Side Car
const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  transition: '0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const MotorcycleGrid = ({
  motorcycles,
  setMotorcycles,
  navigate,
  setSelectedMotorcycleId,
  setShowUpdateForm,
  setDeleteMotorcycleId,
  setShowDeleteConfirmDialog
}) => {
  const [indices, setIndices] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [vehicleToClear, setVehicleToClear] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const next = { ...prev };
if (Array.isArray(motorcycles)) {
  motorcycles.forEach(mc => {
    if (mc.photos?.length > 1) {
      const idx = prev[mc.vehicleId] ?? 0;
      next[mc.vehicleId] = (idx + 1) % mc.photos.length;
    }
  });
}

        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [motorcycles]);

  const handleClearPhotos = async () => {
    try {
      await api.delete(`/vehicles/photos/clear/${vehicleToClear}`);
      setMotorcycles(prev =>
        prev.map(m =>
          m.vehicleId === vehicleToClear ? { ...m, photos: [] } : m
        )
      );
      setConfirmDialogOpen(false);
      setVehicleToClear(null);
    } catch (err) {
      console.error('Failed to clear photos:', err);
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        {(motorcycles || []).map(mc => {
          const photos = mc.photos || [];
          const photoIndex = indices[mc.vehicleId] ?? 0;
          const photo = photos[photoIndex];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={mc.vehicleId}>
              <Item onClick={() => {
                setSelectedMotorcycleId(mc.vehicleId);
                setShowUpdateForm(true);
              }}>
<Box
  sx={{
    width: 330,
    height: 160,
    mx: 'auto', // ✅ centers the image container horizontally
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
    mb: 1.5,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>

                  {photo ? (
                    <Box
                      component="img"
                      src={photo.url}
                      alt={`${mc.mark} ${mc.model}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No Image</Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DirectionsBike color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {mc.mark} {mc.model}
                  </Typography>
                </Box>

                    <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                    <Info icon={<CalendarToday fontSize="small" />} label="Year" value={mc.year} />
                    <Info icon={<LocalGasStation fontSize="small" />} label="Fuel" value={mc.fuelType} />
                    <Info icon={<Work fontSize="small" />} label="Transmission" value={mc.transmission || 'N/A'} />
                    <Info icon={<DirectionsBike fontSize="small" />} label="Seats" value={mc.seatingCapacity ?? 'N/A'} />
                    </Grid>
                    <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                    <Info icon={<AttachMoney fontSize="small" />} label="Prepay" value={`$${mc.prepayFee}`} />
                    <Info icon={<SpeedIcon fontSize="small" />} label="Max Speed" value={`${mc.maxSpeed ?? 'N/A'} km/h`} />
                    <Info icon={<CommuteIcon fontSize="small" />} label="Side Car" value={mc.hasSideCar ? 'Yes' : 'No'} />
                    <Info icon={<ElectricBoltIcon fontSize="small" />} label="Electric" value={mc.isElectric ? 'Yes' : 'No'} />
                    <Info icon={<SecurityIcon fontSize="small" />} label="ABS" value={mc.hasABS ? 'Yes' : 'No'} />
                    </Grid>


                <Divider sx={{ my: 1.5 }} />

                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button fullWidth size="small" variant="contained" color="secondary"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteMotorcycleId(mc.vehicleId);
                        setShowDeleteConfirmDialog(true);
                      }}
                    >Delete</Button>
                  </Grid>
                  <Grid item xs={4}>
                    <div onClick={e => e.stopPropagation()}>
                      <AddVehiclePhoto vehicleId={mc.vehicleId} onUploaded={() => {}} />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehiclehistory', {
                          state: { vehicleId: mc.vehicleId, showCreateForm: true }
                        });
                      }}
                    >History</Button>
                  </Grid>
                </Grid>

                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={e => {
                    e.stopPropagation();
                    setVehicleToClear(mc.vehicleId);
                    setConfirmDialogOpen(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear Photos
                </Button>

                <Divider sx={{ my: 1 }} />
                <Box>
                  <Chip
                    size="small"
                    label={mc.isAvailable ? 'Available' : 'Unavailable'}
                    icon={mc.isAvailable ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    color={mc.isAvailable ? 'success' : 'error'}
                    sx={{ mt: 0.5, px: 1 }}
                  />
                </Box>
              </Item>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Clear Photos</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete all photos for this motorcycle?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearPhotos}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Info = ({ icon, label, value, xs = 6 }) => (
  <Grid item xs={xs}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Stack spacing={0}>
        <Typography variant="caption" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      </Stack>
    </Box>
  </Grid>
);

export default MotorcycleGrid;
