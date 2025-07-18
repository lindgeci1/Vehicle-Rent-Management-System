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
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
import { decodeToken } from '../../../../decodeToken';

const AddReservation = ({ onClose, onAdded, vehicleId, customerId, startDate, endDate }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    customerId: '',
    startDate: '',
    endDate: ''
  });

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const token = Cookies.get('token');
  const payload = token ? decodeToken(token) : {};

  useEffect(() => {
    setFormData({
      vehicleId: vehicleId || '',
      customerId: customerId || '',
      startDate: startDate || '',
      endDate: endDate || ''
    });
  }, [vehicleId, customerId, startDate, endDate]);

  useEffect(() => {
    if (payload.role === 'Customer' && payload.userId) {
      setFormData(fd => ({ ...fd, customerId: parseInt(payload.userId, 10) }));
    }
  }, [payload.userId, payload.role]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, vehicleRes] = await Promise.all([
          api.get('/customers/customers'),
          api.get('/vehicles/vehicles')
        ]);
        setCustomers(customerRes.data.$values || customerRes.data);
        setVehicles(vehicleRes.data.$values || vehicleRes.data);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const { customerId, vehicleId, startDate, endDate } = formData;
    if (!customerId || !vehicleId || !startDate || !endDate) {
      setErrorMessage('All fields are required.');
      setOpenSnackbar(true);
      return;
    }

    setIsSaving(true); // disable button and show "Saving..."

    try {
      const response = await api.post('/reservations/create-reservation', formData);

      if (response.status === 200 && response.data) {
        const newReservation = {
          ...response.data,
          startDate: response.data.startDate?.split('T')[0],
          endDate: response.data.endDate?.split('T')[0],
          createdAt: response.data.createdAt?.split('T')[0],
          updatedAt: response.data.updatedAt?.split('T')[0],
          status: response.data.status === 1 ? 'Reserved' : 'Pending'
        };

        // Show a combined success message:
        showSuccess('Reservation created successfully. Please check your email for confirmation.');

        onAdded(newReservation);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to add reservation.');
      setOpenSnackbar(true);
    } finally {
      setIsSaving(false); // Re-enable button
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Modal open onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 3,
            width: 475,
            boxShadow: 6
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
            Add Reservation
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {/* Customer - full width */}
            <Grid item xs={12}>
              <Box sx={{ width: 195 }}>
                <TextField
                  select
                  size="small"
                  margin="dense"
                  label="Customer"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  fullWidth
                  disabled={payload.role === 'Customer'}
                >
                  {customers.map((c) => (
                    <MenuItem key={c.userId} value={c.userId}>
                      {c.username}
                    </MenuItem>
                  ))}
                </TextField>
                <FormHelperText>Select a customer for reservation</FormHelperText>
              </Box>
            </Grid>

            {/* Vehicle - full width */}
            <Grid item xs={12}>
              <Box sx={{ width: 195 }}>
                <TextField
                  select
                  size="small"
                  margin="dense"
                  label="Vehicle"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  fullWidth
                  disabled={!!vehicleId}
                >
                  {vehicles.map((v) => (
                    <MenuItem key={v.vehicleId} value={v.vehicleId}>
                      {v.mark} {v.model}
                    </MenuItem>
                  ))}
                </TextField>
                <FormHelperText>Select a vehicle for reservation</FormHelperText>
              </Box>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: 195 }}>
                <TextField
                  size="small"
                  margin="dense"
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                />
                <FormHelperText>Select start date for reservation</FormHelperText>
              </Box>
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: 195 }}>
                <TextField
                  size="small"
                  margin="dense"
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                />
                <FormHelperText>Select end date for reservation</FormHelperText>
              </Box>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSaving}
              sx={{ minWidth: 100 }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>
    </>
  );
};

export default AddReservation;
