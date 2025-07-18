import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

import AddBus from './addbuss';
import UpdateBus from './updatebuss';
import BusGrid from './BussGrid';

import { api } from '@/apiClient';
import { decodeToken } from '../../../../decodeToken';
import ConfirmDialog from '../../../../utils/ConfirmDialog';

export function Bus() {
  /* ───────────────────────── state ───────────────────────── */
  const [buses, setBuses]                       = useState([]);
  const [showCreateForm, setShowCreateForm]     = useState(false);
  const [showUpdateForm, setShowUpdateForm]     = useState(false);
  const [selectedBusId, setSelectedBusId]       = useState(null);
  const [showDeleteConfirmDialog, setShowDel]   = useState(false);
  const [deleteBusId, setDeleteBusId]           = useState(null);
  const [snackbarMessage, setSnackbarMessage]   = useState('');
  const [showSnackbar, setShowSnackbar]         = useState(false);

  /* ───────────────────────── auth / nav ───────────────────────── */
  const token        = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole     = tokenPayload?.role || '';  // reserved if role-based logic needed
  const navigate     = useNavigate();

  /* ───────────────────────── fetch list ───────────────────────── */
  useEffect(() => {
    api.get('/buses/buses')
      .then(res => {
        const data = res.data?.$values || res.data;
        setBuses(data);
      })
      .catch(err => {
        console.error('[Bus] fetch error:', err);
        setSnackbarMessage('Failed to fetch buses.');
        setShowSnackbar(true);
      });
  }, [token]);

  /* ───────────────────────── delete handler ───────────────────────── */
  const handleDelete = async () => {
    try {
      await api.delete(`/buses/delete-bus/${deleteBusId}`);
      setBuses(prev => prev.filter(b => b.vehicleId !== deleteBusId));
      setShowDel(false);
    } catch (err) {
      console.error('[Bus] delete error:', err);
      setSnackbarMessage('Failed to delete bus.');
      setShowSnackbar(true);
    }
  };

  /* ───────────────────────── render ───────────────────────── */
  return (
    <div className="p-4">
      {/* top action bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tooltip title="Add Bus">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => setShowCreateForm(true)}
          >
            Add
          </Button>
        </Tooltip>
      </Box>

      {/* grid list */}
      <BusGrid
        buses={buses}
        setBuses={setBuses}
        navigate={navigate}
        setSelectedBusId={setSelectedBusId}
        setShowUpdateForm={setShowUpdateForm}
        setDeleteBusId={setDeleteBusId}
        setShowDeleteConfirmDialog={setShowDel}
      />

      {/* create modal */}
      {showCreateForm && (
        <AddBus
          onClose={() => setShowCreateForm(false)}
          onAdded={newBus => setBuses(prev => [...prev, newBus])}
        />
      )}

      {/* update modal */}
      {showUpdateForm && (
        <UpdateBus
          id={selectedBusId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={updatedBus =>
            setBuses(prev =>
              prev.map(b => (b.vehicleId === updatedBus.vehicleId ? updatedBus : b))
            )
          }
        />
      )}

      {/* delete confirm dialog */}
      <ConfirmDialog
        open={showDeleteConfirmDialog}
        title="Confirm Deletion"
        content="Are you sure you want to delete this bus?"
        onClose={() => setShowDel(false)}
        onConfirm={handleDelete}
      />

      {/* snackbar for generic errors */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Bus;
