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
import axios from 'axios';
import Cookies from 'js-cookie';
import MenuItem from '@mui/material/MenuItem';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function UpdateCar({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    mark: '',
    model: '',
    year: '',
    prepayFee: '', // Backend calculates, not frontend
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
  const [originalData, setOriginalData] = useState(null);
  const token = Cookies.get('token');

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 1999), (_, index) => 2000 + index);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        // 1️⃣ Fetch the car by ID
        const response = await api.get(`/cars/car/${id}`);
        setFormData(response.data);
        setOriginalData(response.data);
  
        // 2️⃣ If there's a mark, fetch its models
        if (response.data.mark) {
          const modelsResponse = await api.get(`/cars/models/${response.data.mark}`);
          if (modelsResponse.status === 200 && modelsResponse.data) {
            setAvailableModels(modelsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching car data:', error);
        setErrorMessage('Error fetching car data');
        setOpenSnackbar(true);
      }
    };
  
    fetchCarData();
  }, [id], [token]);


  const handleMarkChange = async (e) => {
    const newMark = e.target.value;
    setFormData(prev => ({
      ...prev,
      mark: newMark,
      model: '' // Reset model when changing mark
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

  const handleUpdateCar = async () => {
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

    const isChanged = Object.keys(formData)
      .filter(key => key !== 'prepayFee') // Don't validate prepayFee
      .some(key => formData[key] !== originalData[key]);

    if (!isChanged) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return;
    }

    const updatedData = {
      ...formData,
      prepayFee: 0 // 🛑 dummy, backend recalculates!
    };

    try {
      const response = await api.put(`/cars/update-car/${id}`, updatedData);

      if (response.status === 200 && response.data) {
        showSuccess('Car updated successfully');
        onUpdated(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating car:', error.response?.data || error);
      setErrorMessage(error.response?.data?.message || 'Error updating car. Please try again.');
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
          Update Car
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
              disabled
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
              disabled
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
              {[...Array(10)].map((_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {index + 1}
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
              label="Trunk Capacity (Liters)"
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
          <Button variant="contained" onClick={handleUpdateCar} sx={{ minWidth: 100 }}>
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

export default UpdateCar;
