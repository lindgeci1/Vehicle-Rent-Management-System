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
  DirectionsBus,
  EventSeat,
  Luggage,
  Wc,
  MeetingRoom // door icon
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
  '&:hover': { boxShadow: theme.shadows[4] }
}));

const BusGrid = ({
  buses,
  setBuses,
  navigate,
  setSelectedBusId,
  setShowUpdateForm,
  setDeleteBusId,
  setShowDeleteConfirmDialog
}) => {
  /* ──────────────────────────────────────── state & helpers ─────────────────────────────────────── */
  const [indices, setIndices]           = useState({});
  const [confirmDialogOpen, setConfirm] = useState(false);
  const [vehicleToClear, setVehicle]    = useState(null);

  /* cycle through photos every 3 s */
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => {
        const next = { ...prev };
        (buses || []).forEach(b => {
          if (b.photos?.length > 1) {
            const idx      = prev[b.vehicleId] ?? 0;
            next[b.vehicleId] = (idx + 1) % b.photos.length;
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [buses]);

  const handleClearPhotos = async () => {
    try {
      await api.delete(`/vehicles/photos/clear/${vehicleToClear}`);
      setBuses(prev =>
        prev.map(b =>
          b.vehicleId === vehicleToClear ? { ...b, photos: [] } : b
        )
      );
      setConfirm(false);
      setVehicle(null);
    } catch (err) {
      console.error('[BusGrid] clear photos failed:', err);
    }
  };

  /* ──────────────────────────────────────── render ─────────────────────────────────────── */
  return (
    <>
      <Grid container spacing={2}>
        {(buses || []).map(bus => {
          const photos     = bus.photos ?? [];
          const photoIndex = indices[bus.vehicleId] ?? 0;
          const photo      = photos[photoIndex];

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={bus.vehicleId}>
              <Item
                onClick={() => {
                  setSelectedBusId(bus.vehicleId);
                  setShowUpdateForm(true);
                }}
              >
                {/* ───────── image box ───────── */}
                <Box
                  sx={{
                    width: 330,
                    height: 160,
                    mx: 'auto',
                    mb: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#e0e0e0',
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
                      alt={`${bus.mark} ${bus.model}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No Image
                    </Typography>
                  )}
                </Box>

                {/* ───────── heading row ───────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <DirectionsBus color="primary" fontSize="small" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {bus.mark} {bus.model}
                  </Typography>
                </Box>

                {/* ───────── info rows ───────── */}
                <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                  <Info icon={<CalendarToday fontSize="small" />} label="Year"   value={bus.year} />
                  <Info icon={<LocalGasStation fontSize="small" />} label="Fuel"  value={bus.fuelType} />
                  <Info icon={<Work fontSize="small" />}           label="Transmission" value={bus.transmission ?? 'N/A'} />
                  <Info icon={<EventSeat fontSize="small" />}      label="Seats" value={bus.seatingCapacity ?? 'N/A'} />
                </Grid>

                <Grid container spacing={0.5} sx={{ mt: 0.5 }}>
                  <Info icon={<AttachMoney fontSize="small" />} label="Prepay"   value={`$${bus.prepayFee}`} />
                  <Info icon={<MeetingRoom fontSize="small" />} label="Doors"    value={bus.numberOfDoors} />
                  <Info icon={<Luggage fontSize="small" />}     label="Luggage"  value={bus.hasLuggageCompartment ? 'Yes' : 'No'} />
                  <Info icon={<Wc fontSize="small" />}          label="Toilet"   value={bus.hasToilet ? 'Yes' : 'No'} />
                  <Info icon={<DirectionsBus fontSize="small" />} label="Double" value={bus.isDoubleDecker ? 'Yes' : 'No'} />
                </Grid>

                <Divider sx={{ my: 1.5 }} />

                {/* ───────── action buttons ───────── */}
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteBusId(bus.vehicleId);
                        setShowDeleteConfirmDialog(true);
                      }}
                    >
                      Delete
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <div onClick={e => e.stopPropagation()}>
                      <AddVehiclePhoto
                        vehicleId={bus.vehicleId}
                        onUploaded={() => {}}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={e => {
                        e.stopPropagation();
                        navigate('/dashboard/vehiclehistory', {
                          state: { vehicleId: bus.vehicleId, showCreateForm: true }
                        });
                      }}
                    >
                      History
                    </Button>
                  </Grid>
                </Grid>

                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={e => {
                    e.stopPropagation();
                    setVehicle(bus.vehicleId);
                    setConfirm(true);
                  }}
                  sx={{ mt: 1 }}
                >
                  Clear Photos
                </Button>

                <Divider sx={{ my: 1 }} />

                {/* ───────── availability chip ───────── */}
                <Chip
                  size="small"
                  label={bus.isAvailable ? 'Available' : 'Unavailable'}
                  icon={
                    bus.isAvailable ? (
                      <CheckCircle fontSize="small" />
                    ) : (
                      <Cancel fontSize="small" />
                    )
                  }
                  color={bus.isAvailable ? 'success' : 'error'}
                  sx={{ mt: 0.5, px: 1 }}
                />
              </Item>
            </Grid>
          );
        })}
      </Grid>

      {/* ───────── clear-photos confirmation ───────── */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirm(false)}>
        <DialogTitle>Confirm Clear Photos</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete all photos for this bus?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button color="error" onClick={handleClearPhotos}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/* utility sub-component */
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

export default BusGrid;
