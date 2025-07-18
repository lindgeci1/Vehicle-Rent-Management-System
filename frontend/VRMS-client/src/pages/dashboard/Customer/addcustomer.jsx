import React, { useState } from 'react';
import {
  Modal, Box, TextField, Button, FormHelperText, Grid, Typography,
  Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function AddCustomer({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    driverLicense: [],
    address: '',
    phoneNumber: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  const licenseCategories = [
    { code: 'AM', description: 'Mopeds and light quadricycles' },
    { code: 'A1', description: 'Motorcycles up to 125cc' },
    { code: 'A2', description: 'Motorcycles up to 35kW' },
    { code: 'A', description: 'Any motorcycle' },
    { code: 'B1', description: 'Light vehicles and quadricycles' },
    { code: 'B', description: 'Standard car license' },
    { code: 'C1', description: 'Medium trucks up to 7.5 tons' },
    { code: 'C', description: 'Heavy trucks over 7.5 tons' },
    { code: 'D1', description: 'Mini-buses up to 16 passengers' },
    { code: 'D', description: 'Buses with more than 16 passengers' },
    { code: 'Be', description: 'Car with trailer up to 3,500kg' },
    { code: 'C1E', description: 'Medium truck with trailer' },
    { code: 'CE', description: 'Heavy truck with trailer' },
    { code: 'D1E', description: 'Mini-bus with trailer' },
    { code: 'DE', description: 'Bus with trailer' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async () => {
    const emptyFields = [];
    if (!formData.email) emptyFields.push('Email');
    if (!formData.username) emptyFields.push('Username');
    if (!formData.password) emptyFields.push('Password');
    if (!formData.driverLicense || formData.driverLicense.length === 0) emptyFields.push('Driver License');
    if (!formData.address) emptyFields.push('Address');
    if (!formData.phoneNumber) emptyFields.push('Phone Number');

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      driverLicense: formData.driverLicense.join(',')
    };

    try {
      const response = await api.post('/customers/create-customer', payload);
      if (response.status === 200 && response.data) {
        showSuccess('Customer created successfully');
        onAdded(response.data); // ✅ use backend-returned full car
        onClose(); // ✅ close the modal
      }
    } catch (error) {
      console.error('Error adding customer:', error.response?.data || error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error adding customer. Please try again.');
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
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 3,
          width: 550,
          boxShadow: 6,
          mx: 'auto'
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Create New Customer
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Please enter a valid email.</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Username cannot be empty.</FormHelperText>
          </Grid>

          {/* Driver License aligned with Address */}
          

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Please enter a valid address.</FormHelperText>
          </Grid>

          {/* Phone number + Password on same row */}
          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Please enter a valid phone number.</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              size="small"
              margin="dense"
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
            />
            <FormHelperText>Password must meet security criteria.</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel id="license-multiple-label">Driver License</InputLabel>
              <Select
                labelId="license-multiple-label"
                multiple
                name="driverLicense"
                value={formData.driverLicense}
                onChange={(e) => {
                  const { value } = e.target;
                  setFormData(prev => ({
                    ...prev,
                    driverLicense: typeof value === 'string' ? value.split(',') : value
                  }));
                }}
                input={<OutlinedInput label="Driver License" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => (
                      <Chip key={val} label={val} />
                    ))}
                  </Box>
                )}
              >
                {licenseCategories.map(({ code, description }) => (
                  <MenuItem key={code} value={code}>
                    {code} — {description}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select all license categories held.</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={handleAddCustomer} sx={{ minWidth: 100 }}>
            Create
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

export default AddCustomer;
