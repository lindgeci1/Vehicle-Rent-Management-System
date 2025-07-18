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
  Stack
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const InsuranceViewCustomer = ({ policies, onAdd, onUpdate, onDelete }) => {
  const policy = policies[0]; // Only 1 allowed

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={600}>
          My Insurance Policy
        </Typography>
        {!policy && (
          <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
            Add
          </Button>
        )}
      </Stack>

      {policy ? (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
              cursor: 'pointer'
            }
          }}
          onClick={() => onUpdate(policy.insurancePolicyId)}
        >
          <CardHeader
            title={`Policy #${policy.policyNumber}`}
            subheader={`Provider: ${policy.providerName}`}
            titleTypographyProps={{ fontWeight: 600 }}
          />
          <Divider />
          <CardContent>
            <Stack spacing={1.5}>
              <InfoRow label="Coverage" value={`${policy.coveragePercentage}%`} />
              <InfoRow label="Start Date" value={policy.startDate} />
              <InfoRow label="End Date" value={policy.endDate} />
            </Stack>
          </CardContent>
          <Divider sx={{ mx: 2 }} />
          <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering edit on click
                onDelete(policy.insurancePolicyId);
              }}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      ) : (
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
                  sx={{
                    width: 60,
                    height: 60,
                    color: 'gray'
                  }}
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
          <Typography variant="body2" color="text.secondary">
            You haven’t added an insurance policy yet. Click "Add" to get started.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" fontWeight={500}>
      {label}:
    </Typography>
    <Typography variant="body2">{value}</Typography>
  </Stack>
);

export default InsuranceViewCustomer;
