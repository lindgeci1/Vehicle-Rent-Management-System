import React, { useEffect, useState } from 'react';
import { Modal, Box, TextField, Button, FormHelperText, Grid, Typography, Snackbar, Alert, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';
function UpdateAgent({ id, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    workExperience: '',
    branchLocation: ''
  });

  const token = Cookies.get('token');
  const [originalData, setOriginalData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const response = await api.get(`/agents/agent/${id}`);
        const { password, ...safeData } = response.data;
        setFormData({ ...safeData, password: '' });
        setOriginalData(response.data);
      } catch (error) {
        console.error('Error fetching agent data:', error);
        alert('Error fetching agent data');
      }
    };

    fetchAgentData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleUpdateAgent = async () => {
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
    if (!formData.workExperience) emptyFields.push('Work Experience');
    if (!formData.branchLocation) emptyFields.push('Branch Location');

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await api.put(`/agents/update-agent/${id}`, formData);
      if (response.status === 200 && response.data) {
        showSuccess('Agent updated successfully');
        onUpdated(response.data);  // ✅ send updated agent to parent
        onClose();                 // ✅ close modal
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setErrorMessage(error.response?.data?.message || 'Error updating agent');
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
          Update Agent
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
            <FormHelperText>Please update years of experience.</FormHelperText>
          </Grid>

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
            <FormHelperText>Branch location cannot be empty.</FormHelperText>
          </Grid>

<Grid item xs={12} sm={6}>
  {changePassword && (
    <>
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
    </>
  )}
</Grid>

<Grid item xs={12} sm={6} display="flex" alignItems="center">
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
</Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateAgent}
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
      <Alert
        onClose={() => setOpenSnackbar(false)}
        severity="error"
        sx={{ width: '100%' }}
      >
        {errorMessage}
      </Alert>
    </Snackbar>
  </>
);


}

export default UpdateAgent;