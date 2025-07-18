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
  Checkbox,
  FormControlLabel,
  FormHelperText,
  MenuItem
} from '@mui/material';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';

function AddBus({ onClose, onAdded }) {
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

  /* ───────────────────────── dropdown helpers ───────────────────────── */
  const currentYear = new Date().getFullYear();
  const years       = Array.from({ length: currentYear - 1999 }, (_, i) => 2000 + i);

  /* marks displayed in UI */
  const marks = ['Mercedes-Benz', 'Volvo', 'MAN', 'Setra', 'Neoplan'];

  /* ───────────────────────── handlers ───────────────────────── */
  const handleMarkChange = async (e) => {
    const newMark = e.target.value;
    setFormData(prev => ({ ...prev, mark: newMark, model: '' }));
    try {
      const res = await api.get(`/buses/models/${newMark}`);
      setAvailableModels(res.data || []);
    } catch (err) {
      console.error('[AddBus] model fetch error:', err.response?.data || err);
      setAvailableModels([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async () => {
    /* basic required-field check */
    const required = ['mark', 'model', 'year', 'fuelType', 'transmission', 'seatingCapacity', 'numberOfDoors'];
    const missing  = required.filter(f => !formData[f]);
    if (missing.length) {
      setErrorMessage(`The following fields are required: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    /* backend expects calculated PrepayFee; send 0 so service calculates */
    const payload = { ...formData, prepayFee: 0 };

    try {
      const res = await api.post('/buses/create-bus', payload);
      if (res.status === 200 && res.data) {
        showSuccess('Bus created successfully');
        onAdded(res.data);
        onClose();
      }
    } catch (err) {
      console.error('[AddBus] create error:', err.response?.data || err);
      setErrorMessage(err.response?.data?.message || 'Error adding bus. Please try again.');
      setOpenSnackbar(true);
    }
  };

  /* ───────────────────────── render ───────────────────────── */
  return (
    <>
      {/* ───── modal ───── */}
      <Modal
        open
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center z-10 bg-black bg-opacity-50"
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
            Create New Bus
          </Typography>

          <Grid container spacing={2}>
            {/* ───────── mark / model dropdowns ───────── */}
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
                  {marks.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
                <FormHelperText>Select the bus mark</FormHelperText>
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
                  {availableModels.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
                <FormHelperText>Select the bus model</FormHelperText>
              </Box>
            </Grid>

            {/* ───────── year / fuel ───────── */}
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
                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
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
                {['Diesel', 'Petrol', 'Hybrid', 'Electric'].map(f => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select fuel type</FormHelperText>
            </Grid>

            {/* ───────── transmission / seating ───────── */}
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
                label="Seating Capacity"
                name="seatingCapacity"
                select
                value={formData.seatingCapacity}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {[20, 30, 40, 50, 60, 70, 80].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <FormHelperText>Number of seats</FormHelperText>
            </Grid>

            {/* ───────── doors ───────── */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                label="Number of Doors"
                name="numberOfDoors"
                select
                value={formData.numberOfDoors}
                onChange={handleInputChange}
                fullWidth
                margin="dense"
              >
                {[1, 2, 3, 4].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
              <FormHelperText>Select door count</FormHelperText>
            </Grid>

            {/* ───────── feature checkboxes ───────── */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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

          {/* ───────── action buttons ───────── */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" onClick={handleCreate} sx={{ minWidth: 100 }}>
              Create
            </Button>
            <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* ───────── error snackbar ───────── */}
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

export default AddBus;
