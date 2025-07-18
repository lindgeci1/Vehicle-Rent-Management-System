import React, { useState } from 'react';
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
import { showSuccess } from '../../../crudNotifications';
import MenuItem from '@mui/material/MenuItem';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';

function AddMotorcycle({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    mark: '',
    model: '',
    year: '',
    prepayFee: '',
    fuelType: '',
    isAvailable: true,
    hasNavigationSystem: false,
    hasSideCar: false,
    isElectric: false,
    hasABS: false,
    seatingCapacity: '',
    // trunkCapacity: '',
    maxSpeed: '',
    transmission: ''
  });

  const [availableModels, setAvailableModels] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 1999), (_, index) => 2000 + index);

  const handleMarkChange = async (e) => {
    const newMark = e.target.value;
    setFormData(prev => ({ ...prev, mark: newMark, model: '' }));
    try {
      const response = await api.get(`/motorcycles/models/${newMark}`);
      setAvailableModels(response.data || []);
    } catch (error) {
      console.error('Error fetching models:', error.response?.data || error);
      setAvailableModels([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAddMotorcycle = async () => {
    const requiredFields = ['mark', 'model', 'year', 'fuelType', 'seatingCapacity', 'maxSpeed'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const motorcycleData = { ...formData, prepayFee: 0 };

    try {
      const response = await api.post('/motorcycles/create-motorcycle', motorcycleData);
      if (response.status === 200 && response.data) {
        showSuccess('Motorcycle created successfully');
        onAdded(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error adding motorcycle:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Error adding motorcycle. Please try again.');
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Modal open onClose={onClose} className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50">
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 470, mx: 'auto', boxShadow: 6 }}>
          <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
            Create New Motorcycle
          </Typography>

          <Grid container spacing={2}>
            {/* Dropdowns */}
            <Grid item xs={12} sm={6}>
                <Box sx={{ width: 180 }}>
              <TextField
                size="small"
                label="Mark"
                name="mark"
                select
                value={formData.mark}
                onChange={handleMarkChange}
                fullWidth
                margin="dense"
              >
                {['Yamaha', 'Honda', 'Suzuki', 'Kawasaki', 'Harley-Davidson'].map((mark) => (
                  <MenuItem key={mark} value={mark}>{mark}</MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select the motorcycle mark</FormHelperText>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
                <Box sx={{ width: 190 }}>
              <TextField
                size="small"
                label="Model"
                name="model"
                select
                value={formData.model}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
                disabled={!availableModels.length}
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select the motorcycle model</FormHelperText>
              </Box>
            </Grid>

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
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select production year</FormHelperText>
            </Grid>

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
                <MenuItem value="Petrol">Petrol</MenuItem>
                <MenuItem value="Diesel">Diesel</MenuItem>
                <MenuItem value="Electric">Electric</MenuItem>
                <MenuItem value="Hybrid">Hybrid</MenuItem>
              </TextField>
              <FormHelperText>Select fuel type</FormHelperText>
            </Grid>

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

            {/* Numeric Inputs */}
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
    {[1, 2, 3].map((seat) => (
      <MenuItem key={seat} value={seat}>{seat}</MenuItem>
    ))}
  </TextField>
  <FormHelperText>Number of seats</FormHelperText>
</Grid>

{/* <Grid item xs={12} sm={6}>
  <TextField
    size="small"
    label="Trunk Capacity"
    name="trunkCapacity"
    select
    value={formData.trunkCapacity}
    onChange={handleInputChange}
    fullWidth
    margin="dense"
  >
    {[50, 100, 150, 200].map((liters) => (
      <MenuItem key={liters} value={liters}>{liters} liters</MenuItem>
    ))}
  </TextField>
  <FormHelperText>Trunk size in liters</FormHelperText>
</Grid> */}

<Grid item xs={12} sm={6}>
  <TextField
    size="small"
    label="Max Speed (km/h)"
    name="maxSpeed"
    select
    value={formData.maxSpeed}
    onChange={handleInputChange}
    fullWidth
    margin="dense"
  >
    {[50, 100, 150, 200, 250, 300].map((speed) => (
      <MenuItem key={speed} value={speed}>{speed}</MenuItem>
    ))}
  </TextField>
  <FormHelperText>Top speed of motorcycle</FormHelperText>
</Grid>


            {/* Boolean Features */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={1}>
                {/* <Grid item xs={6}>
                  <FormControlLabel
                    control={<Checkbox name="hasNavigationSystem" checked={formData.hasNavigationSystem} onChange={handleInputChange} size="small" />}
                    label="Navigation System"
                  />
                </Grid> */}
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Checkbox name="hasSideCar" checked={formData.hasSideCar} onChange={handleInputChange} size="small" />}
                    label="Side Car"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Checkbox name="isElectric" checked={formData.isElectric} onChange={handleInputChange} size="small" />}
                    label="Electric"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Checkbox name="hasABS" checked={formData.hasABS} onChange={handleInputChange} size="small" />}
                    label="ABS"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" onClick={handleAddMotorcycle} sx={{ minWidth: 100 }}>Create</Button>
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

export default AddMotorcycle;
