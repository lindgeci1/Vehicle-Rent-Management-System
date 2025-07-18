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
function UpdateTripDetails({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');
const [originalData, setOriginalData] = useState(null); // Store the original data to check if any changes were made
  // Fetch the trip details for the given id.
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const res = await api.get(`/tripdetails/tripdetail/${id}`);

        setFormData(res.data);
        setOriginalData(res.data); // Store the original data for comparison
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load trip data.');
        setOpenSnackbar(true);
      }
    };
    fetchTripData();
  }, [id, token]);

  // Fetch available vehicles for the vehicle dropdown.
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles/vehicles');
        setVehicles(res.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };
    fetchVehicles();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const requiredFields = ['vehicleId', 'daysTaken', 'startLocation', 'endLocation', 'distanceTraveled', 'totalCost'];
    const missing = requiredFields.filter(field => !formData[field]);
    if (missing.length) {
      setErrorMessage(`Missing fields: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);

    if (!isChanged) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return; // Prevent submission if no changes were made
    }
    try {
      const response = await api.put(`/tripdetails/update-tripdetails/${id}`, formData);
      if (response.status === 200 && response.data) {
        showSuccess('Trip detailes updated successfully');
        onUpdated(response.data); // ✅ send updated car to parent
        onClose();                   // ✅ close modal
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to update trip.');
      setOpenSnackbar(true);
    }
  };

  if (!formData) return null;

return (
  <>
    <Modal open onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 500, boxShadow: 6 }}>
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Update Trip Details
        </Typography>

        <Grid container spacing={2}>
          {/* Vehicle Dropdown */}
          {/* <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Vehicle"
              name="vehicleId"
              select
              value={formData.vehicleId}
              onChange={handleChange}
              fullWidth
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.mark} {vehicle.model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the vehicle used for the trip</FormHelperText>
          </Grid> */}

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
          <Button variant="contained" onClick={handleUpdate} sx={{ minWidth: 100 }}>
            Update
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert severity="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  </>
);

}

export default UpdateTripDetails;
