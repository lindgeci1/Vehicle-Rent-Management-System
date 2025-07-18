import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';

const VehicleInitialMessage = () => {
  return (
    <Box
      sx={{
        height: '60vh', // or '100vh' if you want to center within full screen
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          px: 4,
          py: 6,
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: 3,
          border: '1px dashed #ccc',
          maxWidth: 600,
          mx: 'auto',
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <DirectionsCarFilledIcon sx={{ fontSize: 50, color: 'primary.main' }} />
        </Box>

        <Typography variant="h5" fontWeight={600} gutterBottom>
          Ready to book your next ride?
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Choose a date range and vehicle category to find available rides.
        </Typography>

        {/* <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Explore Vehicles
        </Button> */}
      </Paper>
    </Box>
  );
};

export default VehicleInitialMessage;
