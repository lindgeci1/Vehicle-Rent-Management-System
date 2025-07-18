import React, { useState, useEffect } from 'react';
import {
  Modal, Box, TextField, Button, Grid, Typography,
  Snackbar, Alert, MenuItem, FormHelperText
} from '@mui/material';
import { api } from '@/apiClient';
import { showSuccess } from '../../../crudNotifications';

const initialState = {
  reservationId: '',
  description: '',
  prepaymentAmount: ''
};

function AddPayment({ open, onClose, onAdd, payments = [] }) {
  const [form, setForm] = useState(initialState);
  const [reservations, setReservations] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      api.get('/reservations/reservations')
        .then(res => {
          const data = res.data?.$values || res.data || [];
          setReservations(data);
        })
        .catch(() => setReservations([]));
    }
  }, [open]);

  const usedReservationIds = payments.map(p => p.reservationId);
  const availableReservations = reservations.filter(
    r => !usedReservationIds.includes(r.reservationId)
  );

const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));

if (name === "reservationId") {
  const selected = reservations.find(r => r.reservationId === parseInt(value));
  if (selected && selected.vehicleId) {
    api.get(`/vehicles/vehicle/${selected.vehicleId}`)
      .then(res => {
        const fee = res.data.prepayFee || 0;
        setForm(prev => ({ ...prev, prepaymentAmount: fee.toFixed(2) }));
      })
      .catch(err => {
        console.error('Failed to fetch vehicle fee:', err);
        setForm(prev => ({ ...prev, prepaymentAmount: '' }));
      });
  }
}

};

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    const { reservationId, description, prepaymentAmount } = form;
    const trimmedDescription = description?.trim();
    const parsedAmount = parseFloat(prepaymentAmount);

    const emptyFields = [];
    if (!reservationId) emptyFields.push("Reservation");
    if (!trimmedDescription) emptyFields.push("Description");
    if (!prepaymentAmount || isNaN(parsedAmount)) emptyFields.push("Prepayment Amount");

    if (emptyFields.length > 0) {
      setSnackbarMessage(`Missing or invalid: ${emptyFields.join(', ')}`);
      setShowSnackbar(true);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        reservationId: parseInt(reservationId),
        amount: parsedAmount,
        description: trimmedDescription
      };

      const res = await api.post('/payments/create-intent', payload);
        if (res.status === 200 && res.data) {
          showSuccess('Payment created successfully');
          onAdd(res.data); // ✅ Pass the full payment object, including paymentId
          setForm(initialState);
          onClose();
        }

    } catch (error) {
      const message = error.response?.data?.message || 'Error creating payment intent.';
      setSnackbarMessage(message);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} className="flex items-center justify-center bg-black bg-opacity-50">
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
            Add Payment
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                size="small"
                margin="dense"
                label="Reservation"
                name="reservationId"
                value={form.reservationId}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="" disabled>Select Reservation</MenuItem>
                {availableReservations.map(r => (
                  <MenuItem key={r.reservationId} value={r.reservationId}>
                    {r.reservationId} {r.description ? `- ${r.description}` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <FormHelperText>Select the reservation for payment.</FormHelperText>
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                margin="dense"
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                fullWidth
              />
              <FormHelperText>Describe the purpose of this payment.</FormHelperText>
            </Grid>

<Grid item xs={12}>
  <TextField
    size="small"
    margin="dense"
    label="Prepayment Amount (€)"
    name="prepaymentAmount"
    value={form.prepaymentAmount}
    InputProps={{ readOnly: true }}
    fullWidth
  />
  <FormHelperText>This is automatically calculated based on the vehicle.</FormHelperText>
</Grid>

          </Grid>

          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button onClick={handleSubmit} variant="contained" sx={{ minWidth: 100 }} disabled={loading}>
              Create
            </Button>
            <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)}>
        <Alert severity="error">{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
}

export default AddPayment;
