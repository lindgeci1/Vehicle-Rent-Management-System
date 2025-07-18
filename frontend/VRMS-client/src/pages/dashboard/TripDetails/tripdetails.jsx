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
import axios from 'axios';
import Cookies from 'js-cookie';
import { Add, Delete, Edit } from '@mui/icons-material';
import AddTripDetails from './addtripdetails';
import UpdateTripDetails from './updatetripdetails';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '@/apiClient';

import { decodeToken } from '../../../../decodeToken'; // ✅ import it here

import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure
export function TripDetails() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  // New state to store the vehicle id (foreign key) coming from navigation state.
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Get the location state sent by the previous component.
  const location = useLocation();
  const navigate = useNavigate();

  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';

  // Fetch trip details.
  useEffect(() => {
    api.get('/tripdetails/tripdetails')
      .then((response) => {
        setTrips(response.data.$values || response.data);
      })
      .catch((error) => {
        console.error('Error fetching trip details:', error);
      });
  }, [token]);

  // Fetch vehicles to build a lookup for the vehicle name.
  useEffect(() => {
    api.get('/vehicles/vehicles')
      .then((response) => {
        setVehicles(response.data.$values || response.data);
      })
      .catch((error) => {
        console.error('Error fetching vehicles:', error);
      });
  }, [token]);

  useEffect(() => {
    if (location.state?.vehicleId && location.state?.showCreateForm) {
      setShowCreateForm(true);
      setSelectedVehicle(location.state.vehicleId);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    return vehicle ? `${vehicle.mark} ${vehicle.model}` : vehicleId;
  };

  const handleUpdateClick = (tripId) => {
    setSelectedTripId(tripId);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  const handleDeleteClick = (tripId) => {
    setTripToDelete(tripId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tripdetails/delete-tripdetails/${tripToDelete}`);
      setTrips((prev) => prev.filter((trip) => trip.tripDetailsId !== tripToDelete));
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const columns = [
    { field: 'tripDetailsId', headerName: 'ID', width: 80 },
    {
      field: 'vehicleId',
      headerName: 'Vehicle',
      flex: 1,
      renderCell: (params) => getVehicleName(params.row.vehicleId)
    },
    { field: 'daysTaken', headerName: 'Days Taken', flex: 1 },
    { field: 'distanceTraveled', headerName: 'Distance (km)', flex: 1 },
    { field: 'totalCost', headerName: 'Cost (€)', flex: 1 },
    {
      field: 'update',
      headerName: 'Update',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleUpdateClick(params.row.tripDetailsId)}
          startIcon={<Edit />}
        />
      )
    },


          {
            field: 'delete',
            headerName: 'Delete',
            sortable: false,
            width: 90,
            renderCell: (params) => (
              <Button
                color ="error"
                variant="contained"
                onClick={() => handleDeleteClick(params.row.tripDetailsId)}
                startIcon={<Delete />}
              />
            )
          }


  ];

  return (
    <div>
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
          rows={trips}
          columns={columns}
          // checkboxSelection
          getRowId={(row) => row.tripDetailsId}
          pageSize={5}
        />
      </div>

      {showCreateForm && (
      <AddTripDetails
      onClose={() => setShowCreateForm(false)}
      vehicleId={selectedVehicle}
      onAdded={(newTrip) => setTrips((prev) => [...prev, newTrip])}
    />

      )}
      {showUpdateForm && (
           
    <UpdateTripDetails
    id={selectedTripId}
    onClose={() => setShowUpdateForm(false)}
    onUpdated={(updatedTrip) =>
      setTrips((prev) =>
        prev.map((trip) => (trip.tripDetailsId === updatedTrip.tripDetailsId ? updatedTrip : trip))
      )
    }
  />
      )}

<ConfirmDialog
  open={showDeleteDialog}
  title="Confirm Deletion"
  content="Are you sure you want to delete this trip?"
  onClose={() => setShowDeleteDialog(false)}
  onConfirm={handleDelete}
/>
    </div>
  );
}

export default TripDetails;