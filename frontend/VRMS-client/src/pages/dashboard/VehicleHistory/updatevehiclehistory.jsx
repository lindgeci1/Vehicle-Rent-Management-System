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
function UpdateVehicleHistory({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/vehicle-histories/history/${id}`);
        setFormData(res.data);
        setOriginalData(res.data);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load vehicle history.');
        setOpenSnackbar(true);
      }
    };
    fetchHistory();
  }, [id, token]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles/vehicles');
        setVehicles(res.data.$values || res.data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };
    fetchVehicles();
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdate = async () => {
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

    const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);
    if (!isChanged) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await api.put(`/vehicle-histories/update-history/${id}`, formData);
      if (response.status === 200 && response.data) {
      showSuccess('Vehicle history updated successfully');
        onUpdated(response.data); // ✅ use backend-returned full car
      onClose(); // ✅ close the modal
    }
    } catch (err) {
      console.error('Update error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update vehicle history.');
      setOpenSnackbar(true);
    }
  };

  if (!formData) return null;

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
          Update Vehicle History
        </Typography>

        <Grid container spacing={2}>
          {/* Vehicle */}
          <Grid item xs={12}>
            <TextField
              size="small"
              margin="dense"
              label="Vehicle"
              name="vehicleId"
              select
              value={formData.vehicleId}
              onChange={handleChange}
              fullWidth
              disabled
            >
              {vehicles.map((v) => (
                <MenuItem key={v.vehicleId} value={v.vehicleId}>
                  {v.mark} {v.model}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
          onChange={handleChange}
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
        onChange={handleChange}
        fullWidth
        multiline
        rows={2}
      />
    )}
  </Box>
</Grid>

        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ minWidth: 100 }}>
            Update
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert severity="error" onClose={() => setOpenSnackbar(false)} sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  </>
);

  
}

export default UpdateVehicleHistory;
