// src/components/vehicle/ratings/VehicleRatingViewCustomer.jsx

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  Stack,
  IconButton
} from '@mui/material'
import {
  DirectionsCar as CarIcon,
  CalendarToday,
  Star as StarIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import { api } from '@/apiClient'
import Cookies from 'js-cookie'
import { decodeToken } from '../../../../decodeToken'
 import { Add } from '@mui/icons-material';
function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return isNaN(d) ? 'N/A' : d.toLocaleDateString('en-GB')
}

const VehicleRatingViewCustomer = ({
  ratings,
  getVehicleName,
  getCustomerName,
  onEdit,
  onDelete,
  onAdd
}) => {
  const [vehiclePhotos, setVehiclePhotos] = useState({})
  const [photoIndices, setPhotoIndices] = useState({})
  const token = Cookies.get('token')

  // Fetch vehicle photos
  useEffect(() => {
    const fetchPhotos = async () => {
      const headers = { Authorization: `Bearer ${token}` }
      const map = {}

      await Promise.all(
        ratings.map(async (r) => {
          try {
            const res = await api.get(`/vehicles/vehicle/${r.vehicleId}`, { headers })
            map[r.vehicleId] = res.data.photos || []
          } catch (err) {
            console.error(`Failed to load photos for vehicle ${r.vehicleId}`, err)
            map[r.vehicleId] = []
          }
        })
      )
      setVehiclePhotos(map)
    }

    if (ratings.length) fetchPhotos()
  }, [ratings, token])

  // Rotate photos every 3 seconds
  useEffect(() => {
    const intervalMap = {}
    Object.keys(vehiclePhotos).forEach((vehicleId) => {
      if (vehiclePhotos[vehicleId]?.length > 1) {
        intervalMap[vehicleId] = setInterval(() => {
          setPhotoIndices((prev) => ({
            ...prev,
            [vehicleId]: ((prev[vehicleId] || 0) + 1) % vehiclePhotos[vehicleId].length
          }))
        }, 3000)
      }
    })
    return () => Object.values(intervalMap).forEach(clearInterval)
  }, [vehiclePhotos])

  return (
    <Box>
  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
    <Typography variant="h5" fontWeight={600}>
       My Vehicle Ratings
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

      {ratings.length === 0 && (
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
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </Box>
          </Box>

          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Vehicle Ratings Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven’t added any vehicle usage records yet. After completing a trip, the
            vehicle ratings will be shown here.
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {ratings.map((r) => {
          const photos = vehiclePhotos[r.vehicleId] || []
          const currentPhoto = photos[photoIndices[r.vehicleId] || 0]

          return (
            <Grid item xs={12} md={6} key={r.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  width: 330,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': { transform: 'translateY(-2px)', cursor: 'pointer' }
                }}
                onClick={() => onEdit(r.id)} // Entire card is clickable to open update screen
              >
                {currentPhoto && (
                  <Box
                    sx={{
                      height: 200,
                      width: 330,
                      mx: 'auto',
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
                  avatar={<CarIcon color="primary" />}
                  title={getVehicleName(r.vehicleId)}
                  titleTypographyProps={{ fontWeight: 600, fontSize: 16 }}
                  subheader={formatDate(r.createdAt)}
                />
                <Divider />

                <CardContent>
                  <Stack spacing={1.5}>
                    <InfoRow
                      label="Customer"
                      value={getCustomerName(r.customerId)}
                      icon={<PersonIcon fontSize="small" />}
                    />
                    <InfoRow
                      label="Rating"
                      value={`${r.ratingValue} / 5`}
                      icon={<StarIcon fontSize="small" />}
                    />
                    <InfoRow
                      label="Comment"
                      value={r.reviewComment || 'No comment'}
                      icon={<CalendarToday fontSize="small" />}
                    />
                  </Stack>
                </CardContent>

                <Divider sx={{ mx: 2 }} />

                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {/* Edit button */}
                  {/* <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent the card onClick from firing
                      onEdit(r.id)
                    }}
                  >
                    <EditIcon />
                  </IconButton> */}

                  {/* Delete button */}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent the card onClick from firing
                      onDelete(r.id)
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

const InfoRow = ({ label, value, icon }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" fontWeight={500}>
        {label}:
      </Typography>
    </Stack>
    <Typography variant="body2">{value || 'N/A'}</Typography>
  </Stack>
)

export default VehicleRatingViewCustomer
