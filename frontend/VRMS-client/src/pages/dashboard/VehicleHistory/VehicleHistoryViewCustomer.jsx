import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack
} from '@mui/material';
import { DirectionsCar, Warning, History } from '@mui/icons-material';
import { api } from '@/apiClient';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';

function VehicleHistoryViewCustomer() {
  const [histories, setHistories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [vehiclePhotos, setVehiclePhotos] = useState({});
  const [photoIndices, setPhotoIndices] = useState({});
  const token = Cookies.get('token');
  const userId = decodeToken(token)?.userId;

  // Rotate vehicle photos every 3 seconds
  useEffect(() => {
    const intervalMap = {};
    Object.keys(vehiclePhotos).forEach((vehicleId) => {
      if (vehiclePhotos[vehicleId]?.length > 1) {
        intervalMap[vehicleId] = setInterval(() => {
          setPhotoIndices((prev) => ({
            ...prev,
            [vehicleId]: ((prev[vehicleId] || 0) + 1) % vehiclePhotos[vehicleId].length
          }));
        }, 3000);
      }
    });
    return () => Object.values(intervalMap).forEach(clearInterval);
  }, [vehiclePhotos]);

  // Fetch histories, vehicles, and photos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [historiesRes, vehiclesRes] = await Promise.all([
          api.get('/vehicle-histories/histories', { headers }),
          api.get('/vehicles/vehicles', { headers })
        ]);

        const allHistories = historiesRes.data.$values || historiesRes.data || [];
        const allVehicles = vehiclesRes.data.$values || vehiclesRes.data || [];

        setHistories(allHistories);
        setVehicles(allVehicles);

        const photoMap = {};
        await Promise.all(
          allVehicles.map(async (v) => {
            try {
              const res = await api.get(`/vehicles/vehicle/${v.vehicleId}`, { headers });
              photoMap[v.vehicleId] = res.data.photos || [];
            } catch (err) {
              console.error(`❌ Failed to load photos for vehicle ${v.vehicleId}`, err);
              photoMap[v.vehicleId] = [];
            }
          })
        );
        setVehiclePhotos(photoMap);
      } catch (err) {
        console.error('🚨 Error fetching vehicle histories:', err);
      }
    };

    fetchData();
  }, [token]);

  const getVehicleName = (id) => {
    const v = vehicles.find((x) => x.vehicleId === id);
    return v ? `${v.mark} ${v.model}` : id;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Vehicle History
      </Typography>
{histories.length === 0 && (
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
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </Box>
    </Box>

    <Typography variant="h6" fontWeight={600} gutterBottom>
      No Vehicle History Found
    </Typography>
    <Typography variant="body2" color="text.secondary">
      You haven’t added any vehicle usage records yet. After completing a trip, the vehicle history will be shown here.
    </Typography>
  </Box>
)}

      
      <Grid container spacing={2}>
        {histories.length === 0 ? (
          <Typography color="text.secondary" sx={{ px: 2 }}>
            {/* No vehicle history found. */}
          </Typography>
        ) : (
          histories.map((h) => {
            const photos = vehiclePhotos[h.vehicleId] || [];
            const currentPhoto = photos[photoIndices[h.vehicleId] || 0];

            return (
              <Grid item xs={12} md={6} key={h.id}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  {currentPhoto && (
                    <Box
                      sx={{
                        height: 200,
                        width: 320, // ✅ Fixed width for image section
                        overflow: 'hidden',
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        backgroundColor: '#f4f4f4'
                      }}
                    >
                      <img
                        src={currentPhoto.url}
                        alt="Vehicle"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  <CardHeader
                    avatar={<DirectionsCar />}
                    title={getVehicleName(h.vehicleId)}
                    titleTypographyProps={{ fontWeight: 600 }}
                  />
                  <Divider />
                  <CardContent>
                    <Box sx={{ minHeight: 140, minWidth: 200 }}>
                      <Stack spacing={1.2}>
                        <InfoRow label="KM Driven" value={`${h.km.toFixed(2)} km`} />
                        <InfoRow label="Number of Drivers" value={h.numberOfDrivers} />
                        <InfoRow
                          label="Had Accident"
                          value={h.hasHadAccident ? 'Yes' : 'No'}
                          icon={
                            h.hasHadAccident ? (
                              <Warning color="error" />
                            ) : (
                              <History color="disabled" />
                            )
                          }
                        />
                        <InfoRow
                          label="Accident Description"
                          value={h.hasHadAccident ? h.accidentDescription || 'N/A' : '—'}
                        />
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}

const InfoRow = ({ label, value, icon }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="body2" fontWeight={500}>
      {label}:
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);

export default VehicleHistoryViewCustomer;
