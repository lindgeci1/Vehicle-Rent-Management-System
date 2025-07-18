import React, { useState, useEffect } from 'react';
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
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  DirectionsCar,
  AcUnit,
  Navigation,
  WbSunny,
  LocalGasStation,
  EventSeat,
  Work,
  ArrowBackIosNew,
  ArrowForwardIos,
  SyncAlt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/apiClient';
const CarDialog = ({ open, onClose, vehicle, startDate, endDate }) => {
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);
const [history, setHistory] = useState(null);
  const photos = vehicle?.photos || [];
  const [ratings, setRatings] = useState([]);
  const currentPhoto = photos[photoIndex];
  const [customers, setCustomers] = useState([]);
const [dailyCost, setDailyCost] = useState(null);
useEffect(() => {
  if (open && vehicle?.vehicleId) {
    fetchVehicleHistory(vehicle.vehicleId);
    fetchVehicleRatings(vehicle.vehicleId); // 👈 Add this line
  }
}, [open, vehicle]);
useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/customers');
      setCustomers(response.data.$values || response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };
  fetchCustomers();
}, []);
useEffect(() => {
  const fetchDailyCost = async () => {
    if (!vehicle?.vehicleId) return;

    try {
      const response = await api.get(`/vehicles/vehicle/${vehicle.vehicleId}/daily-cost`);
      setDailyCost(response.data);
    } catch (error) {
      console.error('Failed to fetch daily cost:', error);
    }
  };

  fetchDailyCost();
}, [vehicle]);

  const renderYesNoIcon = (condition) =>
    condition ? (
      <Tooltip title="Yes">
        <CheckIcon color="success" />
      </Tooltip>
    ) : (
      <Tooltip title="No">
        <CancelIcon color="error" />
      </Tooltip>
    );
const getUsernameById = (id) => {
  const customer = customers.find(c => c.userId === id);
  return customer ? customer.username : `Customer #${id}`;
};
  const handleReserve = () => {
    navigate('/dashboard/reservation', {
      state: {
        vehicleId: vehicle.vehicleId,
        showCreateForm: true,
        startDate,
        endDate
      }
    });
    onClose();
  };

  const handlePrevPhoto = () => {
    if (photos.length > 1) {
      setPhotoIndex((idx) => (idx === 0 ? photos.length - 1 : idx - 1));
    }
  };

  const handleNextPhoto = () => {
    if (photos.length > 1) {
      setPhotoIndex((idx) => (idx === photos.length - 1 ? 0 : idx + 1));
    }
  };
const fetchVehicleHistory = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicle-histories/vehicle/${vehicleId}`);
    setHistory(response.data);
  } catch (err) {
    console.error("Failed to fetch vehicle history:", err);
    setHistory(null);
  }
};
const fetchVehicleRatings = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/ratings`);
    setRatings(response.data);
  } catch (err) {
    console.error("Failed to fetch vehicle ratings:", err);
    setRatings([]);
  }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.4rem', pb: 0 }}>
        <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
        Images
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {vehicle ? (
          <>
            {/* Photo Navigator */}
            <Box
              sx={{
                width: '100%',
                height: 300,
                borderRadius: 2,
                backgroundColor: '#f0f0f0',
                mb: 2,
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
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Typography color="text.secondary">No Image</Typography>
              )}

              {photos.length > 1 && (
                <>                  
                  <ArrowBackIosNew
                    onClick={handlePrevPhoto}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      zIndex: 1
                    }}
                  />
                  <ArrowForwardIos
                    onClick={handleNextPhoto}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      zIndex: 1
                    }}
                  />
                </>
              )}
            </Box>
          {history && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Vehicle History
              </Typography>
              <Box sx={{
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 2,
                mb: 3,
                border: '1px solid #e0e0e0'
              }}>
                <Grid container spacing={2}>
                  <InfoItem label="Total KM Driven: " value={`${history.km.toFixed(2)} km`} />

                  <InfoItem label="Previous Drivers: " value={history.numberOfDrivers} />
                  <InfoItem label="Accidents: " value={renderYesNoIcon(history.hasHadAccident)} />
                  {history.hasHadAccident && (
                    <InfoItem label="Accident Details: " value={history.accidentDescription} />
                  )}
                </Grid>
              </Box>
            </>
          )}
          {ratings.length > 0 && (
  <>
    <Divider sx={{ my: 3 }} />
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
      Vehicle Ratings
    </Typography>
    <Box sx={{
      backgroundColor: '#f9f9f9',
      p: 2,
      borderRadius: 2,
      mb: 3,
      border: '1px solid #e0e0e0'
    }}>
      <Grid container spacing={2}>
        {ratings.map((r, index) => (
          <Grid item xs={12} key={index}>
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  <Typography sx={{ fontWeight: 500 }}>
    Rating: {r.ratingValue} / 5 
  </Typography>
  <Typography sx={{ color: 'text.secondary' }}>
    {r.reviewComment ? `"${r.reviewComment}"` : 'No comment provided.'}
  </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {getUsernameById(r.customerId)}
      </Typography>
</Box>

          </Grid>
        ))}
      </Grid>
    </Box>
  </>
)}

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Specifications
          </Typography>
          <Box sx={{
            backgroundColor: '#f9f9f9',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}>
            <Grid container spacing={2}>
              <InfoItem label="Mark: " value={vehicle.mark} />
              <InfoItem label="Model: " value={vehicle.model} />
              <InfoItem label="Year: " value={vehicle.year} />
              <InfoItem label="Fuel: " value={vehicle.fuelType} icon={<LocalGasStation />} />
              <InfoItem label="Seats: " value={vehicle.seatingCapacity} icon={<EventSeat />} />
              <InfoItem label="Trunk: " value={`${vehicle.trunkCapacity}L`} icon={<Work />} />
              <InfoItem label="Transmission: " value={vehicle.transmission || 'N/A'} icon={<SyncAlt />} />
              <InfoItem label="AC: " value={renderYesNoIcon(vehicle.hasAirConditioning)} icon={<AcUnit />} />
              <InfoItem label="Nav: " value={renderYesNoIcon(vehicle.hasNavigationSystem)} icon={<Navigation />} />
              <InfoItem label="Sunroof:" value={renderYesNoIcon(vehicle.hasSunroof)} icon={<WbSunny />} />
            </Grid>
          </Box>



            <Divider sx={{ my: 2 }} />
{dailyCost !== null && (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, mt: 1 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography sx={{ fontWeight: 500 }}>Cost Per Day:</Typography>
      <Tooltip title="This is the base cost per day for renting this vehicle." arrow>
        <IconButton size="small">
          <i className="fas fa-info-circle" style={{ fontSize: '1rem' }}></i>
        </IconButton>
      </Tooltip>
    </Box>
    <Typography>${dailyCost}</Typography>
  </Box>
)}

<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <Typography sx={{ fontWeight: 500 }}>Prepay Fee:</Typography>
    <Tooltip title="Prepayment is required to confirm the reservation." arrow>
      <IconButton size="small">
        <i className="fas fa-info-circle" style={{ fontSize: '1rem' }}></i>
      </IconButton>
    </Tooltip>
  </Box>
  <Typography>${vehicle.prepayFee}</Typography>
</Box>


          </>
        ) : (
          <Typography variant="body2">Loading vehicle information...</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
        {vehicle && (
          <Button onClick={handleReserve} variant="contained" color="success">
            Reserve This Vehicle
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const InfoItem = ({ label, value, icon }) => (
  <Grid item xs={6}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon && <Box component="span" sx={{ mr: 0.5 }}>{icon}</Box>}
        <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Box>
        {typeof value === 'string' || typeof value === 'number'
          ? <Typography>{value}</Typography>
          : value
        }
      </Box>
    </Box>
  </Grid>
);

export default CarDialog;
