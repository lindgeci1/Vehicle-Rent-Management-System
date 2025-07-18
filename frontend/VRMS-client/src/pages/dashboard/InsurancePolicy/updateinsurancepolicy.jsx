import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Grid, Typography,
  Snackbar, Alert, FormHelperText, MenuItem
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function UpdateInsurancePolicy({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/insurancePolicy/insurancePolicy/${id}`);

        setFormData(res.data);
      } catch (err) {
        console.error('Failed to load policy:', err);
        setErrorMessage('Failed to load policy.');
        setOpenSnackbar(true);
      }
    };
    fetchData();
  }, [id, token]);

  useEffect(() => {
    api.get('/customers/customers')
    .then(res => setCustomers(res.data.$values || res.data))
    .catch(err => console.error('Error fetching customers:', err));
  }, [token]);

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

  const handleUpdate = async () => {
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
      const response = await api.put(`/insurancePolicy/update-insurancePolicy/${id}`, formData);
      if (response.status === 200 && response.data) {
        const updated = response.data;
        updated.startDate = updated.startDate?.split('T')[0];
        updated.endDate = updated.endDate?.split('T')[0];
        showSuccess('Insurance updated successfully');
        onUpdated(updated);
        onClose();
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      setErrorMessage(error.response?.data?.message || 'Error updating insurance policy.');
      setOpenSnackbar(true);
    }
  };

  if (!formData) return null;

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
          Update Insurance Policy
        </Typography>

        <Grid container spacing={2}>
          {/* <Grid item xs={12}>
            <TextField
              select
              size="small"
              margin="dense"
              label="Customer"
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              fullWidth
              disabled
            >
              {customers.map((c) => (
                <MenuItem key={c.userId} value={c.userId}>
                  {c.username}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select the customer this policy belongs to.</FormHelperText>
          </Grid> */}

          <Grid item xs={12}>
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
            <FormHelperText>Coverage added by selected provider</FormHelperText>
          </Grid>

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
          </Grid>

          <Grid item xs={12}>
            <TextField
              size="small"
              margin="dense"
              type="date"
              label="End Date"
              name="endDate"
              value={formData.endDate?.split('T')[0] || ''}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
            <FormHelperText>Policy end date must be in the future.</FormHelperText>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button onClick={handleUpdate} variant="contained" sx={{ minWidth: 100 }}>
            Update
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

export default UpdateInsurancePolicy;