import React, { useEffect, useState } from 'react';
import {
  Card, CardBody, Typography, Avatar, Tooltip, Button
} from '@material-tailwind/react';
import {
  Box, TextField, Grid, Snackbar, Alert,
  Checkbox, FormControlLabel, FormHelperText,
  FormControl, InputLabel, Select, MenuItem,
  OutlinedInput, Chip
} from '@mui/material';
import { PencilIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';

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

const CustomerView = () => {
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const token = Cookies.get('token');
  const userId = Number(decodeToken(token)?.userId);

  useEffect(() => {
    if (userId) {
      api.get(`/customers/customers`)
        .then(res => {
          const customers = res.data?.$values || res.data;
          const match = customers.find(c => c.userId === userId);
          if (match) {
            setCustomer(match);
            const licenseArray = match.driverLicense
              ? match.driverLicense.split(',').map(x => x.trim())
              : [];
            setFormData({ ...match, driverLicense: licenseArray, password: '' });
          }
        })
        .catch(err => console.error('Failed to fetch customer:', err));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const emptyFields = [];
    if (!formData.phoneNumber) emptyFields.push('Phone Number');
    if (!formData.address) emptyFields.push('Address');
    if (!formData.driverLicense || formData.driverLicense.length === 0) emptyFields.push('Driver License');
    if (changePassword && !formData.password) emptyFields.push('Password');

    if (emptyFields.length > 0) {
      setErrorMessage(`Required: ${emptyFields.join(', ')}`);
      setShowSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      driverLicense: formData.driverLicense.join(','),
      ...(changePassword ? {} : { password: '' })
    };

    try {
      const res = await api.put(`/customers/update-customer/${userId}`, payload);
      setCustomer(res.data);
      setIsEditing(false);
      setChangePassword(false);
    } catch (err) {
      console.error('Update failed:', err);
      setErrorMessage(err.response?.data?.message || 'Update failed');
      setShowSnackbar(true);
    }
  };

  if (!customer) return <Typography>Loading customer profile...</Typography>;

  return (
    <Card className="mx-4 mt-6 mb-6 border border-blue-gray-100 shadow-sm">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={
                customer.photoUrl && customer.photoUrl.trim() !== ''
                  ? customer.photoUrl
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.username)}&background=random`
              }
              alt="customer-profile"
              size="lg"
              variant="rounded"
              className="shadow-md"
            />
            <div>
              <Typography variant="h5" color="blue-gray">
                {customer.username}
              </Typography>
              <Typography variant="small" className="text-blue-gray-500">
                Customer Profile
              </Typography>
            </div>
          </div>
          <Tooltip content="Edit Profile">
            <Button variant="text" size="sm" onClick={() => setIsEditing(true)}>
              <PencilIcon className="h-4 w-4 text-blue-gray-500" />
            </Button>
          </Tooltip>
        </div>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email || ''}
                fullWidth
                disabled
                size="small"
              />
              <FormHelperText>Email is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username || ''}
                fullWidth
                disabled
                size="small"
              />
              <FormHelperText>Username is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" disabled={!isEditing}>
                <InputLabel id="driverLicense-label">Driver License</InputLabel>
                <Select
                  labelId="driverLicense-label"
                  multiple
                  value={formData.driverLicense || []}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      driverLicense: typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value
                    }))
                  }
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
                <FormHelperText>Select all categories the customer holds.</FormHelperText>
              </FormControl>
            </Grid>

            {isEditing && (
              <Grid item xs={12}>
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
                    />
                  }
                  label="Change Password"
                />
                {changePassword && (
                  <TextField
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                )}
              </Grid>
            )}
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setChangePassword(false);
                  setFormData({
                    ...customer,
                    driverLicense: customer.driverLicense?.split(',') || [],
                    password: ''
                  });
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </CardBody>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CustomerView;
