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
  EventSeat,
  CalendarToday,
  Work,
  AttachMoney,
  CheckCircle,
  Cancel,
  AcUnit,
  Navigation,
  WbSunny,
  DirectionsCar
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import AddVehiclePhoto from '../Vehicles/AddVehiclePhoto';
import { api } from '@/apiClient';

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

const VehicleGrid = ({
  cars,
  setCars,
  navigate,
  setSelectedCarId,
  setShowUpdateForm,
  setDeleteCarId,
  setShowDeleteConfirmDialog
}) => {
  const [indices, setIndices] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [vehicleToClear, setVehicleToClear] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const next = { ...prev };
        cars.forEach(car => {
          if (car.photos?.length > 1) {
            const idx = prev[car.vehicleId] ?? 0;
            next[car.vehicleId] = (idx + 1) % car.photos.length;
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [cars]);

  const handleClearPhotos = async () => {
    try {
      await api.delete(`/vehicles/photos/clear/${vehicleToClear}`);
      setCars(prev =>
        prev.map(c =>
          c.vehicleId === vehicleToClear ? { ...c, photos: [] } : c
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
        {cars.map(car => {
          const photos = car.photos || [];
          const photoIndex = indices[car.vehicleId] ?? 0;
          const photo = photos[photoIndex];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={car.vehicleId}>
              <Item onClick={() => {
                setSelectedCarId(car.vehicleId);
                setShowUpdateForm(true);
              }}>
                {/* Image */}
                <Box
                  sx={{
                    width: 330,
                    height: 160,
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
                      alt={`${car.mark} ${car.model}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">No Image</Typography>
                  )}
                </Box>

                {/* Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DirectionsCar color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {car.mark} {car.model}
                  </Typography>
                </Box>

                <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                  <Info icon={<CalendarToday fontSize="small" />} label="Year" value={car.year} />
                  <Info icon={<LocalGasStation fontSize="small" />} label="Fuel" value={car.fuelType} />
                  <Info icon={<DirectionsCar fontSize="small" />} label="Transmission" value={car.transmission || 'N/A'} />
                  <Info icon={<EventSeat fontSize="small" />} label="Seats" value={car.seatingCapacity} />
                </Grid>
                <Grid container spacing={0.5} sx={{ mt: 0.5}}>
                  <Info icon={<Work fontSize="small" />} label="Trunk" value={`${car.trunkCapacity}L`} />
                  <Info icon={<AttachMoney fontSize="small" />} label="Prepay" value={`$${car.prepayFee}`} />
                  <Info icon={<AcUnit fontSize="small" />} label="AC" value={car.hasAirConditioning ? 'Yes' : 'No'} />
                  <Info icon={<Navigation fontSize="small" />} label="Nav" value={car.hasNavigationSystem ? 'Yes' : 'No'} />
                  <Info icon={<WbSunny fontSize="small" />} label="Sunroof" value={car.hasSunroof ? 'Yes' : 'No'} />
                </Grid>


                <Divider sx={{ my: 1.5 }} />

                {/* Actions */}
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button fullWidth size="small" variant="contained" color="secondary"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteCarId(car.vehicleId);
                        setShowDeleteConfirmDialog(true);
                      }}
                    >Delete</Button>
                  </Grid>
                  <Grid item xs={4}>
                    <div onClick={e => e.stopPropagation()}>
                      <AddVehiclePhoto vehicleId={car.vehicleId} onUploaded={() => {}} />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehiclehistory', {
                          state: { vehicleId: car.vehicleId, showCreateForm: true }
                        });
                      }}
                    >History</Button>
                  </Grid>
                  {/* <Grid item xs={4}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/tripdetails', {
                          state: { vehicleId: car.vehicleId, showCreateForm: true }
                        });
                      }}
                    >Trip</Button>
                  </Grid> */}
                  {/* <Grid item xs={4}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehiclerating', {
                          state: { vehicleId: car.vehicleId, showCreateForm: true }
                        });
                      }}
                    >Rating</Button>
                  </Grid> */}
                  {/* <Grid item xs={6}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehicleprecondition', {
                          state: { vehicleId: car.vehicleId, showCreateForm: true }
                        });
                      }}
                    >Pre</Button>
                  </Grid> */}
                  {/* <Grid item xs={6}>
                    <Button fullWidth size="small" variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehiclepostcondition', {
                          state: { vehicleId: car.vehicleId, showCreateForm: true }
                        });
                      }}
                    >Post</Button>
                  </Grid> */}
                </Grid>

                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={e => {
                    e.stopPropagation();
                    setVehicleToClear(car.vehicleId);
                    setConfirmDialogOpen(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear Photos
                </Button>

                {/* Availability */}
                <Divider sx={{ my: 1 }} />
                <Box>
                  {/* <Typography variant="caption" fontWeight={500}>Availability</Typography> */}
                  <Chip
                    size="small"
                    label={car.isAvailable ? 'Available' : 'Unavailable'}
                    icon={car.isAvailable ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    color={car.isAvailable ? 'success' : 'error'}
                    sx={{ mt: 0.5, px: 1 }}
                  />
                </Box>
              </Item>
            </Grid>
          );
        })}
      </Grid>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Clear Photos</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete all photos for this vehicle?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearPhotos}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Info = ({ icon, label, value, xs = 3 }) => (
  <Grid item xs={xs}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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


export default VehicleGrid;
