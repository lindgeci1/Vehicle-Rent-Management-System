import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box, Snackbar, Alert } from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';
import { api } from '@/apiClient';
import ConfirmDialog from '../../../../utils/ConfirmDialog';
import AddPayment from './addpayment';
import UpdatePayment from './updatepayment';
import PaymentViewCustomer from './PaymentViewCustomer';
import ConfirmPaymentWrapper from './ConfirmPaymentForm';
 import { decodeToken } from '../../../../decodeToken';
  import Cookies from 'js-cookie'; 
export const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
const token = Cookies.get('token');
  const fetchPayments = () => {
    api.get('/Payments/GetPayments')
      .then(response => {
        const data = response.data.$values || response.data;
        setPayments(data);
      })
      .catch(error => {
        console.error('Error fetching payments:', error);
      });
  };

  useEffect(() => {
    fetchPayments();
    api.get('/reservations/reservations')
      .then(res => {
        const data = res.data.$values || res.data;
        setReservations(data);
      })
      .catch(() => setReservations([]));
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/Payments/DeletePayment`, { params: { id: deletePaymentId } });
      setPayments(prev => prev.filter(p => p.paymentId !== deletePaymentId));
      setShowDeleteConfirmDialog(false);
    } catch (err) {
      console.error('Delete failed:', err);
      setSnackbarMessage('Failed to delete payment.');
      setShowSnackbar(true);
    }
  };

  const columns = [
    { field: 'paymentId', headerName: 'ID', width: 80},
    { field: 'reservationId', headerName: 'Reservation ID', flex: 1 },
        {
          field: 'dateIssued',
          headerName: 'Date Payed',
          flex: 1,
          renderCell: (params) => {
            const d = new Date(params.value);
            return !params.value || isNaN(d) ? 'N/A' : d.toLocaleDateString();
          }
        },
    { field: 'description', headerName: 'Description', flex: 1},
    { field: 'prepaymentAmount', headerName: 'Prepayment (€)', flex: 1 },  {
    field: 'isRefunded',
    headerName: 'Refunded?',
    flex: 0.8,
    renderCell: (params) => (params.value ? 'Yes' : 'No')
  },
  {
    field: 'refundedAt',
    headerName: 'Refund Date',
    flex: 1,
    renderCell: (params) => {
      if (!params.value) return '—';
      const d = new Date(params.value);
      return isNaN(d) ? '—' : d.toLocaleDateString();
    }
  },
 { field: 'stripeRefundId', headerName: 'Stripe Refund ID', flex: 1,
  renderCell: (params) => params.value ?? 'N/A'
  },

{
  field: 'totalPrice',
  headerName: 'Total Price (€)',
  flex: 1,
  renderCell: (params) => params.value ?? 'N/A'
},
    { field: 'paymentStatus', headerName: 'Payment Status', flex: 1 },
    // { field: 'stripeStatus', headerName: 'Stripe Status', flex: 1 },
    {
      field: 'edit', headerName: 'Edit', width: 90, renderCell: (params) => (
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedPayment(params.row);
          setShowEditDialog(true);
        }} startIcon={<Edit />} />
      )
    },
    {
      field: 'delete', headerName: 'Delete', width: 90, renderCell: (params) => (
        <Button variant="contained" color="error" onClick={() => {
          setDeletePaymentId(params.row.paymentId);
          setShowDeleteConfirmDialog(true);
        }} startIcon={<Delete />} />
      )
    },
{
  field: 'pay',
  headerName: 'Pay',
  width: 90,
  renderCell: (params) => (
    <Button
      variant="contained"
      color="success"
      disabled={
  ['pre-paid', 'paid'].includes(
    params.row.paymentStatus?.toLowerCase()
  )
}

      onClick={() => {
        setSelectedPayment(params.row);
        setShowPayDialog(true);
      }}
    >
      {params.row.paymentStatus?.toLowerCase() === 'confirmed' ? 'Paid' : 'Pay'}
    </Button>
  )
}



  ];

  return (
    <div>
      {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setShowAddDialog(true)}
        >
          Add
        </Button>
      </Box> */}

{decodeToken(token)?.role !== 'Customer' && (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => setShowAddDialog(true)}
      >
        Add
      </Button>
    </Box>
  )}

  {decodeToken(token)?.role === 'Customer' ? (
    <PaymentViewCustomer
      payments={payments}
      getReservationLabel={(id) => `Reservation #${id}`}
      onPay={(payment) => {
        setSelectedPayment(payment);
        setShowPayDialog(true);
      }}
      onAdd={() => setShowAddDialog(true)}
    />
  ) : (
    <DataGrid
      rows={payments}
      columns={columns}
      pageSize={5}
      // checkboxSelection
      getRowId={(row) => row.paymentId}
      sortModel={[
     { field: 'reservationId', sort: 'asc' }
  ]}
    />
  )}

      {showAddDialog && (
        <AddPayment
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={(newPayment) => {
            setPayments(prev => [...prev, newPayment]);
          }}
          payments={payments}
        />
      )}

      {showEditDialog && (
        <UpdatePayment
          open={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onUpdate={(updated) => {
            setPayments(prev =>
              prev.map(p => (p.paymentId === updated.paymentId ? updated : p))
            );
          }}
          payment={selectedPayment}
          reservations={reservations}
          
        />
      )}
{showPayDialog && selectedPayment && (
  <ConfirmPaymentWrapper
    payment={selectedPayment}
    isFinal={!!selectedPayment?.totalPrice}
    open={showPayDialog}
    onClose={() => setShowPayDialog(false)}
    onConfirmed={(id) => {
      const isFinal = !!selectedPayment?.totalPrice; // ✅ FIX: define here

      setPayments(prev =>
        prev.map(p =>
          p.paymentId === id
            ? {
                ...p,
                paymentStatus: isFinal ? 'paid' : 'pre-paid',
                stripeStatus: 'succeeded'
              }
            : p
        )
      );
      setShowPayDialog(false);
    }}
  />
)}


      <ConfirmDialog
        open={showDeleteConfirmDialog}
        title="Confirm Deletion"
        content="Are you sure you want to delete this payment?"
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={handleDelete}
      />

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setShowSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Payment;
