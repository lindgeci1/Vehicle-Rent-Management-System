import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Divider,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  DirectionsBus,
  LocalGasStation,
  EventSeat,
  SyncAlt,
  Luggage,
  Wc,
  MeetingRoom,      // door icon
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  ArrowBackIosNew,
  ArrowForwardIos
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/apiClient';

const BusDialog = ({ open, onClose, vehicle, startDate, endDate }) => {
  const navigate                        = useNavigate();
  const [photoIndex, setPhotoIndex]     = useState(0);
  const [dailyCost, setDailyCost]       = useState(null);
  const [history, setHistory]           = useState(null);
  const [ratings, setRatings]           = useState([]);
  const [customers, setCustomers]       = useState([]);

  const photos         = vehicle?.photos ?? [];
  const currentPhoto   = photos[photoIndex];

  /* ───────────────────────── fetches ───────────────────────── */
  useEffect(() => {
    if (open && vehicle?.vehicleId) {
      fetchDailyCost();
      fetchVehicleHistory(vehicle.vehicleId);
      fetchVehicleRatings(vehicle.vehicleId);
    }
  }, [open, vehicle]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers/customers');
        setCustomers(res.data.$values || res.data);
      } catch (err) {
        console.error('[BusDialog] customers fetch error:', err);
      }
    };
    fetchCustomers();
  }, []);

  const fetchDailyCost = async () => {
    try {
      const res = await api.get(`/vehicles/vehicle/${vehicle.vehicleId}/daily-cost`);
      setDailyCost(res.data);
    } catch (err) {
      console.error('[BusDialog] daily cost fetch error:', err);
    }
  };

  const fetchVehicleHistory = async id => {
    try {
      const res = await api.get(`/vehicle-histories/vehicle/${id}`);
      setHistory(res.data);
    } catch (err) {
      console.error('[BusDialog] history fetch error:', err);
      setHistory(null);
    }
  };

  const fetchVehicleRatings = async id => {
    try {
      const res = await api.get(`/vehicles/${id}/ratings`);
      setRatings(res.data);
    } catch (err) {
      console.error('[BusDialog] ratings fetch error:', err);
      setRatings([]);
    }
  };

  const getUsernameById = id => {
    const c = customers.find(u => u.userId === id);
    return c ? c.username : `Customer #${id}`;
  };

  /* ───────────────────────── helpers ───────────────────────── */
  const renderYesNoIcon = cond =>
    cond ? (
      <Tooltip title="Yes">
        <CheckIcon color="success" />
      </Tooltip>
    ) : (
      <Tooltip title="No">
        <CancelIcon color="error" />
      </Tooltip>
    );

  const handleReserve = () => {
    navigate('/dashboard/reservation', {
      state: { vehicleId: vehicle.vehicleId, showCreateForm: true, startDate, endDate }
    });
    onClose();
  };

  const handlePrevPhoto = () => photos.length > 1 && setPhotoIndex(i => (i === 0 ? photos.length - 1 : i - 1));
  const handleNextPhoto = () => photos.length > 1 && setPhotoIndex(i => (i === photos.length - 1 ? 0 : i + 1));

  /* ───────────────────────── render ───────────────────────── */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.4rem', pb: 0 }}>
        <DirectionsBus sx={{ mr: 1, verticalAlign: 'middle' }} />
        Images
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {vehicle ? (
          <>
            {/* ───────── photo navigator ───────── */}
            <Box
              sx={{
                width: '100%',
                height: 300,
                mb: 2,
                borderRadius: 2,
                backgroundColor: '#f0f0f0',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {currentPhoto ? (
                <Box
                  component="img"
                  src={currentPhoto.url}
                  alt={`${vehicle.mark} ${vehicle.model}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography color="text.secondary">No Image</Typography>
              )}

              {photos.length > 1 && (
                <>
                  <ArrowBackIosNew
                    onClick={handlePrevPhoto}
                    sx={{ position: 'absolute', left: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
                  />
                  <ArrowForwardIos
                    onClick={handleNextPhoto}
                    sx={{ position: 'absolute', right: 8, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}
                  />
                </>
              )}
            </Box>

            {/* ───────── vehicle history ───────── */}
            {history && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Vehicle History
                </Typography>
                <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: 2, mb: 3, border: '1px solid #e0e0e0' }}>
                  <Grid container spacing={2}>
                    <InfoItem label="Total KM Driven:" value={`${history.km.toFixed(2)} km`} />
                    <InfoItem label="Previous Drivers:" value={history.numberOfDrivers} />
                    <InfoItem label="Accidents:" value={renderYesNoIcon(history.hasHadAccident)} />
                    {history.hasHadAccident && (
                      <InfoItem label="Accident Details:" value={history.accidentDescription} />
                    )}
                  </Grid>
                </Box>
              </>
            )}

            {/* ───────── ratings ───────── */}
            {ratings.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Vehicle Ratings
                </Typography>
                <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: 2, mb: 3, border: '1px solid #e0e0e0' }}>
                  <Grid container spacing={2}>
                    {ratings.map((r, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            Rating: {r.ratingValue} / 5
                          </Typography>
                          <Typography color="text.secondary">
                            {r.reviewComment ? `"${r.reviewComment}"` : 'No comment provided.'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getUsernameById(r.customerId)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            )}

            {/* ───────── specifications ───────── */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Specifications
            </Typography>
            <Box sx={{ backgroundColor: '#f9f9f9', p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <InfoItem label="Mark:" value={vehicle.mark} />
                <InfoItem label="Model:" value={vehicle.model} />
                <InfoItem label="Year:" value={vehicle.year} />
                <InfoItem label="Fuel:" value={vehicle.fuelType} icon={<LocalGasStation />} />
                <InfoItem label="Seats:" value={vehicle.seatingCapacity} icon={<EventSeat />} />
                <InfoItem label="Transmission:" value={vehicle.transmission || 'N/A'} icon={<SyncAlt />} />
                <InfoItem label="Doors:" value={vehicle.numberOfDoors} icon={<MeetingRoom />} />
                <InfoItem label="Luggage:" value={renderYesNoIcon(vehicle.hasLuggageCompartment)} icon={<Luggage />} />
                <InfoItem label="Toilet:" value={renderYesNoIcon(vehicle.hasToilet)} icon={<Wc />} />
                <InfoItem label="Double-Decker:" value={renderYesNoIcon(vehicle.isDoubleDecker)} icon={<DirectionsBus />} />
              </Grid>
            </Box>

            {/* ───────── costs ───────── */}
            <Divider sx={{ my: 2 }} />
            {dailyCost !== null && (
              <CostRow label="Cost Per Day:" value={`$${dailyCost}`} />
            )}
            <CostRow label="Prepay Fee:" value={`$${vehicle.prepayFee}`} />

          </>
        ) : (
          <Typography variant="body2">Loading bus details...</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {vehicle && (
          <Button variant="contained" color="success" onClick={handleReserve}>
            Reserve This Bus
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

/* ────────────────────── helpers ────────────────────── */
const InfoItem = ({ label, value, icon }) => (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon && <Box component="span" sx={{ mr: 0.5 }}>{icon}</Box>}
        <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Box>{typeof value === 'string' || typeof value === 'number' ? <Typography>{value}</Typography> : value}</Box>
    </Box>
  </Grid>
);

const CostRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mt: 1 }}>
    <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
    <Typography>{value}</Typography>
  </Box>
);

export default BusDialog;
