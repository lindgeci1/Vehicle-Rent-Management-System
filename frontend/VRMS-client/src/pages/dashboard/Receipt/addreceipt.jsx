import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const initialState = {
  paymentId: '',
  receiptType: '',
  amount: '',
  issuedAt: '',
  receiptData: ''
};

export default function AddReceipt({ open, onClose, onAdd, payments = [] }) {
  const [form, setForm] = useState(initialState);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onAdd(form);
    setForm(initialState);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Receipt</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small" margin="dense">
              <InputLabel id="payment-label">Payment ID</InputLabel>
              <Select
                labelId="payment-label"
                id="paymentId"
                name="paymentId"
                value={form.paymentId}
                label="Payment ID"
                onChange={handleChange}
              >
                <MenuItem value="" disabled>Select Payment</MenuItem>
                {payments.map(p => (
                  <MenuItem key={p.paymentId} value={p.paymentId}>
                    {p.paymentId} {p.description ? `- ${p.description}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField label="Receipt Type" name="receiptType" value={form.receiptType} onChange={handleChange} fullWidth size="small" margin="dense" />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Amount" name="amount" value={form.amount} onChange={handleChange} fullWidth type="number" size="small" margin="dense" />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Issued At" name="issuedAt" type="date" value={form.issuedAt} onChange={handleChange} fullWidth size="small" margin="dense" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField label="Receipt Data" name="receiptData" value={form.receiptData} onChange={handleChange} fullWidth size="small" margin="dense" />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Add</Button>
      </DialogActions>
    </Dialog>
  );
} 