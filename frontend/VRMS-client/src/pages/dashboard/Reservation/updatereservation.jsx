import React, { useState, useEffect } from 'react';
 import { Modal, Box, TextField, Button, Grid, Typography, Snackbar, Alert, FormHelperText, MenuItem } from '@mui/material';
 import axios from 'axios';
 import Cookies from 'js-cookie';
  import { api } from '@/apiClient';
  import { showSuccess } from '../../../crudNotifications';
 function UpdateReservation({ id, onClose, onUpdated }) {
   const [formData, setFormData] = useState(null);
   const [vehicles, setVehicles] = useState([]);
   const [customers, setCustomers] = useState([]);
   const [errorMessage, setErrorMessage] = useState('');
   const [openSnackbar, setOpenSnackbar] = useState(false);
   const [originalData, setOriginalData] = useState(null);
   const token = Cookies.get('token');
 
   useEffect(() => {
     const fetchReservation = async () => {
       try {
        const res = await api.get(`/reservations/reservation/${id}`);
         setFormData(res.data);
         setOriginalData(res.data);
       } catch (err) {
         console.error(err);
         setErrorMessage('Failed to load reservation data.');
         setOpenSnackbar(true);
       }
     };
 
     const fetchDropdownData = async () => {
       try {
        const [customersRes, vehiclesRes] = await Promise.all([
          api.get('/customers/customers'),
          api.get('/vehicles/vehicles')
        ]);        
         setCustomers(customersRes.data.$values || customersRes.data);
         setVehicles(vehiclesRes.data.$values || vehiclesRes.data);
       } catch (err) {
         console.error('Dropdown fetch error:', err);
       }
     };
 
     fetchReservation();
     fetchDropdownData();
   }, [id, token]);
 
   const handleChange = (e) => {
     const { name, value } = e.target;
     setFormData((prev) => ({ ...prev, [name]: value }));
   };
   const formatStatus = (statusValue) => {
     const statusMap = {
       0: 'Pending',
       1: 'Reserved'
     };
     return statusMap[statusValue] || 'Unknown';
   };
   const handleUpdate = async () => {
     if (!formData.customerId || !formData.vehicleId || !formData.startDate || !formData.endDate) {
       setErrorMessage('All fields are required.');
       setOpenSnackbar(true);
       return;
     }
 
     const isChanged = Object.keys(formData).some(key => formData[key] !== originalData[key]);
     if (!isChanged) {
       setErrorMessage('Data must be changed before updating.');
       setOpenSnackbar(true);
       return;
     }
 
     try {
      const response = await api.put(
        `/reservations/update-reservation/${id}`,
        formData
      );      
       if (response.status === 200 && response.data) {
         const newReservation = {
             ...response.data,
             startDate: response.data.startDate?.split('T')[0],
             endDate: response.data.endDate?.split('T')[0],
             createdAt: response.data.createdAt?.split('T')[0],
             updatedAt: response.data.updatedAt?.split('T')[0],
             status: formatStatus(response.data.status)
           };
           showSuccess('Reservation created successfully');
         onUpdated(newReservation);
         onClose();
       }
     } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Failed to add reservation.');
      setOpenSnackbar(true);
     }
   };
 
   if (!formData) return null;
 
   const today = new Date().toISOString().split('T')[0];

return (
  <>
    <Modal open onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 3,
          width: 450,
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
          Update Reservation
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="Customer"
              name="customerId"
              select
              size="small"
              margin="dense"
              value={formData.customerId}
              onChange={handleChange}
              fullWidth
              disabled
            >
              {customers.map((c) => (
                <MenuItem key={c.userId} value={c.userId}>
                  {c.username || c.email}
                </MenuItem>
              ))}
            </TextField>
            <FormHelperText>Select a customer for reservation</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Vehicle"
              name="vehicleId"
              select
              size="small"
              margin="dense"
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
            <FormHelperText>Select a vehicle for reservation</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              size="small"
              margin="dense"
              value={formData.startDate.split('T')[0]}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { min: today } }}
            />
            <FormHelperText>Select start date for reservation</FormHelperText>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              size="small"
              margin="dense"
              value={formData.endDate.split('T')[0]}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { min: today } }}
            />
            <FormHelperText>Select end date for reservation</FormHelperText>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" onClick={handleUpdate} sx={{ minWidth: 100 }}>
            Update
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
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

export default UpdateReservation;

