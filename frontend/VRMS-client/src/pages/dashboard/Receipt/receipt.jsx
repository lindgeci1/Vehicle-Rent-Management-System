import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { api } from '@/apiClient';
import ConfirmDialog from '../../../../utils/ConfirmDialog';
import AddReceipt from './addreceipt';
import UpdateReceipt from './updatereceipt';
import { Add } from '@mui/icons-material';
import { Edit } from '@mui/icons-material';
import ReceiptViewCustomer from './RecieptViewCustomer';
import { decodeToken } from '../../../../decodeToken'; // adjust path if needed
 import Cookies from 'js-cookie';
export const Receipt = () => {
  const [receipts, setReceipts] = useState([]);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteReceiptId, setDeleteReceiptId] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [payments, setPayments] = useState([]);


  const token = Cookies.get('token');
  const fetchReceipts = () => {
    api.get('/Receipts/GetReceipts')
      .then(response => {
        const data = response.data.$values || response.data;
        setReceipts(data);
      })
      .catch(error => {
        console.error('Error fetching receipt data:', error);
      });
  };

  useEffect(() => {
    fetchReceipts();
    api.get('/Payments/GetPayments')
      .then(res => {
        const data = res.data.$values || res.data;
        setPayments(data);
      })
      .catch(() => setPayments([]));
  }, []);

  const handleDeleteButtonClick = (receiptId) => {
    setDeleteReceiptId(receiptId);
    setShowDeleteConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/Receipts/DeleteReceipt`, { params: { id: deleteReceiptId } });
      setReceipts(prev => prev.filter(receipt => receipt.receiptId !== deleteReceiptId));
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const handleAddReceipt = async (form) => {
    try {
      const payload = {
        ...form,
        paymentId: Number(form.paymentId),
        amount: Number(form.amount),
        issuedAt: form.issuedAt ? new Date(form.issuedAt).toISOString() : null,
        receiptData: form.receiptData
      };
      await api.post('/Receipts/Insert', payload);
      setShowAddDialog(false);
      fetchReceipts();
    } catch (error) {
      console.error('Error adding receipt:', error);
    }
  };

  const handleEditButtonClick = (receipt) => {
    setSelectedReceipt(receipt);
    setShowEditDialog(true);
  };

  const handleUpdateReceipt = async (form) => {
    try {
      const payload = {
        ...form,
        paymentId: Number(form.paymentId),
        amount: Number(form.amount),
        issuedAt: form.issuedAt ? new Date(form.issuedAt).toISOString() : null,
        receiptData: form.receiptData
      };
      await api.put(`/Receipts/UpdateReceipt`, payload, { params: { id: selectedReceipt.receiptId } });
      setShowEditDialog(false);
      setSelectedReceipt(null);
      fetchReceipts();
    } catch (error) {
      console.error('Error updating receipt:', error);
    }
  };

const columns = [
  { field: 'receiptId', headerName: 'ID', width: 80 },
  { field: 'paymentId', headerName: 'Payment ID', flex: 1 },
  { field: 'receiptType', headerName: 'Receipt Type', flex: 1 },
  { field: 'amount', headerName: 'Amount (EURO)', flex: 1 },
{
  field: 'issuedAt',
  headerName: 'Issued At',
  flex: 1,
  renderCell: (params) => {
    const date = new Date(params.value);
    return date.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
  }
},


  {
    field: 'download',
    headerName: 'Download',
    width: 90,
    renderCell: (params) => (
      <Button
        variant="contained"
        color="success"
        onClick={() =>
          window.open(`${import.meta.env.VITE_API_BASE_URL}/Receipts/download/${params.row.receiptId}`, '_blank')
        }
      >
        PDF
      </Button>
    )
  },
  //   {
  //   field: 'edit',
  //   headerName: 'Edit',
  //   flex: 1,
  //   renderCell: (params) => (
  //     <Button
  //       variant="contained"
  //       color="primary"
  //       startIcon={<Edit />} 
  //       onClick={() => handleEditButtonClick(params.row)}
  //     >
  //     </Button>
  //   )
  // },
  {
    field: 'delete',
    headerName: 'Delete',
    width: 90,
    renderCell: (params) => (
      <Button
        variant="contained"
        color="error"
        onClick={() => handleDeleteButtonClick(params.row.receiptId)}
        startIcon={<Delete />}
      />
    )
  },

];


return (
  <div>
    {/* <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => setShowAddDialog(true)}
      >
        Add
      </Button>
    </Box> */}

    {decodeToken(token)?.role === 'Customer' ? (
      <ReceiptViewCustomer receipts={receipts} />
    ) : (
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={receipts}
          columns={columns}
          pageSize={5}
          // checkboxSelection
          getRowId={(row) => row.receiptId}
        />
      </div>
    )}

    <ConfirmDialog
      open={showDeleteConfirmDialog}
      title="Confirm Deletion"
      content="Are you sure you want to delete this receipt?"
      onClose={() => setShowDeleteConfirmDialog(false)}
      onConfirm={handleDelete}
    />

    <AddReceipt
      open={showAddDialog}
      onClose={() => setShowAddDialog(false)}
      onAdd={handleAddReceipt}
      receipts={receipts}
      payments={payments}
    />

    <UpdateReceipt
      open={showEditDialog}
      onClose={() => setShowEditDialog(false)}
      onUpdate={handleUpdateReceipt}
      receipt={selectedReceipt}
      payments={payments}
    />
  </div>
);
};