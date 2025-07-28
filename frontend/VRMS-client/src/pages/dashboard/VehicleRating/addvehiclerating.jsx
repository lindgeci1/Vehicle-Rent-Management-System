import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  FormHelperText
} from '@mui/material';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { decodeToken } from '../../../../decodeToken';
import { showSuccess } from '../../../crudNotifications';
import { Rating } from '@mui/material';
import { use } from 'react';
export function AddVehicleRating({ onClose, vehicleId, onAdded }) {
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    customerId: '',
    ratingValue: '',
    reviewComment: ''
  });
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const token = Cookies.get('token');
  const payload = token ? decodeToken(token) : {};

  // Prefill customerId from token if available
useEffect(() => {
  if (payload.role === 'Customer' && payload.userId) {
    setFormData(fd => ({ ...fd, customerId: parseInt(payload.userId, 10) }));
  }
}, [payload.userId, payload.role]);


  // Prefill vehicleId if passed
  useEffect(() => {
    if (vehicleId) {
      setFormData(fd => ({ ...fd, vehicleId }));
    }
  }, [vehicleId]);

  // Fetch customers and vehicles for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, vehRes] = await Promise.all([
          api.get('/customers/customers'),
          api.get('/vehicles/vehicles')
        ]);
        setCustomers(custRes.data.$values || custRes.data);
        setVehicles(vehRes.data.$values || vehRes.data);
      } catch (err) {
        console.error('Failed to fetch dropdown data', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleAdd = async () => {
    const required = ['customerId', 'vehicleId', 'ratingValue'];
    const missing = required.filter(f => !formData[f]);
    if (missing.length) {
      setErrorMessage(`Please fill in: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const resp = await api.post('/vehicle-ratings/create-rating', formData);
      if (resp.status === 200 && resp.data) {
      showSuccess('Vehicle rating created successfully');
      onAdded(resp.data);
      onClose();
      }

    } catch (error) {
      console.error('Error creating rating:', error);
      setErrorMessage(error.response?.data?.message || 'Something went wrong.');
      setOpenSnackbar(true);
    }
  };

return (
  <>
    <Modal
      open
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          width: 475,
          mx: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Add Vehicle Rating
        </Typography>

        <Grid container spacing={2}>
          {/* Customer */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              select
              label="Customer"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              fullWidth
              disabled={payload.role === 'Customer'}

            >
              {customers.map(c => (
                <MenuItem key={c.userId} value={c.userId}>
                  {c.username}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select a customer for the rating</FormHelperText>
          </Grid>

          {/* Vehicle */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              select
              label="Vehicle"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              fullWidth
              disabled={!!vehicleId}
            >
              {vehicles.map(v => (
                <MenuItem key={v.vehicleId} value={v.vehicleId}>
                  {v.mark} {v.model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the vehicle for the rating</FormHelperText>
          </Grid>

        {/* Rating */}
        <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            Rating (1–5)
          </Typography>
          <Rating
            name="ratingValue"
            value={Number(formData.ratingValue)}
            onChange={(event, newValue) => {
              setFormData(prev => ({ ...prev, ratingValue: newValue || 0 }));
            }}
            precision={1}
            size="medium"
          />
          <FormHelperText>Rate the vehicle from 1 to 5</FormHelperText>
        </Grid>

          {/* Comment */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Comment"
              name="reviewComment"
              value={formData.reviewComment}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <FormHelperText>Optional: write your feedback</FormHelperText>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={handleAdd} sx={{ minWidth: 100 }}>
            Create
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>

    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={() => setOpenSnackbar(false)}
    >
      <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  </>
);


}

export default AddVehicleRating;
