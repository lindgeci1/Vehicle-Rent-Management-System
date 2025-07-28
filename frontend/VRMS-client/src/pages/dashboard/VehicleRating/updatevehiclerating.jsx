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
  FormHelperText,
  MenuItem
} from '@mui/material';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { Rating } from '@mui/material';
import { showSuccess } from '../../../crudNotifications';
export function Updatevehiclerating({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Fetch existing rating
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await api.get(`/vehicle-ratings/rating/${id}`);
        setFormData(res.data);
        setOriginalData(res.data);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load rating.');
        setOpenSnackbar(true);
      }
    };
    fetchRating();
  }, [id]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [customersRes, vehiclesRes] = await Promise.all([
          api.get('/customers/customers'),
          api.get('/vehicles/vehicles')
        ]);
        // if your API wraps arrays in a $values property, unwrap it
        setCustomers(customersRes.data.$values || customersRes.data);
        setVehicles(vehiclesRes.data.$values || vehiclesRes.data);
      } catch (err) {
        console.error('Dropdown fetch error:', err);
        setErrorMessage('Failed to load customers or vehicles.');
        setOpenSnackbar(true);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    // validate required fields
    const required = ['customerId', 'vehicleId', 'ratingValue'];
    const missing = required.filter(f => !formData[f]);
    if (missing.length) {
      setErrorMessage(`Please fill in: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    // ensure something changed
    const changed = Object.keys(formData).some(
      key => formData[key] !== originalData[key]
    );
    if (!changed) {
      setErrorMessage('Make at least one change before updating.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const res = await api.put(
        `/vehicle-ratings/update-rating/${id}`,
        formData
      );
      if (res.status === 200 && res.data) {
      showSuccess('Rating updated successfully');
      onUpdated(res.data);
      onClose();
      }

    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to update rating.'
      );
      setOpenSnackbar(true);
    }
  };

  if (!formData) return null;

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
          Update Vehicle Rating
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
              disabled
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
              disabled
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
              value={formData.reviewComment || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
            <FormHelperText>Optional: write your feedback</FormHelperText>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={handleUpdate} sx={{ minWidth: 100 }}>
            Update
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

export default Updatevehiclerating;
