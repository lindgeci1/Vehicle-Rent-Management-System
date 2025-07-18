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
export function AddVehiclePreCondition({ onClose, vehicleId, onAdded }) {
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    hasScratches: false,
    scratchDescription: '',
    hasDents: false,
    dentDescription: '',
    hasRust: false,
    rustDescription: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    if (vehicleId) {
      setFormData((prev) => ({ ...prev, vehicleId }));
    }
  }, [vehicleId]);

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

  const hasLetters = (text) => /[a-zA-Z]/.test(text);

  const handleAdd = async () => {
    const { vehicleId, hasScratches, hasDents, hasRust, scratchDescription, dentDescription, rustDescription } = formData;

    const missing = [];

    if (!vehicleId) missing.push('Vehicle');

    if (hasScratches && (!scratchDescription || !hasLetters(scratchDescription))) {
      missing.push('Valid Scratch Description');
    }
    if (hasDents && (!dentDescription || !hasLetters(dentDescription))) {
      missing.push('Valid Dent Description');
    }
    if (hasRust && (!rustDescription || !hasLetters(rustDescription))) {
      missing.push('Valid Rust Description');
    }

    if (missing.length > 0) {
      setErrorMessage(`Please fill in: ${missing.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      scratchDescription: hasScratches ? scratchDescription : null,
      dentDescription: hasDents ? dentDescription : null,
      rustDescription: hasRust ? rustDescription : null
    };

    try {
      const response = await api.post(
        '/vehicle-preconditions/create-precondition',
        payload
      );      

      if (response.status === 200 && response.data) {
      showSuccess('Vehicle pre-condition created successfully');
        onAdded(response.data); // ✅ use backend-returned full car
      onClose(); // ✅ close the modal
      window.location.reload()
    }
    } catch (error) {
      console.error('Error adding pre-condition:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error adding pre-condition. Please try again.');
      }
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
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 450, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Create Vehicle Pre-Condition</Typography>
  
          {/* Vehicle selection */}
          <Box mb={3}>
            <TextField
              label="Vehicle"
              name="vehicleId"
              select
              value={formData.vehicleId}
              onChange={handleInputChange}
              fullWidth
              margin="dense"
              disabled={!!vehicleId}
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                  {vehicle.mark} {vehicle.model}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the vehicle</FormHelperText>
          </Box>
  
          {/* Damage Sections */}
          {[
            { name: 'Scratches', field: 'scratchDescription', state: 'hasScratches' },
            { name: 'Dents', field: 'dentDescription', state: 'hasDents' },
            { name: 'Rust', field: 'rustDescription', state: 'hasRust' }
          ].map(({ name, field, state }) => (
            <Box key={name} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={state}
                        checked={formData[state]}
                        onChange={handleInputChange}
                      />
                    }
                    label={name}
                  />
                </Grid>
                <Grid item xs={9}>
                  {formData[state] && (
                    <TextField
                      label={`${name} Description`}
                      name={field}
                      value={formData[field]}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      margin="dense"
                      rows={2}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
  
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleAdd} sx={{ mr: 1 }}>
              Create
            </Button>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
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

export default AddVehiclePreCondition;
