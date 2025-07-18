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
  FormHelperText
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import MenuItem from '@mui/material/MenuItem';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function AddTripDetails({ onClose, vehicleId, onAdded }) {
  // Prepopulate vehicleId if provided.
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    daysTaken: '',
    distanceTraveled: '',
    totalCost: '',

  });
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const token = Cookies.get('token');

  // If the vehicleId prop changes, update the form state.
  useEffect(() => {
    if (vehicleId) {
      setFormData(prev => ({ ...prev, vehicleId }));
    }
  }, [vehicleId]);

  // Fetch available vehicles for the dropdown.
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/vehicles/vehicles');
        setVehicles(response.data.$values || response.data);
      } catch (error) {
        console.error('Error fetching available vehicles:', error);
      }
    };
    fetchVehicles();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const requiredFields = ['vehicleId', 'daysTaken', 'startLocation', 'endLocation', 'distanceTraveled', 'totalCost'];
    const missing = requiredFields.filter(field => !formData[field]);
    if (missing.length) {
      setErrorMessage(`Missing fields: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }
    try {
      const response = await api.post('/tripdetails/create-tripdetails', formData);
      if (response.status === 200 && response.data) {
        showSuccess('Trip detailes created successfully');
        onAdded(response.data); // ✅ use backend-returned full car
        onClose(); // ✅ close the modal
      }
    } catch (error) {
      console.error('Error adding trip detailes:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error adding trip detailes. Please try again.');
      }
      setOpenSnackbar(true);
    }
  };

return (
  <>
    <Modal open onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 500, boxShadow: 6 }}>
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Add Trip Details
        </Typography>

        <Grid container spacing={2}>
          {/* Vehicle */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Vehicle"
              name="vehicleId"
              select
              value={formData.vehicleId}
              onChange={handleChange}
              fullWidth
              disabled={!!vehicleId}
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.mark} {vehicle.model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the vehicle for thr trip detailes.</FormHelperText>
          </Grid>

          {/* Days Taken */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Days Taken"
              name="daysTaken"
              type="number"
              value={formData.daysTaken}
              onChange={handleChange}
              fullWidth
            />
            <FormHelperText>Number of days for the trip</FormHelperText>
          </Grid>

          {/* Distance Traveled */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Distance Traveled"
              name="distanceTraveled"
              type="number"
              value={formData.distanceTraveled}
              onChange={handleChange}
              fullWidth
            />
            <FormHelperText>Distance in kilometers</FormHelperText>
          </Grid>

          {/* Total Cost */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Total Cost"
              name="totalCost"
              type="number"
              value={formData.totalCost}
              onChange={handleChange}
              fullWidth
            />
            <FormHelperText>Total trip cost</FormHelperText>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={handleSubmit} sx={{ minWidth: 100 }}>
            Save
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

}

export default AddTripDetails;
