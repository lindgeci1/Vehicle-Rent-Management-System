import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Grid, Typography,
  Snackbar, Alert, FormHelperText, MenuItem
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
import { decodeToken } from '../../../../decodeToken';
function AddInsurancePolicy({ onClose, onAdded, customerId }) {
  const [formData, setFormData] = useState({
    customerId: '',
    policyNumber: '',
    providerName: '',
    endDate: '',
    coveragePercentage: ''
  });

  const [customers, setCustomers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
    const token = Cookies.get('token');
    const payload = token ? decodeToken(token) : {};

  // Fetch customers for dropdown
  useEffect(() => {
    api.get('/customers/customers')
    .then(res => setCustomers(res.data.$values || res.data))
    .catch(err => console.error('Error fetching customers:', err));
  }, [token]);

  // Set selected customerId if passed as prop

 useEffect(() => {
   if (payload.role === 'Customer' && payload.userId) {
     setFormData(fd => ({ ...fd, customerId: parseInt(payload.userId, 10) }));
   }
 }, [payload.userId, payload.role]);
 
  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  
    if (name === 'providerName') {
      try {
        const response = await api.get('/insurancePolicy/providers', {
          params: { providerName: value }
        });
        const coverage = response.data?.[value];
        setFormData(prev => ({ ...prev, coveragePercentage: coverage }));
      } catch (err) {
        console.error('Failed to fetch coverage percentage:', err);
        setFormData(prev => ({ ...prev, coveragePercentage: '' }));
      }
    }
  };  

  const handleAddPolicy = async () => {
    const { customerId, policyNumber, providerName, endDate } = formData;
    const emptyFields = [];

    if (!customerId) emptyFields.push('Customer');
    if (!policyNumber) emptyFields.push('Policy Number');
    if (!providerName) emptyFields.push('Provider');
    if (!endDate) emptyFields.push('End Date');

    if (policyNumber.length !== 7) {
      setErrorMessage('Policy number must be exactly 7 characters.');
      setOpenSnackbar(true);
      return;
    }

    if (emptyFields.length > 0) {
      setErrorMessage(`Missing: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await api.post('/insurancePolicy/create-insurancePolicy', formData);


      if (response.status === 200 && response.data) {
        const added = response.data;
        added.startDate = added.startDate?.split('T')[0];
        added.endDate = added.endDate?.split('T')[0];
        showSuccess('Insurance created successfully');
        onAdded(added);
        onClose();
      }
    } catch (error) {
      console.error('Error adding policy:', error);
      setErrorMessage(error.response?.data?.message || 'Error creating insurance policy.');
      setOpenSnackbar(true);
    }
  };

return (
  <>
    <Modal open onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 3,
          width: 500,
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Add Insurance Policy
        </Typography>

<Grid container spacing={2}>
  {/* Customer */}
  <Grid item xs={12} sm={6}>
    <TextField
      select
      size="small"
      margin="dense"
      label="Customer"
      name="customerId"
      value={formData.customerId}
      onChange={handleInputChange}
      fullWidth
      disabled={payload.role === 'Customer'}
    >
      {customers.map((c) => (
        <MenuItem key={c.userId} value={c.userId}>
          {c.username}
        </MenuItem>
      ))}
    </TextField>
    <FormHelperText>Select the customer for insurance.</FormHelperText>
  </Grid>

  {/* Policy Number */}
  <Grid item xs={12} sm={6}>
    <TextField
      size="small"
      margin="dense"
      label="Policy Number"
      name="policyNumber"
      value={formData.policyNumber}
      onChange={handleInputChange}
      fullWidth
    />
    <FormHelperText>Exactly 7 characters required.</FormHelperText>
  </Grid>


  {/* Provider */}
  <Grid item xs={12}>
    <TextField
      select
      size="small"
      margin="dense"
      label="Provider"
      name="providerName"
      value={formData.providerName}
      onChange={handleInputChange}
      fullWidth
    >
      {['Scardian', 'Siguria', 'Elsig', 'Dardania', 'Illyria'].map(p => (
        <MenuItem key={p} value={p}>{p}</MenuItem>
      ))}
    </TextField>
    <FormHelperText>Put the Customer's provider name.</FormHelperText>
  </Grid>
  {/* Coverage */}
  <Grid item xs={12}>
    <TextField
      size="small"
      margin="dense"
      label="Coverage (%)"
      name="coveragePercentage"
      value={formData.coveragePercentage}
      InputProps={{ readOnly: true }}
      fullWidth
      disabled
    />
    <FormHelperText>Coverage added by selected provider</FormHelperText>
  </Grid>


  <Grid item xs={12}>
        <TextField
      size="small"
      margin="dense"
      type="date"
      label="End Date"
      name="endDate"
      value={formData.endDate}
      onChange={handleInputChange}
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ min: new Date().toISOString().split('T')[0] }}
    />

    <FormHelperText>Policy end date must be in the future.</FormHelperText>
  </Grid>
</Grid>


        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button onClick={handleAddPolicy} variant="contained" sx={{ minWidth: 100 }}>
            Create
          </Button>
          <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>

    <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
      <Alert severity="error">{errorMessage}</Alert>
    </Snackbar>
  </>
);

}

export default AddInsurancePolicy;
