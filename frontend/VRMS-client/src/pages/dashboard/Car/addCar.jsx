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
  Stack,
  FormHelperText
} from '@mui/material';
import { showSuccess } from '../../../crudNotifications';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
function AddCar({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    mark: '',
    model: '',
    year: '',
    prepayFee: '', // Removed from UI, dummy value when sending
    fuelType: '',
    seatingCapacity: '',
    isAvailable: true,
    hasAirConditioning: false,
    hasNavigationSystem: false,
    trunkCapacity: '',
    hasSunroof: false,
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
    setFormData(prev => ({
      ...prev,
      mark: newMark,
      model: '' // reset model
    }));

    try {
      const response = await api.get(`/cars/models/${newMark}`);
      if (response.status === 200 && response.data) {
        setAvailableModels(response.data);
      }      
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

  const handleAddCar = async () => {
    const requiredFields = [
      'mark',
      'model',
      'year',
      'fuelType',
      'seatingCapacity',
      'trunkCapacity'
    ];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const carData = {
      ...formData,
      prepayFee: 0
    };

    try {
      const response = await api.post('/cars/create-car', carData);

      if (response.status === 200 && response.data) {
        showSuccess('Car created successfully');
        onAdded(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error adding car:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Error adding car. Please try again.');
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
          width: 470,
          mx: 'auto',
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Create New Car
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
              {['Audi', 'BMW', 'Mercedes', 'Honda', 'Toyota', 'Ford'].map((mark) => (
                <MenuItem key={mark} value={mark}>
                  {mark}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the car mark</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
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
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the car model</FormHelperText>
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
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
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
              label="Seating Capacity"
              name="seatingCapacity"
              select
              value={formData.seatingCapacity}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
            >
              {[...Array(10)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select number of seats</FormHelperText>
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

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              label="Trunk Capacity"
              name="trunkCapacity"
              select
              value={formData.trunkCapacity}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              sx={{ width: 160 }}
            >
              {[200, 250, 300, 350, 400, 450, 500].map((capacity) => (
                <MenuItem key={capacity} value={capacity}>
                  {capacity} liters
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Trunk capacity in liters</FormHelperText>
          </Grid>

          {/* Boolean Features */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              Features
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="hasAirConditioning"
                      checked={formData.hasAirConditioning}
                      onChange={handleInputChange}
                      size="small"
                    />
                  }
                  label="Air Conditioning"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="hasNavigationSystem"
                      checked={formData.hasNavigationSystem}
                      onChange={handleInputChange}
                      size="small"
                    />
                  }
                  label="Navigation System"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="hasSunroof"
                      checked={formData.hasSunroof}
                      onChange={handleInputChange}
                      size="small"
                    />
                  }
                  label="Sunroof"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={handleAddCar} sx={{ minWidth: 100 }}>
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

export default AddCar;
