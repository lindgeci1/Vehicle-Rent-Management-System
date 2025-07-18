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
  FormHelperText
} from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';

/**
 * UpdateMotorcycle – UI identical in look & feel to UpdateCar
 * but tailored to motorcycle‑specific fields.
 */
function UpdateMotorcycle({ id, onClose, onUpdated }) {
  /* ------------------------------------------------------------------
   * state
   * ----------------------------------------------------------------*/
  const [formData, setFormData] = useState({
    mark: '',
    model: '',
    year: '',
    fuelType: '',
    seatingCapacity: '',
    maxSpeed: '',
    transmission: '',
    isAvailable: true,
    hasSideCar: false,
    isElectric: false,
    hasABS: false
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const token = Cookies.get('token');

  /* ------------------------------------------------------------------
   * helpers
   * ----------------------------------------------------------------*/
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i);

  /* ------------------------------------------------------------------
   * fetch existing data
   * ----------------------------------------------------------------*/
  useEffect(() => {
    const fetchMotorcycle = async () => {
      try {
        const res = await api.get(`/motorcycles/motorcycle/${id}`);
        setFormData(res.data);
        setOriginalData(res.data);

        if (res.data.mark) {
          const modelsRes = await api.get(`/motorcycles/models/${res.data.mark}`);
          if (modelsRes.status === 200 && modelsRes.data) setAvailableModels(modelsRes.data);
        }
      } catch (err) {
        console.error('Fetch error', err);
        setErrorMessage('Error fetching motorcycle data');
        setOpenSnackbar(true);
      }
    };

    fetchMotorcycle();
  }, [id, token]);

  /* ------------------------------------------------------------------
   * handlers
   * ----------------------------------------------------------------*/
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = async () => {
    const required = ['mark', 'model', 'year', 'fuelType', 'seatingCapacity', 'maxSpeed', 'transmission'];
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
      const res = await api.put(`/motorcycles/update-motorcycle/${id}`, formData);
      if (res.status === 200 && res.data) {
        showSuccess('Motorcycle updated successfully');
        onUpdated(res.data);
        onClose();
      }
    } catch (err) {
      console.error('Update error', err);
      setErrorMessage(err.response?.data?.message || 'Error updating motorcycle');
      setOpenSnackbar(true);
    }
  };

  /* ------------------------------------------------------------------
   * render
   * ----------------------------------------------------------------*/
  return (
    <>
      <Modal open onClose={onClose} className="fixed inset-0 flex items-center justify-center z-10 overflow-auto bg-black/50">
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 480, mx: 'auto', boxShadow: 6 }}>
          <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
            Update Motorcycle
          </Typography>

<Grid container spacing={2}>
  {/* Mark */}
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
    <FormHelperText>Select mark</FormHelperText>
    </Box>
  </Grid>

  {/* Model */}
<Grid item>
  <Box sx={{ width: 100 }}>
    <TextField
      size="small"
      label="Model"
      name="model"
      value={formData.model}
      fullWidth
      margin="dense"
      disabled
    />
    <FormHelperText>Select model</FormHelperText>
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
      {years.map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </TextField>
    <FormHelperText>Select production year</FormHelperText>
  </Grid>

  {/* Fuel Type */}
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
      {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((f) => (
        <MenuItem key={f} value={f}>
          {f}
        </MenuItem>
      ))}
    </TextField>
    <FormHelperText>Select fuel type</FormHelperText>
  </Grid>

  {/* Seating Capacity */}
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
      {[1, 2].map((n) => (
        <MenuItem key={n} value={n}>
          {n}
        </MenuItem>
      ))}
    </TextField>
    <FormHelperText>Select number of seats</FormHelperText>
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
    <FormHelperText>Select transmission type</FormHelperText>
  </Grid>

  {/* Max Speed */}
  <Grid item xs={12} sm={6}>
    <TextField
      size="small"
      label="Max Speed (km/h)"
      name="maxSpeed"
      type="number"
      value={formData.maxSpeed}
      onChange={handleInputChange}
      fullWidth
      margin="dense"
    />
    <FormHelperText>Top speed</FormHelperText>
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
              name="hasSideCar"
              checked={formData.hasSideCar}
              onChange={handleInputChange}
              size="small"
            />
          }
          label="Side Car"
        />
      </Grid>
      <Grid item xs={6} sm={4}>
        <FormControlLabel
          control={
            <Checkbox
              name="isElectric"
              checked={formData.isElectric}
              onChange={handleInputChange}
              size="small"
            />
          }
          label="Electric"
        />
      </Grid>
      <Grid item xs={6} sm={4}>
        <FormControlLabel
          control={
            <Checkbox
              name="hasABS"
              checked={formData.hasABS}
              onChange={handleInputChange}
              size="small"
            />
          }
          label="ABS"
        />
      </Grid>
    </Grid>
  </Grid>
</Grid>




          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" onClick={handleUpdate} sx={{ minWidth: 100 }}>Update</Button>
            <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>Cancel</Button>
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

export default UpdateMotorcycle;
