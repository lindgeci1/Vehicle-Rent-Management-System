import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import AddCar from './addcar';
import UpdateCar from './updatecar';
import { Add } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import VehicleGrid from './CarGrid'; // Adjust path if needed
// Export helpers
import { exportAsCSV } from '../Exports/exportCsv';
import { exportAsExcel } from '../Exports/exportExcel';
import { exportAsPDF } from '../Exports/exportPdf';
import { exportAsJSON } from '../Exports/exportJson';

// Import helpers
import { importExcel } from '../Imports/importExcel';
import { importCsv } from '../Imports/importCsv';
import { importJson } from '../Imports/importJson';
import { api } from '@/apiClient';
import { decodeToken } from '../../../../decodeToken'; // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure

export function Car() {
  const [cars, setCars] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteCarId, setDeleteCarId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const openMenu = Boolean(anchorEl);
  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';

  const navigate = useNavigate();

  const handleExportClick = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

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
      const requiredFields = ['mark', 'model', 'year', 'fuelType', 'seatingCapacity', 'trunkCapacity' ,'transmission'];

      for (let row of data) {
        const missingFields = requiredFields.filter(field => !row.hasOwnProperty(field) || row[field] === '');
        if (missingFields.length > 0) {
          setSnackbarMessage(`Missing required fields: ${missingFields.join(', ')}`);
          setShowSnackbar(true);
          return;
        }
      
      // ✅ Check and remove vehicleId if provided
      if (row.hasOwnProperty('vehicleId')) {
        delete row.vehicleId;

              if (!['manual', 'automatic'].includes(row.transmission?.toLowerCase())) {
        setSnackbarMessage(`Invalid transmission value in row: "${row.transmission}". Must be 'manual' or 'automatic'.`);
        setShowSnackbar(true);
        return;
      }
      row.isAvailable = true;
      }
        // ✅ Fix boolean fields before sending
        ['isAvailable', 'hasAirConditioning', 'hasNavigationSystem', 'hasSunroof'].forEach(field => {
          if (row.hasOwnProperty(field)) {
            row[field] = row[field] === 'true' || row[field] === true;
          }
        });
      }


      let hasErrors = false;

      for (const row of data) {
        try {
          await api.post('/cars/create-car', {
            ...row,
            prepayFee: 0
          });
        } catch (err) {
          console.error('Error inserting car:', err.response?.data || err);
      
          if (err.response?.data?.errors) {
            const errorMessages = Object.values(err.response.data.errors).flat().join(', ');
            setSnackbarMessage(`Validation errors: ${errorMessages}`);
          } else if (err.response?.data?.message) {
            setSnackbarMessage(`Error: ${err.response.data.message}`);
          } else {
            setSnackbarMessage('Error inserting car. Please try again.');
          }
      
          setShowSnackbar(true);
          throw new Error('Stop import due to error'); // ❗ Important: stop here
        }
      }
      

      if (!hasErrors) {
        // await api.post('/vehicles/update-today-availability', {});
        setSnackbarMessage('Import successful');
        setShowSnackbar(true);
        setTimeout(() => window.location.reload(), 1000);
      }
      

    } catch (error) {
      console.error('Error importing file:', error);
      setSnackbarMessage('Failed to import the file.');
      setShowSnackbar(true);
      // setTimeout(() => window.location.reload(), 1000);
    }
  };

  useEffect(() => {
    api.get('/cars/cars')
      .then(response => {
        const carsArray = response.data.$values || response.data;
        setCars(carsArray);
      })
      .catch(error => {
        console.error('Error fetching car data:', error);
      });
  }, [token]);

  const handleDelete = async () => {
    try {
      await api.delete(`/cars/delete-car/${deleteCarId}`);
      setCars(prev => prev.filter(car => car.vehicleId !== deleteCarId));
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };
  const processedCars = cars.map(car => ({
    vehicleId: car.vehicleId,
    mark: car.mark,
    model: car.model,
    year: car.year,
    prepayFee: car.prepayFee,
    fuelType: car.fuelType,
    seatingCapacity: car.seatingCapacity,
    transmission: car.transmission || '', // ✅ add this
    isAvailable: car.isAvailable ? 'true' : 'false',
    hasAirConditioning: car.hasAirConditioning ? 'true' : 'false',
    hasNavigationSystem: car.hasNavigationSystem ? 'true' : 'false',
    trunkCapacity: car.trunkCapacity,
    hasSunroof: car.hasSunroof ? 'true' : 'false'
  }));
  
  return (
    <div className="p-4">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Tooltip title="Add Car">
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
    <MenuItem onClick={() => { handleCloseMenu(); exportAsCSV(processedCars, 'cars.csv'); }}>
      Export as CSV
    </MenuItem>
    <MenuItem onClick={() => { handleCloseMenu(); exportAsExcel(processedCars, 'cars.xlsx'); }}>
      Export as Excel
    </MenuItem>
    <MenuItem onClick={() => { handleCloseMenu(); exportAsPDF(processedCars, 'cars.pdf'); }}>
      Export as PDF
    </MenuItem>
    <MenuItem onClick={() => { handleCloseMenu(); exportAsJSON(processedCars, 'cars.json'); }}>
      Export as JSON
    </MenuItem>
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

      <VehicleGrid
  cars={cars}
  setCars={setCars} // ✅ pass this
  navigate={navigate}
  setSelectedCarId={setSelectedCarId}
  setShowUpdateForm={setShowUpdateForm}
  setDeleteCarId={setDeleteCarId}
  setShowDeleteConfirmDialog={setShowDeleteConfirmDialog}
/>

      {showCreateForm && (
        <AddCar
          onClose={() => setShowCreateForm(false)}
          onAdded={(newCar) => setCars(prev => [...prev, newCar])}
        />
      )}

      {showUpdateForm && (
        <UpdateCar
          id={selectedCarId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={(updatedCar) =>
            setCars(prev =>
              prev.map(car => car.vehicleId === updatedCar.vehicleId ? updatedCar : car)
            )
          }
        />
      )}

<ConfirmDialog
  open={showDeleteConfirmDialog}
  title="Confirm Deletion"
  content="Are you sure you want to delete this car?"
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

export default Car;
