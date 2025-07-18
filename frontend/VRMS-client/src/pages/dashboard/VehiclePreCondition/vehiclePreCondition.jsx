// src/components/VehiclePreCondition.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Stack,
  Divider,
  useTheme,
  Typography as Text
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Brush as ScratchIcon,
  Build as DentIcon,
  Warning as RustIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../../../../utils/ConfirmDialog';
import { api } from '@/apiClient';
import AddVehiclePreCondition from './addvehicleprecondition';
import UpdateVehiclePreCondition from './updatevehicleprecondition';
import PreconditionOverview from './PreconditionOverview';

// Reusable Info row with icon, label, and truncated value (first 100 characters)
const Info = ({ icon, label, value }) => {
  let displayValue = 'None';
  if (value) {
    displayValue = value.length > 100 ? `${value.slice(0, 100)}...` : value;
  }

  return (
    <Grid item xs={12}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Box sx={{ maxWidth: 200 }}>
          <Text variant="caption" fontWeight={600}>
            {label}:
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            {displayValue}
          </Text>
        </Box>
      </Stack>
    </Grid>
  );
};

export function VehiclePreCondition() {
  const theme = useTheme();
  const [preConditions, setPreConditions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [customerUsernames, setCustomerUsernames] = useState({}); // { [preConditionId]: username }
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const token = Cookies.get('token');
  const navigate = useNavigate();
  const location = useLocation();

  // 1) Load all pre-conditions and vehicles, then fetch usernames
  useEffect(() => {
    api
      .get('/vehicle-preconditions/preconditions')
      .then(async (res) => {
        const data = res.data.$values || res.data;
        setPreConditions(data);

        // Fetch customer username for each pre-condition
        const map = {};
        await Promise.all(
          data.map(async (pc) => {
            try {
              const resp = await api.get(
                `/vehicle-preconditions/${pc.id}/customer-username`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              map[pc.id] = resp.data.username;
            } catch {
              map[pc.id] = '—';
            }
          })
        );
        setCustomerUsernames(map);
      })
      .catch((err) => {
        console.error('Error fetching pre-condition data:', err);
      });

    api
      .get('/vehicles/vehicles')
      .then((res) => {
        const data = res.data.$values || res.data;
        setVehicles(data);
      })
      .catch((err) => {
        console.error('Error fetching vehicle data:', err);
      });
  }, [token]);

  // 2) If navigated with state.vehicleId && showCreateForm, open the create dialog
  useEffect(() => {
    if (location.state?.vehicleId && location.state?.showCreateForm) {
      setSelectedVehicleId(location.state.vehicleId);
      setShowCreateForm(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // 3) Delete handler
  const handleDelete = async () => {
    try {
      await api.delete(`/vehicle-preconditions/delete-precondition/${deleteId}`);
      setPreConditions((prev) => prev.filter((p) => p.id !== deleteId));
      setShowDeleteDialog(false);
      setCustomerUsernames((prev) => {
        const copy = { ...prev };
        delete copy[deleteId];
        return copy;
      });
    } catch (err) {
      console.error('Error deleting pre-condition:', err);
      setShowDeleteDialog(false);
    }
  };

  // 4) Open update form
  const handleUpdate = (id) => {
    setSelectedId(id);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  // 5) Helper: find “Mark Model” by vehicleId
  const getVehicleName = (vehicleId) => {
    if (vehicleId == null) return '';
    const v = vehicles.find((x) => x.vehicleId === vehicleId);
    return v ? `${v.mark} ${v.model}` : vehicleId.toString(); // fix: convert fallback to string
  };

  // 6) Download handler
  const handleDownload = async (id) => {
    try {
      const response = await api.get(
        `/vehicle-preconditions/${id}/download`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'application/pdf' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `precondition_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  // 7) Open detail dialog showing full descriptions
  const handleOpenDetail = (record) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  // 8) Close detail dialog
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setDetailRecord(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Top “Add” button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateForm(true)}
        >
          Add
        </Button>
      </Box>

      {/* Grid of cards: one per pre-condition */}
      <Grid container spacing={3}>
        {preConditions.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                boxShadow: theme.shadows[1],
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                  cursor: 'pointer'
                }
              }}
              onClick={() => handleOpenDetail(p)}
            >
              {/* CardHeader: Vehicle name + creation date + customer username */}
             <CardHeader
                title={getVehicleName(p.vehicleId)}
                subheader={`Customer: ${customerUsernames[p.id] || '—'} • ${p.createdAt ? p.createdAt.split('T')[0] : ''}`}
                titleTypographyProps={{ fontWeight: 600 }}
              />

              <Divider />

              {/* Card Content: truncated text */}
              <CardContent>
                <Grid container spacing={1}>
                  <Info
                    icon={<ScratchIcon fontSize="small" color="action" />}
                    label="Scratches"
                    value={p.hasScratches ? p.scratchDescription : 'None'}
                  />
                  <Info
                    icon={<DentIcon fontSize="small" color="action" />}
                    label="Dents"
                    value={p.hasDents ? p.dentDescription : 'None'}
                  />
                  <Info
                    icon={<RustIcon fontSize="small" color="action" />}
                    label="Rust"
                    value={p.hasRust ? p.rustDescription : 'None'}
                  />
                </Grid>
              </CardContent>

              <Divider />

              {/* Card Actions: Delete, Download, Edit, Post */}
              <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(p.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  Delete
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(p.id);
                  }}
                >
                  Download
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(p.id);
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/dashboard/vehiclepostcondition', {
                      state: { vehicleId: p.vehicleId, showCreateForm: true }
                    });
                  }}
                >
                  Post
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detail Dialog */}
      <PreconditionOverview
        open={detailOpen}
        onClose={handleCloseDetail}
        record={detailRecord}
        getVehicleName={getVehicleName}
        customerUsername={customerUsernames[detailRecord?.id] || ''}
      />

      {/* AddVehiclePreCondition dialog */}
      {showCreateForm && (
        <AddVehiclePreCondition
          onClose={() => setShowCreateForm(false)}
          vehicleId={selectedVehicleId}
          onAdded={(newPreCondition) =>
            setPreConditions((prev) => [...prev, newPreCondition])
          }
        />
      )}

      {/* UpdateVehiclePreCondition dialog */}
      {showUpdateForm && (
        <UpdateVehiclePreCondition
          id={selectedId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={(updatedPre) =>
            setPreConditions((prev) =>
              prev.map((p) => (p.id === updatedPre.id ? updatedPre : p))
            )
          }
        />
      )}

      {/* Confirm Delete dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Confirm Deletion"
        content="Are you sure you want to delete this record?"
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

export default VehiclePreCondition;
