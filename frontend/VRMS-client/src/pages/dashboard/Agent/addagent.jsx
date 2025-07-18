import React, { useState } from 'react';
import { Modal, Box, TextField, Button, FormHelperText, FormControl, Grid, InputLabel, Select, MenuItem, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';

function AddAgent({ onClose, onAdded }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    branchLocation: '',
    workExperience: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const token = Cookies.get('token');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddAgent = async () => {
    const emptyFields = [];
    if (!formData.email) emptyFields.push('Email');
    if (!formData.username) emptyFields.push('Username');
    if (!formData.password) emptyFields.push('Password');
    if (!formData.branchLocation) emptyFields.push('Branch Location');
    if (!formData.workExperience) emptyFields.push('Work Experience');

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await api.post('/agents/create-agent', formData);
      if (response.status === 200 && response.data) {
        showSuccess('Agent created successfully');
        onAdded(response.data);  // ✅ use backend-returned full agent
        onClose();              // ✅ close the modal
      }
    } catch (error) {
      console.error('Error adding agent:', error.response?.data || error);

      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Error adding agent. Please try again.');
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
          width: 500,
          mx: 'auto',
          boxShadow: 6
        }}
      >
        <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
          Create New Agent
        </Typography>

<Grid container spacing={1}>
  {/* Email */}
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

  {/* Username */}
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

  {/* Branch Location */}
  <Grid item xs={12} sm={6}>
    <TextField
      size="small"
      margin="dense"
      label="Branch Location"
      name="branchLocation"
      value={formData.branchLocation}
      onChange={handleInputChange}
      fullWidth
    />
    <FormHelperText>Please enter a branch location.</FormHelperText>
  </Grid>

  {/* Work Experience (same row as branch) */}
  <Grid item xs={12} sm={6}>
    <TextField
      size="small"
      margin="dense"
      select
      label="Work Experience"
      name="workExperience"
      value={formData.workExperience}
      onChange={handleInputChange}
      fullWidth
    >
      {[...Array(20)].map((_, i) => {
        const year = i + 1;
        return (
          <MenuItem key={year} value={year.toString()}>
            {year} {year === 1 ? 'year' : 'years'}
          </MenuItem>
        );
      })}
    </TextField>
    <FormHelperText>Select the agent's years of experience.</FormHelperText>
  </Grid>

  {/* Password */}
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
    <FormHelperText>Password cannot be empty.</FormHelperText>
  </Grid>
</Grid>


        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary" onClick={handleAddAgent} sx={{ minWidth: 100 }}>
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

export default AddAgent;