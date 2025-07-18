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
  FormControlLabel,
  Checkbox,
  FormHelperText,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
export function AddVehicleHistory({ onClose, vehicleId, onAdded }) {
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    numberOfDrivers: '',
    hasHadAccident: false,
    accidentDescription: '',
    km: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  // Pre-fill vehicleId if passed
  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId }));
    }
  }, [vehicleId]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles/vehicles');
        setVehicles(res.data.$values || res.data);
      } catch (error) {
        console.error('Failed to fetch vehicles', error);
      }
    };

    fetchVehicles();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = async () => {
    const requiredFields = ['vehicleId', 'numberOfDrivers', 'km'];

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (formData.hasHadAccident && !formData.accidentDescription) {
      emptyFields.push('accidentDescription');
    }

    if (emptyFields.length > 0) {
      setErrorMessage(`Please fill in: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await api.post('/vehicle-histories/create-history', formData);

      if (response.status === 200 && response.data) {
      showSuccess('Vehicle history created successfully');
        onAdded(response.data); // ✅ use backend-returned full car
      onClose(); // ✅ close the modal
    }
    } catch (error) {
      console.error('Error creating history:', error);
      setErrorMessage(error.response?.data?.message || 'Something went wrong.');
      setOpenSnackbar(true);
    }
  };

return (
  <>
    <Modal
      open
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-10 overflow-auto bg-black bg-opacity-50"
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 3,
          width: 500,
          mx: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Create Vehicle History
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
              onChange={handleInputChange}
              fullWidth
              disabled={!!vehicleId}
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.mark} {vehicle.model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the vehicle to add its history</FormHelperText>
          </Grid>

          {/* KM */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Kilometers Driven"
              name="km"
              type="number"
              value={formData.km}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Total kilometers driven</FormHelperText>
          </Grid>

          {/* Drivers */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Number of Drivers"
              name="numberOfDrivers"
              type="number"
              value={formData.numberOfDrivers}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Total number of drivers</FormHelperText>
          </Grid>

          {/* Accident Section */}
          <Grid item xs={12}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                Accident Information
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    name="hasHadAccident"
                    checked={formData.hasHadAccident}
                    onChange={handleInputChange}
                    size="small"
                  />
                }
                label="Has Had Accident"
              />

              {formData.hasHadAccident && (
                <TextField
                  size="small"
                  margin="dense"
                  label="Accident Description"
                  name="accidentDescription"
                  value={formData.accidentDescription}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Buttons */}
        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={handleAdd} sx={{ minWidth: 100 }}>
            Create
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  </>
);
 
}

export default AddVehicleHistory;
