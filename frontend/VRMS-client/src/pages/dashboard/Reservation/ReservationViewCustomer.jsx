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
 import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  HourglassTop as PendingIcon,
  CheckCircle as ConfirmedIcon,
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import axios from 'axios';
 import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';
import ReservationDialog from './ReservationDialog';
 import { useLocation, useNavigate } from 'react-router-dom';
function ReservationViewCustomer({ reservations, getVehicleName, onAdd, onEdit, onDelete }) {

  const [vehiclePhotos, setVehiclePhotos] = useState({});
  const [photoIndices, setPhotoIndices] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);
  const token = Cookies.get('token');
  const decoded = decodeToken(token);
  const userId = decoded?.userId;
  const role = decoded?.role;

   const location = useLocation();
   const navigate = useNavigate();
// console.log('Logged in userId:', userId, 'Role:', role);
// console.log('Reservations:', reservations);

const filteredReservations = role === 'Customer'
  ? reservations.filter(r => r.customerId === Number(userId))
  : reservations;


  useEffect(() => {
    const fetchPhotos = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const photoData = {};
      for (const r of reservations) {
        try {
          const res = await api.get(`/vehicles/vehicle/${r.vehicleId}`, { headers });
          photoData[r.vehicleId] = res.data.photos || [];
        } catch (error) {
          console.error(`Error fetching vehicle ${r.vehicleId}:`, error);
          photoData[r.vehicleId] = [];
        }
      }
      setVehiclePhotos(photoData);
    };

    if (reservations.length > 0 && token) fetchPhotos();
  }, [reservations, token]);

  useEffect(() => {
    const intervals = {};
    Object.keys(vehiclePhotos).forEach((vehicleId) => {
      const photos = vehiclePhotos[vehicleId];
      if (photos.length > 1) {
        intervals[vehicleId] = setInterval(() => {
          setPhotoIndices((prev) => ({
            ...prev,
            [vehicleId]: ((prev[vehicleId] || 0) + 1) % photos.length,
          }));
        }, 3000);
      }
    });
    return () => Object.values(intervals).forEach(clearInterval);
  }, [vehiclePhotos]);

  const handleCardClick = (reservationId) => {
    setSelectedReservationId(reservationId);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedReservationId(null);
  };

return (
  <Box>
<Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
  <Typography variant="h5" fontWeight={600}>
    My Reservations
  </Typography>
  {/* <Button
    variant="contained"
    color="primary"
    startIcon={<Add />}
    onClick={onAdd}
  >
    Add
  </Button> */}
</Stack>

{filteredReservations.length === 0 && (
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
        sx={{
          width: 60,
          height: 60,
          color: 'gray'
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
        />
      </Box>
    </Box>

    <Typography variant="h6" fontWeight={600} gutterBottom>
      No Reservations Found
    </Typography>
    <Typography variant="body2" color="text.secondary">
      You haven’t booked any reservations yet. Once you do, they will appear here.
    </Typography>
  </Box>
)}




    <Grid container spacing={2}>
      {filteredReservations.map((r) => {
        const photos = vehiclePhotos[r.vehicleId] || [];
        const currentPhoto = photos[photoIndices[r.vehicleId] || 0];

        return (
          <Grid item xs={12} md={6} key={r.reservationId}>
            <Box onClick={() => handleCardClick(r.reservationId)} sx={{ cursor: 'pointer' }}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 200,
                    width: '100%',
                    overflow: 'hidden',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    backgroundColor: '#f4f4f4'
                  }}
                >
                  {currentPhoto ? (
                    <CardMedia
                      component="img"
                      image={currentPhoto.url}
                      alt="Vehicle"
                      sx={{ height: '100%', width: 320, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        width: 320, // ✅ fixed width
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        color: '#888'
                      }}
                    >
                      No Image
                    </Box>
                  )}
                </Box>

                <CardHeader
                  avatar={<CarIcon color="inherit" />}
                  title={getVehicleName(r.vehicleId)}
                  titleTypographyProps={{ fontWeight: 600, fontSize: 16 }}
                />

                <Divider />

                <CardContent>
                  <Stack spacing={1.5}>
                    <InfoLine label="Start Date" value={r.startDate} />
                    <InfoLine label="End Date" value={r.endDate} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={500}>
                        Status:
                      </Typography>
                      <Chip
                        size="small"
                        label={r.status}
                        color={r.status === 'Pending' ? 'warning' : 'success'}
                        icon={r.status === 'Pending' ? <PendingIcon /> : <ConfirmedIcon />}
                        sx={{ minWidth: 90 }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>

                <Divider sx={{ mx: 2 }} />

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, gap: 1 }}>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(r.reservationId);
                    }}
                    disabled={r.status === 'Reserved'}
                    startIcon={<DeleteIcon />}
                  >
                    {/* Delete */}
                  </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/dashboard/vehiclerating', {
                    state: {
                      vehicleId: r.vehicleId,
                      showCreateForm: true
                    }
                  });
                }}
              >
                Rating
              </Button>
                </CardActions>
              </Card>
            </Box>
          </Grid>
        );
      })}
    </Grid>

    <ReservationDialog
      open={dialogOpen}
      onClose={handleDialogClose}
      reservationId={selectedReservationId}
    />
  </Box>
);

}
const InfoLine = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" fontWeight={500}>
      {label}:
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export default ReservationViewCustomer;
