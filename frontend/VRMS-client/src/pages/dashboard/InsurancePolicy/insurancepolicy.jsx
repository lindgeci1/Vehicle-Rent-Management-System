import React, { useState, useEffect } from 'react';
import {
  Box, Button, Snackbar, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Delete, Edit } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useLocation, useNavigate } from 'react-router-dom';

import AddInsurancePolicy from './addinsurancepolicy';
import UpdateInsurancePolicy from './updateinsurancepolicy';
import ConfirmDialog from '../../../../utils/ConfirmDialog';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';
import InsuranceViewCustomer from './InsuranceViewCustomer';

export function InsurancePolicy() {
  const [policies, setPolicies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload?.role;
  const userId = tokenPayload?.userId;

  const [users, setUsers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/insurancePolicy/insurancePolicies')
      .then(res => {
        const rawData = res.data.$values || res.data;
        const formatted = rawData.map(ins => ({
          ...ins,
          startDate: ins.startDate ? ins.startDate.split('T')[0] : '',
          endDate: ins.endDate ? ins.endDate.split('T')[0] : ''
        }));
        setPolicies(formatted);
      })
      .catch(err => {
        console.error('Error fetching insurance policies:', err);
      });
  }, [token]);

  useEffect(() => {
    api.get('/user/users')
      .then(res => {
        const data = res.data.$values || res.data;
        setUsers(data);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
      });
  }, [token]);

  useEffect(() => {
    if (location.state?.userId && location.state?.showCreateForm) {
      setShowAdd(true);
      setSelectedCustomer(location.state.userId);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const getUserName = (customerId) => {
    const user = users.find(u => u.userId === customerId);
    return user ? user.username : `User ${customerId}`;
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/insurancePolicy/delete-insurancePolicy/${deleteId}`);
      setPolicies(policies.filter(p => p.insurancePolicyId !== deleteId));
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const columns = [
    { field: 'insurancePolicyId', headerName: 'ID', width: 80},
    {
      field: 'userId',
      headerName: 'Username',
      flex: 1,
      renderCell: (params) => getUserName(params.row.customerId)
    },
    { field: 'policyNumber', headerName: 'Policy Number', flex: 1 },
    { field: 'providerName', headerName: 'Provider', flex: 1 },
    { field: 'coveragePercentage', headerName: 'Coverage (%)', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', flex: 1 },
    { field: 'endDate', headerName: 'End Date', flex: 1 },
    {
      field: 'update', headerName: 'Update', width: 90, renderCell: (params) => (
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedPolicyId(params.row.insurancePolicyId);
          setShowUpdate(true);
        }} startIcon={<Edit />} />
      )
    },
    {
      field: 'delete', headerName: 'Delete', width: 90, renderCell: (params) => (
        <Button variant="contained" color="error" onClick={() => {
          setDeleteId(params.row.insurancePolicyId);
          setConfirmDeleteOpen(true);
        }} startIcon={<Delete />} />
      )
    }
  ];

const filteredPolicies = userRole === 'Customer'
  ? policies.filter(p => String(p.customerId) === String(userId))
  : policies;
  return (
    <div>
      {userRole !== 'Customer' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowAdd(true)}
          >
            Add
          </Button>
        </Box>
      )}

      {userRole === 'Customer' ? (
        <InsuranceViewCustomer
  policies={filteredPolicies}
  onAdd={() => setShowAdd(true)}
  onUpdate={(id) => {
    setSelectedPolicyId(id);
    setShowUpdate(true);
  }}
  onDelete={(id) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  }}
/>
      ) : (
        <DataGrid
          rows={filteredPolicies}
          columns={columns}
          pageSize={5}
          autoHeight
          getRowId={(row) => row.insurancePolicyId}
        />
      )}

      {showAdd && (
        <AddInsurancePolicy
          onClose={() => setShowAdd(false)}
          customerId={selectedCustomer}
          onAdded={(newPolicy) => setPolicies(prev => [...prev, newPolicy])}
        />
      )}

      {showUpdate && (
        <UpdateInsurancePolicy
          id={selectedPolicyId}
          onClose={() => setShowUpdate(false)}
          onUpdated={(updated) => {
            setPolicies(prev =>
              prev.map(p => (p.insurancePolicyId === updated.insurancePolicyId ? updated : p))
            );
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Confirm Deletion"
        content="Are you sure you want to delete this policy?"
        onClose={() => setConfirmDeleteOpen(false)}
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
}

export default InsurancePolicy;