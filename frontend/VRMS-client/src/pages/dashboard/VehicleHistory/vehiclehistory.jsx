import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import Cookies from 'js-cookie';
import AddVehicleHistory from './addvehiclehistory';
import UpdateVehicleHistory from './updatevehiclehistory';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeToken } from '../../../../decodeToken'; // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure
import { api } from '@/apiClient';
import VehicleHistoryViewCustomer from './VehicleHistoryViewCustomer';

export function Vehiclehistory() {
  const [histories, setHistories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/vehicle-histories/histories')
      .then((response) => {
        setHistories(response.data.$values || response.data);
      })
      .catch((error) => {
        console.error('Error fetching vehicle history data:', error);
      });
      api.get('/vehicles/vehicles')
      .then((res) => {
        setVehicles(res.data.$values || res.data);
      })
      .catch((err) => {
        console.error('Error fetching vehicles:', err);
      });
  }, [token]);

  // Open create form from navigation state (e.g. Car list)
  useEffect(() => {
    if (location.state?.vehicleId && location.state?.showCreateForm) {
      setSelectedVehicleId(location.state.vehicleId);
      setShowCreateForm(true);
      navigate(location.pathname, { replace: true }); // Reset state
    }
  }, [location.state, navigate, location.pathname]);

  const handleUpdate = (id) => {
    setSelectedId(id);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/vehicle-histories/delete-history/${deleteId}`);
      setHistories(histories.filter((h) => h.id !== deleteId));
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting vehicle history:', err);
    }
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicleId === vehicleId);
    return vehicle ? `${vehicle.mark} ${vehicle.model}` : vehicleId;
  };

  const columns = [
    // { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'vehicleId',
      headerName: 'Vehicle',
      flex: 1,
      renderCell: (params) => getVehicleName(params.row.vehicleId)
    },
    { field: 'numberOfDrivers', headerName: 'Previous Drivers', flex: 1 },
    { field: 'hasHadAccident', headerName: 'Accident', type: 'boolean', flex: 1 },
    {
      field: 'accidentDescription',
      headerName: 'Accident Description',
      flex: 2,
      renderCell: (params) => {
        const hadAccident = params.row.hasHadAccident;
        const desc = params.row.accidentDescription;
        return hadAccident
          ? desc || 'No description provided'
          : 'No accident reported';
      }
    },
    { field: 'km', headerName: 'KM Driven', flex: 1 ,renderCell: (params) => params.value?.toFixed(2)},
    {
      field: 'updatedAt',
      headerName: 'Last Updated',
      flex: 1,
      renderCell: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return isNaN(date) ? '' : date.toLocaleDateString('en-CA');
      }
    },
    {
      field: 'update',
      headerName: 'Update',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleUpdate(params.row.id)}
          startIcon={<Edit />}
        />
      )
    },
    ...(userRole === 'Admin'
      ? [
          {
            field: 'delete',
            headerName: 'Delete',
            sortable: false,
            width: 90,
            renderCell: (params) => (
              <Button
                variant="contained"
                color ="error"
                onClick={() => {
                  setDeleteId(params.row.id);
                  setShowDeleteDialog(true);
                }}
                startIcon={<Delete />}
              />
            )
          }
        ]
      : [])
  ];
  
return (
  <div>
    {userRole === 'Customer' ? (
      <VehicleHistoryViewCustomer />
    ) : (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreateForm(true)}
            startIcon={<Add />}
          >
            Add
          </Button>
        </Box>

        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={histories}
            columns={columns}
            pageSize={10}
            getRowId={(row) => row.id}
          />
        </div>
      </>
    )}

    {showCreateForm && (
      <AddVehicleHistory
        onClose={() => setShowCreateForm(false)}
        vehicleId={selectedVehicleId}
        onAdded={(newHistory) => setHistories((prev) => [...prev, newHistory])}
      />
    )}

    {showUpdateForm && (
      <UpdateVehicleHistory
        id={selectedId}
        onClose={() => setShowUpdateForm(false)}
        onUpdated={(updatedHistory) =>
          setHistories((prev) =>
            prev.map((h) => (h.id === updatedHistory.id ? updatedHistory : h))
          )
        }
      />
    )}

    <ConfirmDialog
      open={showDeleteDialog}
      title="Confirm Deletion"
      content="Are you sure you want to delete this vehicle history?"
      onClose={() => setShowDeleteDialog(false)}
      onConfirm={handleDelete}
    />
  </div>
);

}

export default Vehiclehistory;
