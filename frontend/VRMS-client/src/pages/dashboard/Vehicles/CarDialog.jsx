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
  IconButton,
  CardMedia
} from '@mui/material';
import Rating from '@mui/material/Rating';
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

        {/* Vehicle Information */}
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
          <Grid container spacing={1.4}>
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



{/* Specific Info Grid */}
<Grid container spacing={1.5}>
  <Grid item xs={6}>
    <Typography variant="body2" fontWeight={600}>Trunk:</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Work fontSize="small" />
      <Typography variant="body2" color="text.secondary">{vehicle.trunkCapacity}L</Typography>
    </Box>
  </Grid>

  <Grid item xs={6}>
    <Typography variant="body2" fontWeight={600}>AC:</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <AcUnit fontSize="small" />
      {/* Better yes/no display */}
      <Typography variant="body2" color="text.secondary">
        {vehicle.hasAirConditioning ? 'Yes' : 'No'}
      </Typography>
    </Box>
  </Grid>

  <Grid item xs={6}>
    <Typography variant="body2" fontWeight={600}>Navigation:</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Navigation fontSize="small" />
      <Typography variant="body2" color="text.secondary">
        {vehicle.hasNavigationSystem ? 'Yes' : 'No'}
      </Typography>
    </Box>
  </Grid>

  <Grid item xs={6}>
    <Typography variant="body2" fontWeight={600}>Sunroof:</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <WbSunny fontSize="small" />
      <Typography variant="body2" color="text.secondary">
        {vehicle.hasSunroof ? 'Yes' : 'No'}
      </Typography>
    </Box>
  </Grid>
</Grid>


          </Grid>
        </Box>

        {/* Vehicle History */}
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

        {/* Vehicle Ratings */}
          {ratings.length > 0 && (
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
                Vehicle Ratings
              </Typography>
            <Grid container spacing={1.5}>
            {ratings.map((r, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Rating:
                    </Typography>
                    <Rating
                      name={`read-only-${index}`}
                      value={r.ratingValue}
                      readOnly
                      precision={0.5}
                      size="small" // makes stars smaller
                    />
                  </Box>
                  <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
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
          )}

        {/* Cost Section */}
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
            Cost Details
          </Typography>
          <Grid container spacing={1.5}>
            {dailyCost !== null && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography fontWeight={500}>Cost Per Day:</Typography>
                  <Tooltip title="This is the base cost per day for renting this vehicle." arrow>
                    <IconButton size="small">
                      <i className="fas fa-info-circle" style={{ fontSize: '1rem' }}></i>
                    </IconButton>
                  </Tooltip>
                  <Typography>${dailyCost}</Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={500}>Prepay Fee:</Typography>
                <Tooltip title="Prepayment is required to confirm the reservation." arrow>
                  <IconButton size="small">
                    <i className="fas fa-info-circle" style={{ fontSize: '1rem' }}></i>
                  </IconButton>
                </Tooltip>
                <Typography>${vehicle.prepayFee}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </>
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
        Loading vehicle information...
      </Typography>
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
