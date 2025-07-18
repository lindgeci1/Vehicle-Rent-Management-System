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
export function UpdateVehiclePostCondition({ onClose, id, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [preCondition, setPreCondition] = useState(null);
  const [additionalDamage, setAdditionalDamage] = useState({ scratches: false, dents: false, rust: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, vehiclesRes] = await Promise.all([
          api.get(`/vehicle-postconditions/postcondition/${id}`),
          api.get('/vehicles/vehicles')
        ]);
        setPreCondition(postRes.data);
        setFormData({
          ...postRes.data,
          scratchDescription: postRes.data.scratchDescription || '',
          dentDescription: postRes.data.dentDescription || '',
          rustDescription: postRes.data.rustDescription || ''
        });
        setVehicles(vehiclesRes.data.$values || vehiclesRes.data);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to load post-condition data.');
        setOpenSnackbar(true);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleAdditionalDamageChange = (e) => {
    const { name, checked } = e.target;
    setAdditionalDamage((prev) => ({ ...prev, [name]: checked }));
  };

  const hasLetters = (text) => /[a-zA-Z]/.test(text);

  const handleUpdate = async () => {
    if (!formData.vehicleId) {
      setErrorMessage('Vehicle is required.');
      setOpenSnackbar(true);
      return;
    }
  
    if (formData.hasScratches && (!formData.scratchDescription || !/[a-zA-Z]/.test(formData.scratchDescription))) {
      setErrorMessage('Valid Scratch Description is required.');
      setOpenSnackbar(true);
      return;
    }
  
    if (formData.hasDents && (!formData.dentDescription || !/[a-zA-Z]/.test(formData.dentDescription))) {
      setErrorMessage('Valid Dent Description is required.');
      setOpenSnackbar(true);
      return;
    }
  
    if (formData.hasRust && (!formData.rustDescription || !/[a-zA-Z]/.test(formData.rustDescription))) {
      setErrorMessage('Valid Rust Description is required.');
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
      const res = await api.put(
        `/vehicle-postconditions/update-postcondition/${formData.id}`,
        payload
      );      
  
      if (res.status === 200 && res.data) {
        showSuccess('Post-condition updated successfully');
        onUpdated(res.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating post-condition:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error updating post-condition. Please try again.');
      }
      setOpenSnackbar(true);
    }
  };
  

  if (!formData) return null;

  return (
    <>
      <Modal open onClose={onClose} className="fixed inset-0 flex items-center justify-center z-10 overflow-auto bg-black bg-opacity-50">
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 450, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Update Vehicle Post-Condition</Typography>
  
          {/* Vehicle Select */}
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
          {[{ name: 'Scratches', field: 'scratchDescription', state: 'hasScratches' },
            { name: 'Dents', field: 'dentDescription', state: 'hasDents' },
            { name: 'Rust', field: 'rustDescription', state: 'hasRust' }].map(({ name, field, state }) => (
            <Box key={name} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name={state}
                        checked={formData[state]}
                        onChange={handleChange}
                        disabled={preCondition?.[state]}
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
                      disabled={preCondition?.[state]}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
  
          {/* Total Cost */}
          <TextField
            label="Total Cost (€)"
            value={formData.totalCost}
            fullWidth
            margin="dense"
            disabled
          />
  
          {/* Action Buttons */}
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

export default UpdateVehiclePostCondition;