import React, { useState, useEffect } from 'react';
import {
  Button, Box, Stack, Snackbar, Alert, Tooltip
} from '@mui/material';
import { Add } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import AddMotorcycle from './addmotorcycle';
import UpdateMotorcycle from './updatemotorcycle';
import MotorcycleGrid from './MotorcycleGrid';
import { api } from '@/apiClient';
import { decodeToken } from '../../../../decodeToken';
import ConfirmDialog from '../../../../utils/ConfirmDialog';

export function Motorcycle() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteMotorcycleId, setDeleteMotorcycleId] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload?.role || '';
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/motorcycles/motorcycles')
      .then(res => {
        const data = res.data?.$values || res.data;
        setMotorcycles(data);
      })
      .catch(err => console.error('Error fetching motorcycles:', err));
  }, [token]);

  const handleDelete = async () => {
    try {
      await api.delete(`/motorcycles/delete-motorcycle/${deleteMotorcycleId}`);
      setMotorcycles(prev => prev.filter(m => m.vehicleId !== deleteMotorcycleId));
      setShowDeleteConfirmDialog(false);
    } catch (err) {
      console.error('Error deleting motorcycle:', err);
    }
  };

  return (
    <div className="p-4">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tooltip title="Add Motorcycle">
          <Button variant="contained" color="primary" onClick={() => setShowCreateForm(true)} startIcon={<Add />}>
            Add
          </Button>
        </Tooltip>
      </Box>

<MotorcycleGrid
  motorcycles={motorcycles}
  setMotorcycles={setMotorcycles}
  navigate={navigate}
  setSelectedMotorcycleId={setSelectedMotorcycleId}
  setShowUpdateForm={setShowUpdateForm}
  setDeleteMotorcycleId={setDeleteMotorcycleId}
  setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
/>

      {showCreateForm && (
        <AddMotorcycle
          onClose={() => setShowCreateForm(false)}
          onAdded={(newMotorcycle) => setMotorcycles(prev => [...prev, newMotorcycle])}
        />
      )}

      {showUpdateForm && (
        <UpdateMotorcycle
          id={selectedMotorcycleId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={(updatedMotorcycle) =>
            setMotorcycles(prev =>
              prev.map(m => m.vehicleId === updatedMotorcycle.vehicleId ? updatedMotorcycle : m)
            )
          }
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirmDialog}
        title="Confirm Deletion"
        content="Are you sure you want to delete this motorcycle?"
        onClose={() => setShowDeleteConfirmDialog(false)}
        onConfirm={handleDelete}
      />

      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={() => setShowSnackbar(false)}>
        <Alert onClose={() => setShowSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Motorcycle;
