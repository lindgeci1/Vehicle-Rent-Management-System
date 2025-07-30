// src/components/vehicle/ratings/VehicleRatingViewCustomer.jsx

import React, { useEffect, useState } from 'react'
import { Rating } from '@mui/material'
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


  return (
    <Box className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-6">
      {/* Header */}
      <Box textAlign="center" mb={5}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: '#0f172a',
          }}
        >
          My Vehicle Ratings
        </Typography>
        <Typography
          variant="body2"
          className="text-blue-gray-500 italic px-2 mt-6"
          textAlign="center"
        >
          After completing trips, your vehicle ratings will appear here to help you track your experience.
        </Typography>
      </Box>

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
<Grid container spacing={4} justifyContent="center">
  {ratings.map((r) => {
    const photos = vehiclePhotos[r.vehicleId] || []
    const currentPhoto = photos[0]

    return (
      <Grid item xs={12} sm={6} md={3} key={r.id}>
        <Card
          onClick={() => onEdit(r.id)}
          sx={{
            cursor: 'pointer',
            borderRadius: 3,
            boxShadow: 4,
            bgcolor: 'background.paper',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            width: 300,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          {/* Vehicle Image */}
          <Box
            sx={{
              height: 200,
              width: '100%',
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
            {currentPhoto ? (
              <img
                src={currentPhoto.url}
                alt="Vehicle"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Typography color="text.disabled" variant="subtitle1" sx={{ p: 2 }}>
                No Image Available
              </Typography>
            )}
          </Box>

          {/* Header with vehicle name + rating date */}
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ mb: 0.5, color: 'text.primary' }}
              noWrap
              title={getVehicleName(r.vehicleId)}
            >
              {getVehicleName(r.vehicleId)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {formatDate(r.createdAt)}
            </Typography>
          </Box>

          <Box mt={1} mb={2} mx={2} borderBottom="1px solid #e0e0e0" />


          {/* Rating row with stars and value */}
          <Box sx={{ px: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>

              <Typography variant="body2" fontWeight={600} minWidth={60}>
                Rating:
              </Typography>
              <Typography variant="body2">
                {r.ratingValue} / 5
              </Typography>
            </Stack>

            {/* Comment row, label and value close */}
            <Stack direction="row" spacing={1} alignItems="flex-start" mb={1}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ whiteSpace: 'nowrap', minWidth: 60 }}
              >
                Comment:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ wordBreak: 'break-word', flex: 1 }}
              >
                {r.reviewComment || 'No comment'}
              </Typography>
            </Stack>
<Box mt={1} mb={2} mx={0} borderBottom="1px solid #e0e0e0" />

            {/* Add extra date info line if you want (e.g., updatedAt or rating date again) */}
            {/* <Stack direction="row" spacing={1} alignItems="center">
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatDate(r.updatedAt || r.createdAt)}
              </Typography>
            </Stack> */}
          </Box>


          {/* Actions */}
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation()
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
