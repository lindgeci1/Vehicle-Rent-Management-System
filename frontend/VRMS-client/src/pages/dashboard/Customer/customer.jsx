import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button, Dialog, DialogActions, DialogContentText,
  DialogContent, DialogTitle, Box, Menu, MenuItem, Stack,
  Snackbar, Alert
} from '@mui/material';
import { Tooltip } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import AddCustomer from './addcustomer';
import UpdateCustomer from './updatecustomer';
import { Add, Delete, Edit } from '@mui/icons-material';
//Exports
import { exportAsCSV } from '../Exports/exportCsv';
import { exportAsExcel } from '../Exports/exportExcel';
import { exportAsPDF } from '../Exports/exportPdf';
import { exportAsJSON } from '../Exports/exportJson';

//imports
import { importExcel } from '../Imports/importExcel';
import { importCsv } from '../Imports/importCsv';
import { importJson } from '../Imports/importJson';

import { decodeToken } from '../../../../decodeToken'; // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/apiClient';

export function Customer() {
  const [customers, setCustomers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';

  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const openMenu = Boolean(anchorEl);

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    let data = [];

    try {
      if (extension === 'xlsx' || extension === 'xls') {
        data = await importExcel(file);
      } else if (extension === 'csv') {
        data = await importCsv(file);
      } else if (extension === 'json') {
        data = await importJson(file);
      } else {
        setSnackbarMessage('Unsupported file format. Please upload Excel, CSV, or JSON.');
        setShowSnackbar(true);
        return;
      }

      const requiredFields = ['email', 'username', 'password', 'driverLicense', 'address', 'phoneNumber'];

      for (let row of data) {
        const missingFields = requiredFields.filter(field => !row.hasOwnProperty(field) || row[field] === '');
        if (missingFields.length > 0) {
          setSnackbarMessage(`Missing required fields: ${missingFields.join(', ')}`);
          setShowSnackbar(true);
          return;
        }
        if (row.driverLicense && typeof row.driverLicense === 'string') {
          row.driverLicense = row.driverLicense.split('/').map(x => x.trim()).join(',');
        }
        // if (row.hasOwnProperty('userId')) {
        //   setSnackbarMessage(`'userId' should not be included in the file.`);
        //   setShowSnackbar(true);
        //   return;
        // }
        if (typeof row.phoneNumber !== 'string') {
          row.phoneNumber = row.phoneNumber.toString().trim();
        }
      }
      let hasErrors = false;

      for (const row of data) {
        try {
          await api.post('/customers/create-customer', row);

        } catch (err) {
          hasErrors = true;
          const errorMsg = err.response?.data?.message || 'Failed to insert row.';
          setSnackbarMessage(`Error: ${errorMsg}`);
          setShowSnackbar(true);
          console.error('Failed to insert row:', row, errorMsg);
          break;
        }
      }

      if (!hasErrors) {
        setSnackbarMessage('Import successful');
        setShowSnackbar(true);
        setTimeout(() => window.location.reload(), 1000);
      }

    } catch (error) {
      console.error('Error importing file:', error);
      setSnackbarMessage('Failed to import the file.');
      setShowSnackbar(true);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  useEffect(() => {
    api.get('/customers/customers')
      .then((response) => {
        setCustomers(response.data.$values || response.data);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, [token]);

  const handleUpdateButtonClick = (customerId) => {
    setSelectedCustomerId(customerId);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  const handleDeleteButtonClick = (customerId) => {
    setDeleteCustomerId(customerId);
    setShowDeleteConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/delete-customer/${deleteCustomerId}`);
      setCustomers(customers.filter(customer => customer.userId !== deleteCustomerId));
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const columns = [
    { field: 'userId', headerName: 'ID', width: 80 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'driverLicense', headerName: 'Driver License', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'phoneNumber', headerName: 'Phone Number', flex: 1 },
    {
      field: 'update',
      headerName: 'Update',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color ="primary"
          onClick={() => handleUpdateButtonClick(params.row.userId)}
          startIcon={<Edit style={{ color: "white" }} />}
        />
      ),
    },
    ...(userRole === 'Admin' ? [{
      field: 'delete',
      headerName: 'Delete',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color ="error"
          onClick={() => handleDeleteButtonClick(params.row.userId)}
          startIcon={<Delete style={{ color: "white" }} />}
        />
      ),
    }] : []),
    {
      field: 'insurance',
      headerName: 'Insurance',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/dashboard/insurance', {
              state: { userId: params.row.userId, showCreateForm: true }
            });
          }}
        >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
        </Button>
      )
    }
    
  ];

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tooltip title="Add Customer">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreateForm(true)}
            startIcon={<Add />}
          >
            Add
          </Button>
        </Tooltip>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" onClick={handleExportClick}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor"
              style={{ marginRight: '8px', width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 
                2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 
                0-3 3m3-3V15" />
            </svg>
            Export
          </Button>
  
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
          <MenuItem
  onClick={() => {
    handleCloseMenu();

    const processed = customers.map((c) => ({
      ...c,
      driverLicense: c.driverLicense?.split(',').map(x => x.trim()).join(' / ') || '', // 👈 Replace comma with ' / '
    }));

    exportAsCSV(processed, 'customers.csv', ['roleNames']);
  }}
>
  Export as CSV
</MenuItem>

            <MenuItem onClick={() => { handleCloseMenu(); exportAsExcel(customers, 'customers.xlsx', ['roleNames']); }}>Export as Excel</MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); exportAsPDF(customers, 'customers.pdf', ['roleNames']); }}>Export as PDF</MenuItem>
            <MenuItem onClick={() => { handleCloseMenu(); exportAsJSON(customers, 'customers.json', ['roleNames']); }}>Export as JSON</MenuItem>
          </Menu>
  
          <Button variant="contained" color="primary" component="label">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              strokeWidth="1.5" stroke="currentColor"
              style={{ marginRight: '8px', width: '20px', height: '20px' }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 
                2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 
                0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 
                12l3 3m0 0 3-3m-3 3V2.25" />
            </svg>
            Import
            <input type="file" accept=".xlsx, .xls, .csv, .json" hidden onChange={handleFileInputChange} />
          </Button>
        </Stack>
      </Box>

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          pageSize={5}
          // checkboxSelection
          getRowId={(row) => row.userId}
        />
      </div>

      {showCreateForm && (
  <AddCustomer
    onClose={() => setShowCreateForm(false)}
    onAdded={(newCustomer) => setCustomers(prev => [...prev, newCustomer])}
  />
)}

{showUpdateForm && (
  <UpdateCustomer
    id={selectedCustomerId}
    onClose={() => setShowUpdateForm(false)}
    onUpdated={(updated) => {
      setCustomers(prev =>
        prev.map(c => (c.userId === updated.userId ? { ...c, ...updated } : c))
      );
    }}
  />
)}

<ConfirmDialog
  open={showDeleteConfirmDialog}
  title="Confirm Deletion"
  content="Are you sure you want to delete this customer?"
  onClose={() => setShowDeleteConfirmDialog(false)}
  onConfirm={handleDelete}
/>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Customer;