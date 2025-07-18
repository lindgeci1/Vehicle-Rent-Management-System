import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert
} from '@mui/material';
import { api } from '@/apiClient';

const initialState = {
  reservationId: '',
  description: '',
  prepaymentAmount: '',
};

export default function UpdatePayment({ open, onClose, onUpdate, payment }) {
  const [form, setForm] = useState(initialState);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (payment) {
      setForm({
        reservationId: payment.reservationId || '',
        description: payment.description || '',
        prepaymentAmount: payment.prepaymentAmount || '',
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(form.prepaymentAmount);
    if (!amount || isNaN(amount)) {
      setSnackbarMessage('Invalid prepayment amount.');
      setShowSnackbar(true);
      return;
    }

    try {
      const updatedPayment = {
        ...payment,
        prepaymentAmount: amount
      };

      await api.put(`/Payments/UpdatePayment`, updatedPayment, {
        params: { id: payment.paymentId }
      });

      onUpdate(updatedPayment);
      onClose();
    } catch (error) {
      setSnackbarMessage(error.response?.data?.message || 'Failed to update payment.');
      setShowSnackbar(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Prepayment Amount</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" margin="dense">
                <InputLabel id="reservation-label">Reservation ID</InputLabel>
                <Select
                  labelId="reservation-label"
                  id="reservationId"
                  name="reservationId"
                  value={form.reservationId}
                  label="Reservation ID"
                  disabled
                >
                  <MenuItem value={form.reservationId}>{form.reservationId}</MenuItem>
                </Select>
                <FormHelperText>This field cannot be edited.</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                size="small"
                margin="dense"
                disabled
              />
              <FormHelperText>This field cannot be edited.</FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Prepayment Amount (€)"
                name="prepaymentAmount"
                value={form.prepaymentAmount}
                onChange={handleChange}
                type="number"
                fullWidth
                size="small"
                margin="dense"
              />
              <FormHelperText>Only this value is editable.</FormHelperText>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="error">{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}
