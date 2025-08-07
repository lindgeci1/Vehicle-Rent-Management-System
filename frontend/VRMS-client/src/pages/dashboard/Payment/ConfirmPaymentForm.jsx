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
  TextField,
  Modal,
} from '@mui/material';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { showSuccess } from '../../../crudNotifications';
import { api } from '@/apiClient';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from 'react-icons/fa';
import MasterCardLogo from '../../../icons/Mastercard-Logo.wine.png';  // or .svg or .jpg
import VisaLogo from '../../../icons/VISA-logo.png';  // or .svg or .jpg
import AmericanExpressLogo from '../../../icons/American_Express-Logo.wine.png';  // or .svg or .jpg

import { Divider } from '@mui/material';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#333',
      '::placeholder': { color: '#aaa' },
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      padding: '10px 12px',
    },
    invalid: {
      color: '#e53935',
    },
  },
  showIcon: true,  // <-- important
  hidePostalCode: false, // postal code collected separately
};

const ConfirmPaymentForm = ({ payment, onClose, onConfirmed, open, isFinal = false }) => {
  const stripe = useStripe();
  const elements = useElements();
const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleCloseErrorDialog = () => setErrorDialogOpen(false);

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
    if (paymentMethod === 'card' && !cardholderName.trim()) {
      setErrorMessage('Please enter the cardholder name.');
      setErrorDialogOpen(true);
      return;
    }
    if (paymentMethod === 'card' && !postalCode.trim()) {
      setErrorMessage('Please enter the billing zip/postal code.');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    let paymentMethodId = 'cash';

    try {
      if (paymentMethod === 'card') {
        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
          throw new Error('Card number element not found');
        }

        const { paymentMethod: pm, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
          billing_details: {
            name: cardholderName,
            address: { postal_code: postalCode },
          },
        });

        if (error) throw new Error(error.message);
        paymentMethodId = pm.id;
      }

      await api.post(
        isFinal
          ? '/Payments/confirm-final-payment-by-id'
          : '/Payments/confirm-payment-by-id',
        {
          paymentId: payment.paymentId,
          paymentMethodId,
        }
      );

      showSuccess('Payment successful. Thank you!');
      onConfirmed(payment.paymentId);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || '❌ Payment failed. Please try again.';
      setErrorMessage(msg);
      setErrorDialogOpen(true);
    }
    setLoading(false);
  };
 useEffect(() => {
    const fetchVehicleInfo = async () => {
      try {
        if (!payment?.reservationId) return;

        // Step 1: fetch reservation to get vehicleId
        const reservationRes = await api.get(`/reservations/reservation/${payment.reservationId}`);
        const reservation = reservationRes.data;

        if (!reservation?.vehicleId) return;

        // Step 2: fetch vehicle by vehicleId
        const vehicleRes = await api.get(`/vehicles/vehicle/${reservation.vehicleId}`);
        setVehicle(vehicleRes.data);
      } catch (err) {
        console.error('Error fetching vehicle info', err);
      }
    };

    fetchVehicleInfo();
  }, [payment?.reservationId]);
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
          px: 2,
        }}
      >
<Card
  raised
  sx={{
    maxWidth: 600,
    width: '100%',
    p: 3,
    borderRadius: 3,
    boxShadow: 10,
    position: 'relative',  // needed for absolute child positioning
  }}
>
  {/* Light blue background box behind content */}
  <Box
    sx={{
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      bottom: 12,
      border: '1px solid #ccc',
      borderRadius: 1,
      backgroundColor: 'rgba(220, 230, 240, 0.3)',
      pointerEvents: 'none',
      zIndex: 0,  // behind content
    }}
  />
           <CardContent sx={{ position: 'relative', zIndex: 1 }}>
<Typography variant="h6" fontWeight={700} gutterBottom textAlign="center">
        Payment for Reservation of {vehicle?.mark ?? '...'} {vehicle?.model ?? ''}
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
              <>

                {/* Credit Card Logo */}
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  }}
>
<Typography
  variant="subtitle1"
  color="text.secondary"
  sx={{
    whiteSpace: 'nowrap',
    fontWeight: 400,
    letterSpacing: 0.1,
    opacity: 0.75,
    userSelect: 'none',
  }}
>
  Accepted Credit Cards:
</Typography>


  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <img
      src={VisaLogo}
      alt="Visa Card"
      style={{ height: 35, border: '1px solid #ccc', borderRadius: 2, padding: 1 }}
    />
    <img
      src={MasterCardLogo}
      alt="Mastercard"
      style={{ height: 35, width: 60, border: '1px solid #ccc', borderRadius: 2, padding: 1 }}
    />
  </Box>
</Box>

<Divider
  sx={{
    width: '100%',
    my: 2,
    mx: 'auto',
    borderColor: '#666',           // darker shade for more contrast
    borderBottomWidth: '1px',      // thicker line
    borderBottomStyle: 'solid',    // ensure it's a solid line
    opacity: 1,                    // full opacity
  }}
/>



<Typography
  variant="caption"             // smaller than body2
  color="text.secondary"
  mb={0.5}
  px={0}
  sx={{
    fontWeight: 'bold',         // bold weight
    fontStyle: 'normal',        // not italic
    fontSize: '12px',           // keep font size
  }}
>
  Card Number
</Typography>



               <Box
  sx={{
    border: '1px solid #ccc',
    p: 1,
    backgroundColor: '#f9f9f9',
    
  }}
>
<CardNumberElement options={CARD_ELEMENT_OPTIONS} />

</Box>

<Typography
  variant="body2"
  color="text.secondary"
  fontStyle="italic"
  px={0}
  mt={1.5} 
  mb={1.5}     // increased margin top for more spacing
>
  Enter the 16-digit number on the front of your card.
</Typography>




 <Box sx={{ display: 'flex', gap: 2, mb: 0 }}>
  {/* Expiry Date */}
  <Box sx={{ flex: 1 }}>
<Typography
  variant="caption"
  color="text.secondary"
  mb={0.5}
  px={0}
  display="block"
  sx={{
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: '12px',
  }}
>
  Expiry
</Typography>


    <Box
      sx={{
        border: '1px solid #ccc',
        p: 1,
        backgroundColor: '#f9f9f9',
      }}
    >
      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      fontStyle="italic"
      px={0}
      mt={1.5} 
      mb={1.5}     // increased margin top for more spacing
    >
      Month /Year
    </Typography>
  </Box>

 <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: 1 }}>
    <Divider
      orientation="vertical"
      flexItem
      sx={{
        height: 90,               // match input height
        borderColor: '#999',
        borderRightWidth: '1px'
      }}
    />
  </Box>

  {/* CVC */}
  <Box sx={{ flex: 1 }}>
<Typography
  variant="caption"
  color="text.secondary"
  mb={0.5}
  px={0}
  sx={{
    fontWeight: 'bold',   // bold weight
    fontStyle: 'normal',  // not italic
    fontSize: '12px',     // keep font size
  }}
>
  CVC
</Typography>

    <Box
      sx={{
        border: '1px solid #ccc',
        p: 1,
        backgroundColor: '#f9f9f9',
      }}
    >
      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      fontStyle="italic"
      px={0}
      mt={1.5} 
      mb={1.5}     // increased margin top for more spacing
    >
      3-digit code
    </Typography>
  </Box>

 <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', px: 1 }}>
    <Divider
      orientation="vertical"
      flexItem
      sx={{
        height: 90,               // match input height
        borderColor: '#999',
        borderRightWidth: '1px'
      }}
    />
  </Box>

 <Box sx={{ flex: 1 }}>
<Typography
  variant="caption"
  color="text.secondary"
  mb={0.5}
  px={0}
  sx={{
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: '12px',
  }}
>
  ZIP / Postal
</Typography>

  <TextField
    fullWidth
    size="small"
    value={postalCode}
    onChange={(e) => setPostalCode(e.target.value)}
    placeholder="12345"
    variant="outlined"
    sx={{
      backgroundColor: '#f9f9f9',
      borderRadius: 0,          // no border radius = sharp edges
'& .MuiOutlinedInput-root': {
  paddingTop: '2px',
  paddingBottom: '2px',
  borderRadius: 0,
  minHeight: '30px',      // force a small height (adjust as needed)
},
'& .MuiOutlinedInput-input': {
  padding: '6.5px 8px',    // control inner input padding
  lineHeight: 1.2,
  fontSize: '14px',
},

      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: 0,        // sharp border corners
      },
    }}
  />
  <Typography variant="body2" color="text.secondary" fontStyle="italic" px={0} mt={0.75} mb={0.75}>
    Billing zip / postal code
  </Typography>
</Box>

 
</Box>
<Box sx={{ mb: 4 }}>  {/* Smaller top margin, larger bottom margin */}
<Typography
  variant="caption"
  color="text.secondary"
  mb={0.5}
  px={0}
  sx={{
    fontWeight: 'bold',
    fontStyle: 'normal',
    fontSize: '12px',
  }}
>
  Cardholder Name
</Typography>


  <TextField
    fullWidth
    size="small"
    value={cardholderName}
    onChange={(e) => setCardholderName(e.target.value)}
    placeholder="John Doe"
    variant="outlined"
    sx={{
      backgroundColor: '#f9f9f9',
      borderRadius: 0,
      '& .MuiOutlinedInput-root': {
        paddingTop: '2px',
        paddingBottom: '2px',
        borderRadius: 0,
        minHeight: '30px',
      },
      '& .MuiOutlinedInput-input': {
        padding: '6.5px 8px',
        lineHeight: 1.2,
        fontSize: '14px',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: 0,
      },
    }}
  />

  <Typography
    variant="body2"
    color="text.secondary"
    fontStyle="italic"
    px={0}
    mt={0.75}
    mb={1.5}  // ← increased bottom margin
  >
    Enter the name as it appears on your card.
  </Typography>
</Box>





              </>
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
      isFinal={isFinal}
    />
  </Elements>
);

export default ConfirmPaymentWrapper;
