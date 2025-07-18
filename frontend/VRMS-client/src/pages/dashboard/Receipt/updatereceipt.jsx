import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const initialState = {
  paymentId: '',
  receiptType: '',
  amount: '',
  issuedAt: '',
  receiptData: ''
};

export default function UpdateReceipt({ open, onClose, onUpdate, receipt, payments = [] }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (receipt) {
      setForm({
        paymentId: receipt.paymentId || '',
        receiptType: receipt.receiptType || '',
        amount: receipt.amount || '',
        issuedAt: receipt.issuedAt ? receipt.issuedAt.split('T')[0] : '',
        receiptData: receipt.receiptData || ''
      });
    }
  }, [receipt]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Receipt</DialogTitle>
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
                disabled
              >
                <MenuItem value={form.paymentId}>{form.paymentId}</MenuItem>
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
        <Button onClick={handleSubmit} variant="contained" color="primary">Update</Button>
      </DialogActions>
    </Dialog>
  );
} 