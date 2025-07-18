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
import { api } from '@/apiClient';
import Cookies from 'js-cookie';
import { showSuccess } from '../../../crudNotifications';

/**
 * UpdateBus – identical look & feel to UpdateMotorcycle,
 * but tailored to bus-specific fields.
 */
function UpdateBus({ id, onClose, onUpdated }) {
  /* ───────────────────────── state ───────────────────────── */
  const [formData, setFormData] = useState({
    mark: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    seatingCapacity: '',
    numberOfDoors: '',
    isAvailable: true,
    hasLuggageCompartment: false,
    hasToilet: false,
    isDoubleDecker: false
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [errorMessage, setErrorMessage]       = useState('');
  const [openSnackbar, setOpenSnackbar]       = useState(false);
  const [originalData, setOriginalData]       = useState(null);
  const token                                 = Cookies.get('token');

  /* ───────────────────────── helpers ───────────────────────── */
  const currentYear = new Date().getFullYear();
  const years       = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i);

  /* ───────────────────────── fetch current data ───────────────────────── */
  useEffect(() => {
    const fetchBus = async () => {
      try {
        const res = await api.get(`/buses/bus/${id}`);
        setFormData(res.data);
        setOriginalData(res.data);

        if (res.data.mark) {
          const modelsRes = await api.get(`/buses/models/${res.data.mark}`);
          if (modelsRes.status === 200 && modelsRes.data) setAvailableModels(modelsRes.data);
        }
      } catch (err) {
        console.error('[UpdateBus] fetch error:', err);
        setErrorMessage('Error fetching bus data');
        setOpenSnackbar(true);
      }
    };
    fetchBus();
  }, [id, token]);

  /* ───────────────────────── handlers ───────────────────────── */
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async () => {
    const required = [
      'mark',
      'model',
      'year',
      'fuelType',
      'transmission',
      'seatingCapacity',
      'numberOfDoors'
    ];
    const missing = required.filter(f => !formData[f]);
    if (missing.length) {
      setErrorMessage(`The following fields are required: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const changed = Object.keys(formData).some(k => formData[k] !== originalData[k]);
    if (!changed) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const res = await api.put(`/buses/update-bus/${id}`, formData);
      if (res.status === 200 && res.data) {
        showSuccess('Bus updated successfully');
        onUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('[UpdateBus] update error:', err);
      setErrorMessage(err.response?.data?.message || 'Error updating bus');
      setOpenSnackbar(true);
    }
  };

  /* ───────────────────────── render ───────────────────────── */
  return (
    <>
      <Modal
        open
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center z-10 overflow-auto bg-black/50"
      >
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 3,
            width: 450,
            mx: 'auto',
            boxShadow: 6
          }}
        >
          <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
            Update Bus
          </Typography>

          <Grid container spacing={2}>
            {/* Mark (read-only) */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: 150 }}>
                <TextField
                  size="small"
                  label="Mark"
                  name="mark"
                  value={formData.mark}
                  fullWidth
                  margin="dense"
                  disabled
                />
                <FormHelperText>Mark</FormHelperText>
              </Box>
            </Grid>

            {/* Model (read-only) */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ width: 150 }}>
                <TextField
                  size="small"
                  label="Model"
                  name="model"
                  value={formData.model}
                  fullWidth
                  margin="dense"
                  disabled
                />
                <FormHelperText>Model</FormHelperText>
              </Box>
            </Grid>

            {/* Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Year"
                name="year"
                select
                value={formData.year}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>Production year</FormHelperText>
            </Grid>

            {/* Fuel type */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Fuel Type"
                name="fuelType"
                select
                value={formData.fuelType}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {['Diesel', 'Petrol', 'Hybrid', 'Electric'].map(f => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select fuel type</FormHelperText>
            </Grid>

            {/* Transmission */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Transmission"
                name="transmission"
                select
                value={formData.transmission}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                <MenuItem value="Manual">Manual</MenuItem>
                <MenuItem value="Automatic">Automatic</MenuItem>
              </TextField>
              <FormHelperText>Transmission type</FormHelperText>
            </Grid>

            {/* Seating capacity */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Seating Capacity"
                name="seatingCapacity"
                select
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {[20, 30, 40, 50, 60, 70, 80].map(n => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>Number of seats</FormHelperText>
            </Grid>

            {/* Number of doors */}
                <Grid item xs={12} sm={6}>
                <Box sx={{ width: 120 }}>   {/* 👈 wider */}
                    <TextField
                    size="small"
                    label="Number of Doors"
                    name="numberOfDoors"
                    select
                    value={formData.numberOfDoors}
                    onChange={handleInputChange}
                    fullWidth          // keep full-width inside the Box
                    margin="dense"
                    >
                    {[1, 2, 3, 4].map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                    </TextField>
                    <FormHelperText>Door count</FormHelperText>
                </Box>
                </Grid>


            {/* Features */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasLuggageCompartment"
                        checked={formData.hasLuggageCompartment}
                        onChange={handleInputChange}
                        size="small"
                      />
                    }
                    label="Luggage Compartment"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="hasToilet"
                        checked={formData.hasToilet}
                        onChange={handleInputChange}
                        size="small"
                      />
                    }
                    label="Onboard Toilet"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isDoubleDecker"
                        checked={formData.isDoubleDecker}
                        onChange={handleInputChange}
                        size="small"
                      />
                    }
                    label="Double-Decker"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* action buttons */}
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

      {/* snackbar for validation / errors */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default UpdateBus;
