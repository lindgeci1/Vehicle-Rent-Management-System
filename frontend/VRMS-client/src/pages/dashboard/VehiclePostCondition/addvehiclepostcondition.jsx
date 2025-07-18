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
function AddVehiclePostCondition({ onClose, vehicleId, onAdded }) {
  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    hasScratches: false,
    scratchDescription: '',
    hasDents: false,
    dentDescription: '',
    hasRust: false,
    rustDescription: '',
    totalCost: 0
  });

  const [preCondition, setPreCondition] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [additionalDamage, setAdditionalDamage] = useState({ scratches: false, dents: false, rust: false });
  const token = Cookies.get('token');

  useEffect(() => {
    api.get('/vehicles/vehicles')
      .then((res) => setVehicles(res.data.$values || res.data))
      .catch((error) => console.error('Failed to fetch vehicles', error));
  }, [token]);
useEffect(() => {
  if (vehicleId) {
    fetchPreCondition(vehicleId); // ✅ This is the one that sets `preCondition`
  }
}, [vehicleId]);

  useEffect(() => {
    if (!preCondition) return;
    let cost = 0;
    if (!preCondition.hasScratches && formData.hasScratches) cost += 100;
    if (!preCondition.hasDents && formData.hasDents) cost += 150;
    if (!preCondition.hasRust && formData.hasRust) cost += 200;

    setFormData((prev) => ({ ...prev, totalCost: cost }));
  }, [formData.hasScratches, formData.hasDents, formData.hasRust, preCondition, additionalDamage]);

  const fetchPreCondition = async (vId) => {
    try {
      const res = await api.get(`/vehicle-preconditions/precondition-by-vehicle/${vId}`);
      setPreCondition(res.data);
      setFormData((prev) => ({
        ...prev,
        vehicleId: vId,
        hasScratches: res.data.hasScratches,
        scratchDescription: res.data.scratchDescription || '',
        hasDents: res.data.hasDents,
        dentDescription: res.data.dentDescription || '',
        hasRust: res.data.hasRust,
        rustDescription: res.data.rustDescription || ''
      }));
      setAdditionalDamage({ scratches: false, dents: false, rust: false });
    } catch (err) {
      console.warn('No pre-condition found for selected vehicle.');
      setPreCondition(null);
      setFormData({
        vehicleId: vId,
        hasScratches: false,
        scratchDescription: '',
        hasDents: false,
        dentDescription: '',
        hasRust: false,
        rustDescription: '',
        totalCost: 0
      });
      setAdditionalDamage({ scratches: false, dents: false, rust: false });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    if (name === 'vehicleId') {
      fetchPreCondition(newValue);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleAdditionalDamageChange = (e) => {
    const { name, checked } = e.target;
    setAdditionalDamage((prev) => ({ ...prev, [name]: checked }));
  };

  const hasLetters = (text) => /[a-zA-Z]/.test(text);

  const handleAdd = async () => {
    const { hasScratches, hasDents, hasRust, scratchDescription, dentDescription, rustDescription } = formData;

    const missing = [];
    if (hasScratches && (!scratchDescription || !hasLetters(scratchDescription))) missing.push('Valid Scratch Description');
    if (hasDents && (!dentDescription || !hasLetters(dentDescription))) missing.push('Valid Dent Description');
    if (hasRust && (!rustDescription || !hasLetters(rustDescription))) missing.push('Valid Rust Description');

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
      const response = await api.post('/vehicle-postconditions/create-postcondition', payload);
      if (response.status === 200 && response.data) {
        showSuccess('Post-condition created successfully');
        onAdded(response.data);
        onClose();
        window.location.reload()
      }
    } catch (error) {
        console.error('Error adding post-condition:', error.response?.data || error);
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage('Error adding post-condition. Please try again.');
        }
        setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Modal open onClose={onClose} className="fixed inset-0 flex items-center justify-center z-10 overflow-auto bg-black bg-opacity-50">
        <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 3, width: 650, maxHeight: '90vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Create Vehicle Post-Condition</Typography>
  
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
  { type: 'scratches', label: 'Scratches', field: 'scratchDescription' },
  { type: 'dents', label: 'Dents', field: 'dentDescription' },
  { type: 'rust', label: 'Rust', field: 'rustDescription' }
].map(({ type, label, field }) => (
  <Box key={type} sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 3 }}>
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={3}>
        <FormControlLabel
          control={
            <Checkbox
              name={`has${label}`}
              checked={formData[`has${label}`]}
              onChange={handleInputChange}
              disabled={preCondition?.[`has${label}`]}
            />
          }
          label={label}
        />
      </Grid>
      <Grid item xs={3}>
        {preCondition?.[`has${label}`] && (
          <FormControlLabel
            control={
              <Checkbox
                name={type}
                checked={additionalDamage[type]}
                onChange={handleAdditionalDamageChange}
              />
            }
            label="Additional Damage"
          />
        )}
      </Grid>
      <Grid item xs={6}>
        {(formData[`has${label}`] || additionalDamage[type]) && (
          <TextField
            label={`${label} Description`}
            name={field}
            value={formData[field]}
            onChange={handleInputChange}
            fullWidth
            multiline
            margin="dense"
            rows={2}
            disabled={preCondition?.[`has${label}`] && !additionalDamage[type]}
          />
        )}
      </Grid>
    </Grid>
  </Box>
))}

  
          <TextField
            label="Total Cost (€)"
            value={formData.totalCost}
            fullWidth
            margin="dense"
            disabled
          />
  
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

export default AddVehiclePostCondition;
