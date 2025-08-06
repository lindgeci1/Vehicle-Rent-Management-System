import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Stack,
  Chip,
  Divider,
  Button,
  CardMedia,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ConfirmedIcon,
  Event,
  DateRange,
  LocalGasStation,
  EventSeat,
  SyncAlt,
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';
import ReservationDialog from './ReservationDialog';
import { useNavigate } from 'react-router-dom';

function ReservationViewCustomer({ reservations, getVehicleName, onDelete }) {
  const [vehiclePhotos, setVehiclePhotos] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const token = Cookies.get('token');
  const decoded = decodeToken(token);
  const userId = decoded?.userId;
  const role = decoded?.role;
  const navigate = useNavigate();

  const filteredReservations = role === 'Customer'
    ? reservations.filter(r => r.customerId === Number(userId))
    : reservations;

  useEffect(() => {
    async function fetchPhotos() {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const photoData = {};
        for (const r of reservations) {
          const res = await api.get(`/vehicles/vehicle/${r.vehicleId}`, { headers });
          photoData[r.vehicleId] = res.data;
        }
        setVehiclePhotos(photoData);
      } catch {
        // silently ignore errors here
      }
    }
    if (reservations.length) fetchPhotos();
  }, [token, reservations]);

  const handleCardClick = (id) => {
    setSelectedReservationId(id);
    setDialogOpen(true);
  };

  return (
    <Box className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-6">
      {/* Header */}
      <Box textAlign="center" mb={5}>
        <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,         // makes it bold like 'font-semibold'
                     color: '#0f172a', // exact match for Tailwind's text-blue-gray-900
                  }}
                >
                  Your Reservations
                </Typography>
        <Typography
          variant="body2"
          className="text-blue-gray-500 italic px-2 mt-6"
          textAlign="center"
        >
          This section displays all your vehicle reservations, helping you track your rental history and manage future bookings efficiently.
        </Typography>
      </Box>


      <Box maxWidth={1200} mx="auto" >
        {filteredReservations.length === 0 ? (
          <Box
           sx={{
            textAlign: 'center',
            mt: 6,
            mb: 4,
            px: 3,
            py: 5,
            borderRadius: 3,
            backgroundColor: '#f9f9f9',
            border: '1px dashed #ccc',
            maxWidth: 500,
            mx: 'auto',
            boxShadow: 1
          }}
          >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              sx={{ width: 60, height: 60, color: 'gray' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
            </Box>
          </Box>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Reservations Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You currently have no active reservations. When you make a booking, your reservation details will be displayed here.
          </Typography>

          </Box>
        ) : (
<Grid
  container
  spacing={4}
  justifyContent="center"
  direction="row-reverse"
>
  {filteredReservations.map((r) => {
    const vehicle = vehiclePhotos[r.vehicleId] || {};
    const photoUrl = vehicle.photos?.[0]?.url || null;

    return (
      <Grid item xs={12} sm={6} md={3} key={r.reservationId}>
<Card
  onClick={() => handleCardClick(r.reservationId)}
  sx={{
    cursor: 'pointer',
    borderRadius: 3,
    boxShadow: 4,
    bgcolor: 'background.paper',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      boxShadow: 6,
      '& .card-details': {
        opacity: 1,
        transform: 'translateY(0)',
        maxHeight: 1000,
        pointerEvents: 'auto',
      },
    },
  }}
>
  {/* Vehicle Image */}
  <Box
    sx={{
      height: 330,
      width: 350,
      maxWidth: 350,
      bgcolor: '#eaeaea',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      mx: 'auto',
    }}
  >
    {photoUrl ? (
      <CardMedia
        component="img"
        src={photoUrl}
        alt={`${vehicle.mark || 'Vehicle'} Image`}
        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <Typography color="text.disabled" variant="subtitle1">
        No Image Available
      </Typography>
    )}
  </Box>

  {/* Always visible part */}
  <Box sx={{ px: 2 }}>
    <CardHeader
      avatar={<CarIcon color="primary" />}
      title={getVehicleName(r.vehicleId)}
      titleTypographyProps={{ fontWeight: 600, fontSize: 18 }}
      sx={{ pb: 1 }}
    />
    <Box borderBottom="1px solid #e0e0e0" mb={1} />
    
    <Box sx={{ mb: 1.5 }}>
      <InfoLine label="Start Date" value={r.startDate} icon={<Event fontSize="small" />} sx={{ mb: 1 }} />
      <InfoLine label="End Date" value={r.endDate} icon={<DateRange fontSize="small" />} />
    </Box>
  </Box>

  {/* Hovered content */}
  <Box
    className="card-details"
    sx={{
      opacity: 0,
      maxHeight: 0,
      transform: 'translateY(-10px)',
      overflow: 'hidden',
      pointerEvents: 'none',
      transition: 'all 0.7s ease',
    }}
  >
    <CardContent sx={{ pt: 0 }}>
      <Stack spacing={1.5}>
        {/* Status */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Status:
          </Typography>
          <Chip
            size="small"
            label={r.status}
            variant="outlined"
            color={
              r.status === 'Pending' ? 'warning' :
              r.status === 'Reserved' ? 'success' :
              r.status === 'Conflict' ? 'error' : 'default'
            }
            icon={
              r.status === 'Pending' ? <PendingIcon sx={{ fontSize: 18 }} /> :
              r.status === 'Reserved' ? <ConfirmedIcon sx={{ fontSize: 18 }} /> :
              r.status === 'Conflict' ? <DeleteIcon sx={{ fontSize: 18 }} /> : null
            }
            sx={{
              fontWeight: 600,
              textTransform: 'capitalize',
              px: 1.4,
              py: 0.5,
              borderRadius: '8px',
              fontSize: '0.75rem',
              backgroundColor:
                r.status === 'Pending' ? 'rgba(255, 193, 7, 0.08)' :
                r.status === 'Reserved' ? 'rgba(76, 175, 80, 0.08)' :
                r.status === 'Conflict' ? 'rgba(244, 67, 54, 0.08)' :
                'rgba(0, 0, 0, 0.04)',
              border: 'none',
              color:
                r.status === 'Pending' ? '#FF9800' :
                r.status === 'Reserved' ? '#4CAF50' :
                r.status === 'Conflict' ? '#F44336' :
                '#555',
            }}
          />
        </Stack>

        {/* Specs */}
        {(vehicle.mark || vehicle.model) && (
          <>
            <Box borderBottom="1px solid #e0e0e0" />
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {vehicle.mark} {vehicle.model} {vehicle.year ? `• ${vehicle.year}` : ''}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {vehicle.fuelType && (
                  <Chip
                    size="small"
                    icon={<LocalGasStation fontSize="small" />}
                    label={vehicle.fuelType}
                  />
                )}
                {vehicle.transmission && (
                  <Chip
                    size="small"
                    icon={<SyncAlt fontSize="small" />}
                    label={vehicle.transmission}
                  />
                )}
                {vehicle.seatingCapacity && (
                  <Chip
                    size="small"
                    icon={<EventSeat fontSize="small" />}
                    label={`${vehicle.seatingCapacity} seats`}
                  />
                )}
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </CardContent>

    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, gap: 1 }}>
      {r.status === 'Reserved' && (
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/dashboard/vehiclerating', {
              state: {
                vehicleId: r.vehicleId,
                showCreateForm: true,
              },
            });
          }}
        >
          Rate
        </Button>
      )}

      <Button
        variant="outlined"
        color={r.status === 'Reserved' ? 'warning' : 'error'}
        size="small"
        disabled={r.status === 'Reserved'}
        startIcon={r.status === 'Reserved' ? null : <DeleteIcon />}
        onClick={(e) => {
          e.stopPropagation();
          if (r.status !== 'Reserved') {
            onDelete(r.reservationId);
          }
        }}
      >
        Cancel
      </Button>
    </CardActions>
  </Box>
</Card> </Grid>
);})}
</Grid>

        )}
<Grid container spacing={4}>
        {filteredReservations.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            mt={6}
            px={2}
            textAlign="center"
            fontStyle="italic"
          >
           
          </Typography>
        )}
        </Grid>
      </Box>

      <ReservationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reservationId={selectedReservationId}
      />
    </Box>
  );
}

const InfoLine = ({ label, value, icon }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    {icon && React.cloneElement(icon, { color: 'primary', sx: { minWidth: 20 } })}
    <Typography variant="body2" fontWeight={600} minWidth={75}>
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary" flexShrink={1} noWrap>
      {value}
    </Typography>
  </Stack>
);

export default ReservationViewCustomer;
