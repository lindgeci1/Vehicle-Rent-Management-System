import AddReservation from './addreservation';
 import UpdateReservation from './updatereservation'; 
 import { useLocation, useNavigate } from 'react-router-dom';
 import { decodeToken } from '../../../../decodeToken'; 
 import React, { useState, useEffect } from 'react';
 import Cookies from 'js-cookie';
 import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure
 import { Add, Delete, Edit } from '@mui/icons-material';
 import ReservationViewCustomer from './ReservationViewCustomer';
 import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Box,
   Menu,
   MenuItem,
   Stack,
   Snackbar,
   Alert,
   Tooltip
 } from '@mui/material';
 import { DataGrid } from '@mui/x-data-grid';
 import axios from 'axios';
 import { api } from '@/apiClient';
 export function Reservation() {
   const [reservations, setReservations] = useState([]);
   const [vehicles, setVehicles] = useState([]);
   const [customers, setCustomers] = useState([]);
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [reservationToDelete, setReservationToDelete] = useState(null);
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [selectedVehicleId, setSelectedVehicleId] = useState(null);
   const [showUpdateForm, setShowUpdateForm] = useState(false);
 const [selectedReservationId, setSelectedReservationId] = useState(null);
 const [preselectedStartDate, setPreselectedStartDate] = useState('');
 const [preselectedEndDate, setPreselectedEndDate] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
const [openSnackbar, setOpenSnackbar] = useState(false);
   const location = useLocation();
   const navigate = useNavigate();
 
   const token = Cookies.get('token');
 
   useEffect(() => {
    api.get('/reservations/reservations')
       .then((res) => {
         const rawData = res.data.$values || res.data;
const formatted = rawData.map((res) => ({
  ...res,
  startDate: res.startDate ? res.startDate.split('T')[0] : '',
  endDate: res.endDate ? res.endDate.split('T')[0] : '',
  createdAt: res.createdAt ? res.createdAt.split('T')[0] : '',
  updatedAt: res.updatedAt ? res.updatedAt.split('T')[0] : '',
  status: formatStatus(res.status),
  pickedUp: res.pickedUp,         // ✅ Add this
  broughtBack: res.broughtBack    // ✅ And this
}));

         setReservations(formatted);
       })
       .catch((err) => console.error('Error fetching reservations:', err));
       api.get('/vehicles/vehicles')
       .then((res) => {
         setVehicles(res.data.$values || res.data);
       });
       api.get('/customers/customers')
       .then((res) => {
         setCustomers(res.data.$values || res.data);
       });
   }, [token]);
 
   const getVehicleName = (vehicleId) => {
     const v = vehicles.find((x) => x.vehicleId === vehicleId);
     return v ? `${v.mark} ${v.model}` : vehicleId;
   };
 
   const getCustomerName = (customerId) => {
     const c = customers.find((x) => x.userId === customerId);
     return c ? `${c.username || ''}`.trim() : customerId;
   };
   const handleUpdateClick = (id) => {
     setSelectedReservationId(id);
     setShowUpdateForm(true);
     setShowCreateForm(false);
   };
   const formatStatus = (statusValue) => {
     const statusMap = {
       0: 'Pending',
       1: 'Reserved',
       2: 'Conflict'
     };
     return statusMap[statusValue] || 'Unknown';
   };
 
   const handleDeleteClick = (reservationId) => {
     setReservationToDelete(reservationId);
     setShowDeleteDialog(true);
   };
   
   useEffect(() => {
     if (
       location.state?.vehicleId &&
       location.state?.showCreateForm
     ) {
       setShowCreateForm(true);
       setSelectedVehicleId(location.state.vehicleId); 
       setPreselectedStartDate(location.state.startDate); 
       setPreselectedEndDate(location.state.endDate);     
   
       navigate(location.pathname, { replace: true }); 
     }
   }, [location.state, navigate, location.pathname]);
   const handleDelete = async () => {
     try {
      await api.delete(`/reservations/delete-reservation/${reservationToDelete}`);
       setReservations((prev) =>
         prev.filter((res) => res.reservationId !== reservationToDelete)
       );
       setShowDeleteDialog(false);
     } catch (error) {
       console.error('Error deleting reservation:', error);
     }
   };
 const togglePickedUp = async (reservationId) => {
  try {
    await api.put(`/reservations/toggle-pickedup/${reservationId}`);
    const updated = await api.get(`/reservations/reservation/${reservationId}`);
    setReservations((prev) =>
      prev.map((res) =>
        res.reservationId === reservationId ? {
          ...res,
          pickedUp: updated.data.pickedUp,
          broughtBack: updated.data.broughtBack
        } : res
      )
    );
  } catch (error) {
    console.error('Failed to toggle PickedUp:', error.response?.data || error);
    if (error.response?.data?.message) {
      setErrorMessage(error.response.data.message); // ✅ show backend message
    } else {
      setErrorMessage('Failed to toggle PickedUp. Please try again.');
    }
    setOpenSnackbar(true); // ✅ show Snackbar
  }
};

const toggleBroughtBack = async (reservationId) => {
  try {
    await api.put(`/reservations/toggle-broughtback/${reservationId}`);
    const updated = await api.get(`/reservations/reservation/${reservationId}`);
    setReservations((prev) =>
      prev.map((res) =>
        res.reservationId === reservationId ? {
          ...res,
          pickedUp: updated.data.pickedUp,
          broughtBack: updated.data.broughtBack
        } : res
      )
    );
  } catch (error) {
    console.error('Failed to toggle BroughtBack:', error.response?.data || error);
    if (error.response?.data?.message) {
      setErrorMessage(error.response.data.message); // ✅ show backend message
    } else {
      setErrorMessage('Failed to toggle BroughtBack. Please try again.');
    }
    setOpenSnackbar(true); // ✅ show Snackbar
  }
};
   const columns = [
     { field: 'reservationId', headerName: 'ID', width: 80 },
     {
       field: 'customerId',
       headerName: 'Customer',
       flex: 1,
       renderCell: (params) => getCustomerName(params.value)
     },
     {
       field: 'vehicleId',
       headerName: 'Vehicle',
       flex: 1,
       renderCell: (params) => getVehicleName(params.value)
     },
     { field: 'startDate', headerName: 'Start Date', flex: 1 },
     { field: 'endDate', headerName: 'End Date', flex: 1 },
     { field: 'status', headerName: 'Status', flex: 1 },
     { field: 'createdAt', headerName: 'Created At', flex: 1 },
     { field: 'updatedAt', headerName: 'Updated At', flex: 1 },
     {
         field: 'update',
         headerName: 'Update',
         sortable: false,
         width: 90,
         renderCell: (params) => (
           <Button
             color="primary"
             variant="contained"
             onClick={() => handleUpdateClick(params.row.reservationId)}
             startIcon={<Edit />}
             disabled={params.row.status === 'Reserved'} // ✅ Disable if already reserved
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
           color="error"
           variant="contained"
           onClick={() => handleDeleteClick(params.row.reservationId)}
           startIcon={<Delete />}
           disabled={params.row.status === 'Reserved'} // ✅ Disable if already reserved
         />
       )
     },
{
  field: 'precondition',
  headerName: 'Precondition',
  sortable: false,
  width: 95,
  renderCell: (params) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startDate = params.row.startDate;
    const endDate = params.row.endDate;

    const isOutOfRange = today < startDate || today > endDate;

    return (
      <Button
        variant="outlined"
        size="small"
        disabled={params.row.status === 'Pending'} // ✅ Disable if status is Pending or date not in range
        onClick={() =>
          navigate('/dashboard/vehicleprecondition', {
            state: {
              vehicleId: params.row.vehicleId,
              showCreateForm: true
            }
          })
        }
      >
        Pre
      </Button>
    );
  }
},
{
  field: 'postcondition',
  headerName: 'Postcondition',
  sortable: false,
  width: 95,
  renderCell: (params) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startDate = params.row.startDate;
    const endDate = params.row.endDate;

    const isOutOfRange = today < startDate || today > endDate;

    return (
      <Button
        variant="outlined"
        size="small"
        disabled={params.row.status === 'Pending'} // ✅ Disable if status is Pending or date not in range
        onClick={() =>
          navigate('/dashboard/vehiclepostcondition', {
            state: {
              vehicleId: params.row.vehicleId,
              showCreateForm: true
            }
          })
        }
      >
        Post
      </Button>
    );
  }
}
,
//      {
//   field: 'rating',
//   headerName: 'Rating',
//   sortable: false,
// width: 90,
//   renderCell: (params) => (
//     <Button
//       variant="outlined"
//       size="small"
//       disabled={params.row.status === 'Pending'} // ✅ Disable if status is Pending
//       onClick={() =>
//         navigate('/dashboard/vehiclerating', {
//           state: {
//             vehicleId: params.row.vehicleId,
//             showCreateForm: true
//           }
//         })
//       }
//     >
//       Rating
//     </Button>
//   )
// },
{
  field: 'pickedUpAction',
  headerName: 'Picked Up',
  sortable: false,
  width: 110,
  renderCell: (params) => (
    <Button
      variant="outlined"
      color={params.row.pickedUp ? 'success' : 'inherit'}
      onClick={() => togglePickedUp(params.row.reservationId)}
      disabled={params.row.pickedUp}
    >
      {params.row.pickedUp ? '✓ PU' : 'PU'}
    </Button>
  )
}





  


,
{
  field: 'broughtBackAction',
  headerName: 'Brought Back',
  sortable: false,
  width: 110,
  renderCell: (params) => (
    <Button
      variant="outlined"
      color={params.row.broughtBack ? 'info' : 'inherit'}
      onClick={() => toggleBroughtBack(params.row.reservationId)}
      disabled={params.row.broughtBack}
    >
      {params.row.broughtBack ? '✓ RB' : 'RB'}
    </Button>
  )
}




     
   ];
 
return (
  <div>
{decodeToken(token)?.role !== 'Customer' && (
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
)}


    {decodeToken(token)?.role === 'Customer' ? (
      <ReservationViewCustomer
        reservations={reservations}
        getVehicleName={getVehicleName}
        onAdd={() => setShowCreateForm(true)}
        onEdit={(id) => {
          setSelectedReservationId(id);
          setShowUpdateForm(true);
        }}
        onDelete={(id) => {
          setReservationToDelete(id);
          setShowDeleteDialog(true);
        }}
      />
    ) : (
      <div style={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={reservations}
          columns={columns}
          getRowId={(row) => row.reservationId}
          pageSize={5}
        />
      </div>
    )}

    <ConfirmDialog
      open={showDeleteDialog}
      title="Confirm Deletion"
      content="Are you sure you want to cancel this reservation?"
      onClose={() => setShowDeleteDialog(false)}
      onConfirm={handleDelete}
    />

    {showCreateForm && (
      <AddReservation
        onClose={() => setShowCreateForm(false)}
        vehicleId={selectedVehicleId}
        startDate={preselectedStartDate}
        endDate={preselectedEndDate}
        onAdded={(newReservation) =>
          setReservations((prev) => [...prev, newReservation])
        }
      />
    )}

    {showUpdateForm && (
      <UpdateReservation
        id={selectedReservationId}
        onClose={() => setShowUpdateForm(false)}
        onUpdated={(updatedReservation) =>
          setReservations((prev) =>
            prev.map((res) =>
              res.reservationId === updatedReservation.reservationId
                ? updatedReservation
                : res
            )
          )
        }
      />
    )}

    <Snackbar
  open={openSnackbar}
  autoHideDuration={6000}
  onClose={() => setOpenSnackbar(false)}
>
  <Alert
    onClose={() => setOpenSnackbar(false)}
    severity="error"
    sx={{ width: '100%' }}
  >
    {errorMessage}
  </Alert>
</Snackbar>

  </div>
);

 }
 export default Reservation;
