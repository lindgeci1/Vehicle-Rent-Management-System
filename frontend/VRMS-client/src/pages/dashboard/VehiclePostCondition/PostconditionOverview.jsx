// src/components/PostconditionOverview.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Box
} from '@mui/material';

export default function PostconditionOverview({ open, onClose, record, getVehicleName }) {
  if (!record) return null;

  const {
    vehicleId,
    createdAt,
    hasScratches,
    scratchDescription,
    hasDents,
    dentDescription,
    hasRust,
    rustDescription,
    totalCost
  } = record;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Post-Condition Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Vehicle
            </Typography>
            <Typography variant="body1" gutterBottom>
              {getVehicleName(vehicleId)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Created At
            </Typography>
            <Typography variant="body2">
              {new Date(createdAt).toLocaleString()}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Scratches
            </Typography>
            <Typography variant="body1">
              {hasScratches ? scratchDescription || 'No description provided' : 'None'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Dents
            </Typography>
            <Typography variant="body1">
              {hasDents ? dentDescription || 'No description provided' : 'None'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Rust
            </Typography>
            <Typography variant="body1">
              {hasRust ? rustDescription || 'No description provided' : 'None'}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Cost
            </Typography>
            <Typography variant="body1">€{(totalCost ?? 0).toFixed(2)}</Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
