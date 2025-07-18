import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert,
  MenuItem,
  FormHelperText
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
export function UpdateVehiclePreCondition({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [originalData, setOriginalData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [preRes, vehiclesRes] = await Promise.all([
          api.get(`/vehicle-preconditions/precondition/${id}`),
          api.get('/vehicles/vehicles')
        ]);

        setFormData({
          ...preRes.data,
          scratchDescription: preRes.data.scratchDescription || '',
          dentDescription: preRes.data.dentDescription || '',
          rustDescription: preRes.data.rustDescription || ''
        });
        
        setOriginalData(preRes.data);
        setVehicles(vehiclesRes.data.$values || vehiclesRes.data);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load data.');
        setOpenSnackbar(true);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const hasLetters = (text) => /[a-zA-Z]/.test(text);

  const handleUpdate = async () => {
    if (!formData.vehicleId) {
      setErrorMessage('Vehicle is required.');
      setOpenSnackbar(true);
      return;
    }

    if (formData.hasScratches && (!formData.scratchDescription || !hasLetters(formData.scratchDescription))) {
      setErrorMessage('Valid Scratch Description is required.');
      setOpenSnackbar(true);
      return;
    }

    if (formData.hasDents && (!formData.dentDescription || !hasLetters(formData.dentDescription))) {
      setErrorMessage('Valid Dent Description is required.');
      setOpenSnackbar(true);
      return;
    }

    if (formData.hasRust && (!formData.rustDescription || !hasLetters(formData.rustDescription))) {
      setErrorMessage('Valid Rust Description is required.');
      setOpenSnackbar(true);
      return;
    }

    const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);
    if (!isChanged) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      scratchDescription: formData.hasScratches ? formData.scratchDescription : null,
      dentDescription: formData.hasDents ? formData.dentDescription : null,
      rustDescription: formData.hasRust ? formData.rustDescription : null
    };

    try {
      const response = await api.put(
        `/vehicle-preconditions/update-precondition/${id}`,
        payload
      );      
      if (response.status === 200 && response.data) {
      showSuccess('Vehicle pre-condition updated successfully');
        onUpdated(response.data); // ✅ use backend-returned full car
      onClose(); // ✅ close the modal
    }
    } catch (error) {
      console.error('Error updating pre-condition:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error updating pre-condition. Please try again.');
      }
      setOpenSnackbar(true);
    }
  };

  if (!formData) return null;

  return (
    <>
      <Modal
        open
        onClose={onClose}
        className="flex items-center justify-center bg-black bg-opacity-50"
      >
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 450, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Update Vehicle Pre-Condition</Typography>
  
          {/* Vehicle selection */}
          <Box mb={3}>
            <TextField
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
                        onChange={handleChange}
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
                      onChange={handleChange}
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
  
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mr: 1 }}>
              Update
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

export default UpdateVehiclePreCondition;
