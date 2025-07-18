import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Modal
} from '@mui/material';
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { showSuccess } from '../../../crudNotifications';
import { api } from '@/apiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const ConfirmPaymentForm = ({ payment, onClose, onConfirmed, open, isFinal = false }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleCloseErrorDialog = () => setErrorDialogOpen(false);
// console.log(`[Stripe] Calling ${isFinal ? '/Payments/confirm-final-payment-by-id' : '/Payments/confirm-payment-by-id'} for Payment ID: ${payment.paymentId}`);
useEffect(() => {
  if (payment?.totalPrice == null) {
    setPaymentMethod('card'); // force card if TotalPrice is N/A
  }
}, [payment]);

  const handleConfirm = async () => {
    if (!payment || !paymentMethod) {
      setErrorMessage('Please select a valid payment method.');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    let paymentMethodId = 'cash';

    try {
      if (paymentMethod === 'card') {
        const cardElement = elements.getElement(CardElement);
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: 'Test User',
            email: 'test@example.com',
            address: { postal_code: '12345' }
          }
        });

        if (error) throw new Error(error.message);
        paymentMethodId = paymentMethod.id;
      }

await api.post(
  isFinal
    ? '/Payments/confirm-final-payment-by-id'
    : '/Payments/confirm-payment-by-id',
  {
    paymentId: payment.paymentId,
    paymentMethodId
  }
);


      showSuccess('Payment successful. Thank you!');
      onConfirmed(payment.paymentId);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || '❌ Payment failed. Please try again.';
      setErrorMessage(msg);
      setErrorDialogOpen(true);
    }

    setLoading(false);
  };

  if (!payment) return null;

  return (
<Modal open={open} onClose={onClose}>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      bgcolor: 'rgba(0,0,0,0.4)',
      px: 2
    }}
  >
    <Card
      raised
      sx={{
        maxWidth: 600, // ✅ Not too big, professional width
        width: '100%',
        p: 3,
        borderRadius: 3,
        boxShadow: 10
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom textAlign="center">
          Payment for Reservation #{payment.reservationId}
        </Typography>

<FormControl fullWidth size="small" sx={{ my: 2 }}>
  <InputLabel id="method-label">Payment Method</InputLabel>
  <Select
    labelId="method-label"
    value={payment.totalPrice == null ? 'card' : paymentMethod}
    onChange={(e) => setPaymentMethod(e.target.value)}
    label="Payment Method"
    disabled={payment.totalPrice == null} // lock if TotalPrice is N/A
  >
    <MenuItem value="card">Card</MenuItem>
    {payment.totalPrice != null && <MenuItem value="cash">Cash</MenuItem>}
  </Select>
</FormControl>


        {paymentMethod === 'card' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Enter Card Details
            </Typography>
            <Box
              sx={{
                border: '1px solid #ccc',
                borderRadius: 2,
                p: 2,
                backgroundColor: '#f9f9f9'
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#333',
                      '::placeholder': { color: '#aaa' }
                    },
                    invalid: { color: '#e53935' }
                  },
                  hidePostalCode: false
                }}
              />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirm}
            disabled={loading}
            sx={{ minWidth: 140 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm & Pay'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={onClose}
            sx={{ minWidth: 140 }}
          >
            Cancel
          </Button>
        </Box>
      </CardContent>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onClose={handleCloseErrorDialog}>
        <DialogTitle>{errorMessage}</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  </Box>
</Modal>

  );
};

const ConfirmPaymentWrapper = ({ payment, onClose, onConfirmed, open, isFinal = false }) => (
  <Elements stripe={stripePromise}>
    <ConfirmPaymentForm
      payment={payment}
      onClose={onClose}
      onConfirmed={onConfirmed}
      open={open}
      isFinal={isFinal} // ✅ forward flag
    />
  </Elements>
);



export default ConfirmPaymentWrapper;
