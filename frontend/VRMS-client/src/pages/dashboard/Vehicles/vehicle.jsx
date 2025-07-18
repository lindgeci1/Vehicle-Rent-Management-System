import React, { useEffect, useState } from 'react';
import {
  Box, MenuItem, TextField, Typography, Snackbar,
  Alert, Card, Grid, Button, Collapse, Chip, Paper, CircularProgress
} from '@mui/material';
import Cookies from 'js-cookie';
import CarDialog from './CarDialog';
import BaseDialogContent from './BaseDialogContent';
import CalendarPickerSection from './CalendarPickerSection';
import Slide from '@mui/material/Slide';
import { api } from '@/apiClient';
import VehicleEmptyState from './VehicleEmptyState ';
import VehicleInitialMessage from './VehicleInitialMessage';
import MotorcycleDialog from './MotorcycleDialog';
import BusDialog from './BusDialog';
export function Vehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [seats, setSeats] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleDialog, setShowVehicleDialog] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
const [year, setYear] = useState('');
const [transmission, setTransmission] = useState('');
  const fetchFilteredVehicles = async () => {
    if (!startDate || !endDate || !category) {
      setSnackbar({
        open: true,
        message: 'Start date, end date, and category are required.',
        severity: 'warning',
      });
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/vehicles/available', {
        params: {
          startDate,
          endDate,
          category,
          seats: seats !== ''  ? parseInt(seats) : undefined,
          fuelType: fuelType || undefined,
          year: year !== '' ? parseInt(year) : undefined,
          transmission: transmission || undefined
        }
      });
      setVehicles(res.data.$values || res.data);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }

    setSearchPerformed(true);
  };

  useEffect(() => {
    if (searchPerformed) {
      fetchFilteredVehicles();
    }
  }, [seats, fuelType, year, transmission]);

const handleVehicleClick = async (id) => {
  try {
    let res;
    if (category === 'Car') {
      res = await api.get(`/cars/car/${id}`);
    } else if (category === 'Motorcycle') {
      res = await api.get(`/motorcycles/motorcycle/${id}`);
    } else if (category === 'Bus') {
      res = await api.get(`/buses/bus/${id}`);
    }
    else {
      setSnackbar({
        open: true,
        message: 'Only Car and Motorcycle are supported at the moment.',
        severity: 'error',
      });
      return;
    }
    setSelectedVehicle(res.data);
    setShowVehicleDialog(true);
  } catch (err) {
    setSnackbar({
      open: true,
      message: 'Failed to load vehicle details.',
      severity: 'error',
    });
  }
};


  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>Vehicles</Typography>

<Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3, backgroundColor: '#fdfdfd' }}>
  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
    Vehicle Search Filters
  </Typography>

  <Grid container spacing={2} alignItems="center">
    <Grid item xs={12} md={4}>
      <CalendarPickerSection
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />
    </Grid>

        <Grid item xs={12} md={1}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
               sx={{ width: 150, height:63 }} // 👈 wider dropdown
            >
              <MenuItem value="">Select Category</MenuItem>
              <MenuItem value="Car">Car</MenuItem>
              <MenuItem value="Bus">Bus</MenuItem>
              <MenuItem value="Motorcycle">Motorcycle</MenuItem>
              {/* <MenuItem value="Truck">Truck</MenuItem> */}
            </TextField>
          </Grid>

    <Grid item xs={12} md={4}>
      <Button
        variant="contained"
        fullWidth
        onClick={fetchFilteredVehicles}
        disabled={!startDate || !endDate || !category}
        sx={{ height: 60 }}
      >
        Search Available Vehicles
      </Button>
    </Grid>
  </Grid>

  <Box mt={2}>
    <Button
      variant="text"
      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      sx={{ fontWeight: 500 }}
    >
      {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
    </Button>
  </Box>

  <Collapse in={showAdvancedFilters}>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          label="Seats"
          fullWidth
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          size="small"
          sx={{ width: 150 }} // 👈 wider dropdown
        >
          <MenuItem value="">All</MenuItem>
          {[2, 4, 5, 6, 7, 8].map((seat) => (
            <MenuItem key={seat} value={seat}>{seat}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          label="Fuel Type"
          fullWidth
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          size="small"
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Petrol">Petrol</MenuItem>
          <MenuItem value="Diesel">Diesel</MenuItem>
          <MenuItem value="Electric">Electric</MenuItem>
          <MenuItem value="Hybrid">Hybrid</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          label="Year"
          fullWidth
          value={year}
          onChange={(e) => setYear(e.target.value)}
          size="small"
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          {Array.from({ length: 20 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            );
          })}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <TextField
          select
          label="Transmission"
          fullWidth
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
          size="small"
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Manual">Manual</MenuItem>
          <MenuItem value="Automatic">Automatic</MenuItem>
        </TextField>
      </Grid>
    </Grid>
  </Collapse>
</Paper>


      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {seats && (
          <Chip label={`Seats: ${seats}`} onDelete={() => setSeats('')} color="primary" />
        )}
        {fuelType && (
          <Chip label={`Fuel: ${fuelType}`} onDelete={() => setFuelType('')} color="secondary" />
        )}
        {year && (
          <Chip label={`Year: ${year}`} onDelete={() => setYear('')} color="info" />
        )}
        {transmission && (
          <Chip label={`Transmission: ${transmission}`} onDelete={() => setTransmission('')} color="warning" />
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          {!searchPerformed && <VehicleInitialMessage />}
          {searchPerformed && vehicles.length === 0 && <VehicleEmptyState />}

          {['Car', 'Bus', 'Motorcycle', 'Truck'].map((cat) => {
            const categoryVehicles = vehicles.filter((v) => v.category === cat);
            if (!categoryVehicles.length) return null;

            return (
              <Box key={cat} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mt: 3, color: 'primary.main' }}>{cat}s</Typography>
                <Grid container spacing={3}>
                  {categoryVehicles.map((vehicle, idx) => (
                    <Slide
                      key={vehicle.vehicleId}
                      direction="up"
                      in={searchPerformed}
                      style={{ transitionDelay: `${idx * 100}ms` }}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'scale(1.02)' },
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVehicleClick(vehicle.vehicleId)}
                        >
                          <BaseDialogContent
                            vehicle={vehicle}
                            startDate={startDate}
                            endDate={endDate}
                          />
                        </Card>
                      </Grid>
                    </Slide>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </>
      )}

{category === 'Car' && (
  <CarDialog
    open={showVehicleDialog}
    onClose={() => setShowVehicleDialog(false)}
    vehicle={selectedVehicle}
    startDate={startDate}
    endDate={endDate}
  />
)}

{category === 'Bus' && (
  <BusDialog
    open={showVehicleDialog}
    onClose={() => setShowVehicleDialog(false)}
    vehicle={selectedVehicle}
    startDate={startDate}
    endDate={endDate}
  />
)}



      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default Vehicle;
