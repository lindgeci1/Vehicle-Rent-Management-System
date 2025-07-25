import React, { useEffect, useState } from 'react';
import {
  Box, MenuItem, TextField, Typography, Snackbar,
  Alert, Card, Grid, Button, Collapse, Chip, Paper, CircularProgress
} from '@mui/material';
import { CardBody } from '@material-tailwind/react';

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
import { useTheme } from '@mui/material/styles';

// Inside your component


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
  const theme = useTheme();
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
        seats: seats !== '' ? parseInt(seats) : undefined,
        fuelType: fuelType || undefined,
        year: year !== '' ? parseInt(year) : undefined,
        transmission: transmission || undefined
      }
    });

    // Artificial delay of 700ms before showing results
    await new Promise(resolve => setTimeout(resolve, 700));

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
      } else {
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
  <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-8">


     <header className="max-w-5xl mx-auto mb-6 flex items-center gap-4 select-none">
    
          <img
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"    
            alt="Vehicle Rent Management System Logo"
              className="h-20 w-auto rounded-lg shadow-md" // changed from h-14 to h-20
              draggable={false}
            />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,         // makes it bold like 'font-semibold'
             color: '#0f172a', // exact match for Tailwind's text-blue-gray-900
          }}
        >
          Vehicle Rent Management System — Search
        </Typography>


          </header>


<Card
  className="max-w-7xl mx-auto p-6 border border-blue-gray-100 shadow-lg bg-white"
  sx={{ borderRadius: 2 }} // MUI spacing scale: 5 = 40px
>
      <CardBody className="p-4">
          <Typography
            variant="h6"
          color="text.primary"
          sx={{
            fontWeight: 700,       // bolder font weight for emphasis
            mb: 3,                 // margin bottom for spacing
            letterSpacing: 0.5,    // slight letter spacing for cleaner look
            textAlign: 'center',   // center align for better focus
          }}
        >
          Find Your Perfect Vehicle
        </Typography>


          <Grid container spacing={2} alignItems="center" className="mb-2" sx={{ mt: 3 }}>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>

                  <Grid
  item
  xs={12}
  md={2.5}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    pr: 2,             // add right padding to separate from divider
    height: '40px',
    mt: '-4px',
  }}
>
                    <Box
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: (theme) => theme.palette.text.secondary,
                        fontSize: '0.875rem',
                        userSelect: 'none',
                        lineHeight: 1.1,
                        textAlign: 'center',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          fontStyle: 'italic',
                          px: 2,
                          mt: 1,
                          width: '100%',
                          textAlign: 'center',
                        }}
                      >
                        Select Rental Period
                      </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                      <CalendarPickerSection
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                      />
                    </Box>
                  </Grid>
                  
                    <Box
                      sx={{
                        width: '1px',
                        height: '60px',
                        backgroundColor: (theme) => theme.palette.divider,
                        mx: 3,         // horizontal margin left and right
                        alignSelf: 'center',  // vertically center in flex container
                      }}
                    />

                  <Grid
  item
  xs={12}
  md={4}
  sx={{
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    pl: 2,            // left padding to separate divider from content
    pr: 2,            // right padding for next divider
    mt: '-13px',
  }}
>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        width: '100%',
                        maxWidth: 180,
                      }}
                    >
                  <Typography
                    variant="body2"
                      sx={{
                        color: '#64748b', // equivalent to text-blue-gray-500 from Tailwind
                        fontStyle: 'italic',
                        px: 2,
                        mt: 1,
                        width: '100%',
                        textAlign: 'center',
                      }}
                  >
                  Select Category
                  </Typography>

                          <TextField
                            select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            size="small"
                            sx={{
                              borderRadius: 1.5,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                              },
                              width: '100%',
                              minWidth: 150,
                            }}
                          >
                            <MenuItem value="Car">Car</MenuItem>
                            <MenuItem value="Bus">Bus</MenuItem>
                            <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                          </TextField>


                    </Box>
                  </Grid>

                    <Box
                    sx={{
                      width: '1px',
                      height: '60px',
                      backgroundColor: (theme) => theme.palette.divider,
                      mx: 3,         // horizontal margin left and right
                      alignSelf: 'center',  // vertically center in flex container
                    }}
                  />

                  <Grid
                    item
                    xs={12}
                    md={2.5}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      pr: 3,
                      height: 42,
                      mt: 2,
                      pl: 2,
                    }}
                  >
                <Button
                  variant="contained"
                  size="medium"              // Use MUI size prop for consistent sizing
                  onClick={fetchFilteredVehicles}
                  disabled={!startDate || !endDate || !category}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    backgroundColor: '#2C3E50', // Dark professional blue-gray
                    color: '#FFFFFF',
                    minWidth: 140,            // Use minWidth for responsive behavior
                    borderRadius: 2,
                    boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
                    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#1A2533', // Darker on hover
                      boxShadow: '0 6px 12px rgba(0,0,0,0.24)',
                    },
                    '&:disabled': {
                      backgroundColor: '#A0A0A0',
                      color: '#E0E0E0',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Search
                </Button>

                  </Grid>
                
              </Box>
          </Grid>

<Box sx={{ mt: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
  {/* Show/Hide Button */}
  <Box sx={{ mb: 1 }}>
   <Button
  variant="outlined"
  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
  sx={{
    fontWeight: 600,
    textTransform: 'none',      // no all caps, more professional
    borderRadius: 1.5,
    px: 2,                      // less horizontal padding
    py: 0.5,                    // less vertical padding
    fontSize: '0.85rem',        // slightly smaller text
    minWidth: 140,              // keep a decent width but compact
    borderColor: 'primary.main',
    color: 'primary.main',
    boxShadow: 'none',
    transition: 'background-color 0.25s ease, color 0.25s ease',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.12)',  // subtle hover
      borderColor: 'primary.dark',
      color: 'primary.dark',
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: 'rgba(25, 118, 210, 0.2)',   // subtle active press
      boxShadow: 'none',
    },
    '&:disabled': {
      borderColor: 'rgba(0, 0, 0, 0.12)',
      color: 'rgba(0, 0, 0, 0.26)',
    },
  }}
>
  {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
</Button>

  </Box>

  {/* The message, centered */}
  {showAdvancedFilters && (
    <>
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontStyle: 'italic',
          px: 2,
          mb: 2,
          width: '100%',
          maxWidth: 800,
          textAlign: 'center',
        }}
      >
        Use the advanced filters below to refine your vehicle search.
      </Typography>

      {/* Filters with vertical lines */}
      <Box sx={{ display: 'flex', overflowX: 'auto', maxWidth: 800 }}>
        {[
          {
            label: 'Seats',
            value: seats,
            onChange: (e) => setSeats(e.target.value),
            options: ['', 2, 4, 5, 6, 7, 8],
          },
          {
            label: 'Fuel Type',
            value: fuelType,
            onChange: (e) => setFuelType(e.target.value),
            options: ['', 'Petrol', 'Diesel', 'Electric', 'Hybrid'],
          },
          {
            label: 'Year',
            value: year,
            onChange: (e) => setYear(e.target.value),
            options: Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i),
          },
          {
            label: 'Transmission',
            value: transmission,
            onChange: (e) => setTransmission(e.target.value),
            options: ['', 'Manual', 'Automatic'],
          },
        ].map(({ label, value, onChange, options }, i, arr) => (
          <Box
            key={label}
            sx={{
              minWidth: 180,
              px: 2,
              
              borderRight: i !== arr.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              select
              label={label}
              fullWidth
              value={value}
              onChange={onChange}
              size="small"
              sx={{ mt: 1 }}
            >
              {options.map((opt) => (
                <MenuItem key={opt || 'all'} value={opt}>
                  {opt === '' ? 'All' : opt}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        ))}
      </Box>
    </>
  )}
</Box>










      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontStyle: 'italic',
          px: 2,
          mt: 1,
          width: '100%',
          textAlign: 'center',
        }}
      >
        Use the filters above to refine your vehicle search and find the perfect match for your rental needs.
      </Typography>
      </CardBody>
    </Card>

    {/* Chips */}
    <Box className="max-w-7xl mx-auto mt-4 mb-2 flex gap-2 flex-wrap">
      {seats && <Chip label={`Seats: ${seats}`} onDelete={() => setSeats('')} color="primary" />}
      {fuelType && <Chip label={`Fuel: ${fuelType}`} onDelete={() => setFuelType('')} color="secondary" />}
      {year && <Chip label={`Year: ${year}`} onDelete={() => setYear('')} color="info" />}
      {transmission && <Chip label={`Transmission: ${transmission}`} onDelete={() => setTransmission('')} color="warning" />}
    </Box>

    {/* Results */}
    <div className="max-w-7xl mx-auto mt-4">
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          {!searchPerformed && <VehicleInitialMessage />}
          {searchPerformed && vehicles.length === 0 && <VehicleEmptyState />}

{vehicles.length > 0 && (
  <Box sx={{ mb: 4, textAlign: 'center' }}>
    {/* Top horizontal line */}
    <Box
      sx={{
        height: 2,
        bgcolor: 'divider',
        mb: 2,
        mx: 'auto',
        maxWidth: 600,
        borderRadius: 1,
      }}
    />

    <Typography
      variant="subtitle1"
      sx={{ color: 'primary.main', fontWeight: 'bold', textTransform: 'uppercase', mb: 2 }}
    >
      Available Vehicles
    </Typography>

    {/* Bottom horizontal line */}
    <Box
      sx={{
        height: 2,
        bgcolor: 'divider',
        mt: 2,
        mx: 'auto',
        maxWidth: 600,
        borderRadius: 1,
      }}
    />

    <Grid container spacing={3} sx={{ mt: 3 }}>
      {vehicles.map((vehicle, idx) => (
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
                borderRadius: 3,
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': { transform: 'scale(1.02)' },
                cursor: 'pointer',
              }}
              onClick={() => handleVehicleClick(vehicle.vehicleId)}
            >
              <BaseDialogContent vehicle={vehicle} startDate={startDate} endDate={endDate} />
            </Card>
          </Grid>
        </Slide>
      ))}
    </Grid>
  </Box>
)}



        </>
      )}
    </div>

    {/* Dialogs */}
    {category === 'Car' && (
      <CarDialog
        open={showVehicleDialog}
        onClose={() => setShowVehicleDialog(false)}
        vehicle={selectedVehicle}
        startDate={startDate}
        endDate={endDate}
      />
    )}
    {category === 'Motorcycle' && (
      <MotorcycleDialog
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

    {/* Snackbar */}
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={() => setSnackbar({ ...snackbar, open: false })}
    >
      <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
    </Snackbar>
  </div>
);


}

export default Vehicle;
