// src/components/insurance/InsuranceViewCustomer.jsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Button,
  Stack,
  Grid,
  Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const InsuranceViewCustomer = ({ policies, onAdd, onUpdate, onDelete }) => {
  const policy = policies[0];

  return (
    <Box className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-6">
      {/* Header */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#0f172a' }}>
          My Insurance Record
        </Typography>
        <Typography
          variant="body2"
          className="text-blue-gray-500 italic px-2 mt-6"
          textAlign="center"
        >
          Your active insurance policy is shown below. Click the card to update or delete it.
        </Typography>
      </Box>

      {!policy ? (
        <Box
          sx={{
            textAlign: 'center',
            mt: 6,
            mb: 4,
            px: 3,
            py: 5,
            borderRadius: 3,
            backgroundColor: '#f9f9f9',
            border: '1px dashed #ccc',
            maxWidth: 500,
            mx: 'auto',
            boxShadow: 1
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              sx={{ width: 60, height: 60, color: 'gray' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m1.5-5.25a48.39 48.39 0 00-11 0A2.25 2.25 0 003 6.52v4.697c0 5.105 3.654 9.785 8.25 10.533 4.596-.748 8.25-5.428 8.25-10.533V6.52a2.25 2.25 0 00-1.5-2.12z"
              />
            </Box>
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Insurance Policy Found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You haven’t added an insurance policy yet.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
            Add Insurance
          </Button>
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <Card
            onClick={() => onUpdate(policy.insurancePolicyId)}
            sx={{
              cursor: 'pointer',
              borderRadius: 3,
              boxShadow: 4,
              bgcolor: 'background.paper',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              width: '100%',
              maxWidth: 700,
              '&:hover': {
                boxShadow: 6,
              },
            }}
          >
            
            <CardHeader
              title={`Policy #${policy.policyNumber}`}
              subheader={`Provider: ${policy.providerName}`}
              titleTypographyProps={{ fontWeight: 700 }}
              sx={{ px: 3, pt: 3 }}
            />
            <Box borderBottom="1px solid #e0e0e0" mx={2} mb={2} />

            <CardContent sx={{ px: 3, pb: 0 }}>
              <Box
                sx={{
                  backgroundColor: '#f5f7fa',
                  borderRadius: 2,
                  px: 3,
                  py: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Policy Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Coverage" value={`${policy.coveragePercentage}%`} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="Start Date" value={policy.startDate} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoRow label="End Date" value={policy.endDate} />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>

             <Box borderBottom="1px solid #e0e0e0" mx={2} mb={2} />
            <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(policy.insurancePolicyId);
                }}
              >
              </Button>
            </CardActions>
          </Card>
        </Box>
      )}
    </Box>
  );
};

const InfoRow = ({ label, value }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2" fontWeight={600}>
      {label}:
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value || 'N/A'}
    </Typography>
  </Stack>
);

export default InsuranceViewCustomer;
