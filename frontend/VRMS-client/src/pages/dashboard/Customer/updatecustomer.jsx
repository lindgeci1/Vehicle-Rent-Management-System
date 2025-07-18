import React, { useEffect, useState } from 'react';
import {
  Modal, Box, TextField, Button, FormHelperText, Grid, Typography,
  Snackbar, Alert, Checkbox, FormControlLabel, FormControl,
  Select, MenuItem, InputLabel, Chip, OutlinedInput
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function UpdateCustomer({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    driverLicense: [],
    address: '',
    phoneNumber: ''
  });

  const token = Cookies.get('token');
  const [originalData, setOriginalData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

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

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await api.get(`/customers/customer/${id}`);
        const { password, driverLicense, ...safeData } = response.data;
        const licenseArray = driverLicense ? driverLicense.split(',').map(x => x.trim()) : [];

        setFormData({ ...safeData, driverLicense: licenseArray, password: '' });
        setOriginalData({ ...response.data, driverLicense: licenseArray });
      } catch (error) {
        console.error('Error fetching customer data:', error);
        alert('Error fetching customer data');
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleUpdateCustomer = async () => {
    const isChanged = Object.keys(formData).some(key => {
      if (key === 'password') return false;
      return JSON.stringify(formData[key]) !== JSON.stringify(originalData[key]);
    }) || (changePassword && formData.password);

    if (!isChanged) {
      setErrorMessage('Data must be changed before updating.');
      setOpenSnackbar(true);
      return;
    }

    const emptyFields = [];
    if (!formData.email) emptyFields.push('Email');
    if (!formData.username) emptyFields.push('Username');
    if (changePassword && !formData.password) emptyFields.push('Password');
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
      driverLicense: formData.driverLicense.join(','),
      ...(changePassword ? {} : { password: '' })
    };

    try {
      const response = await api.put(`/customers/update-customer/${id}`, payload);
      if (response.status === 200 && response.data) {
        showSuccess('Customer updated successfully');
        onUpdated(response.data); // ✅ send updated car to parent
        onClose();                   // ✅ close modal
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      setErrorMessage(error.response?.data?.message || 'Error updating customer');
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
          width: 500,
          mx: 'auto',
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Update Customer
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
              disabled
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
              disabled
            />
            <FormHelperText>Username cannot be empty.</FormHelperText>
          </Grid>

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

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <InputLabel id="license-multiple-label" sx={{ fontSize: '0.9rem' }}>
                Driver License (Category)
              </InputLabel>
              <Button
                size="small"
                variant="text"
                color="secondary"
                sx={{ fontSize: '0.75rem', textTransform: 'none', px: 1 }}
                onClick={() => setFormData(prev => ({ ...prev, driverLicense: [] }))}
              >
                Clear Categories
              </Button>
            </Box>
            <FormControl fullWidth size="small" margin="dense">
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
                input={<OutlinedInput />}
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
              <FormHelperText>Select all categories the customer holds.</FormHelperText>
            </FormControl>
          </Grid>

          {/** Password row: checkbox + input side-by-side **/}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={changePassword}
                    onChange={(e) => {
                      setChangePassword(e.target.checked);
                      if (!e.target.checked) {
                        setFormData(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: '0.85rem' }}>Change Password</Typography>}
              />

              {changePassword && (
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
              )}
            </Box>
            {changePassword && (
              <FormHelperText sx={{ ml: 1.5 }}>Password must meet security criteria.</FormHelperText>
            )}
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateCustomer}
            sx={{ minWidth: 100 }}
          >
            Update
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ minWidth: 100 }}
          >
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

export default UpdateCustomer;
