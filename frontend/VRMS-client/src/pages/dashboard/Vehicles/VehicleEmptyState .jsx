import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

const VehicleEmptyState = () => {
  return (
    <Box
      sx={{
        height: '60vh', // or '100vh' if you want full page center
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
          backgroundColor: '#fff0f0',
          borderRadius: 3,
          border: '1px dashed #f44336',
          maxWidth: 600,
          mx: 'auto',
          boxShadow: 1
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <ReportProblemOutlinedIcon sx={{ fontSize: 50, color: 'error.main' }} />
        </Box>

        <Typography variant="h5" fontWeight={600} color="error" gutterBottom>
          No Vehicles Found
        </Typography>

        <Typography variant="body1" color="text.secondary">
          We couldn’t find any vehicles for the selected date and category.
          Please adjust your filters and try again.
        </Typography>
      </Paper>
    </Box>
  );
};

export default VehicleEmptyState;
