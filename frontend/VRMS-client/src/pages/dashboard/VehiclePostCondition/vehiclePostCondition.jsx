// src/components/VehiclePostCondition.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Brush as ScratchIcon,
  Build as DentIcon,
  Warning as RustIcon,
  Euro as EuroIcon,
  Download as DownloadIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';
import ConfirmDialog from '../../../../utils/ConfirmDialog';
import { api } from '@/apiClient';
import AddVehiclePostCondition from './addvehiclepostcondition';
import UpdateVehiclePostCondition from './updatevehiclepostcondition';
import PostconditionOverview from './PostconditionOverview'; // Detail dialog component (analogous to PreconditionOverview)

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
          <Typography variant="caption" fontWeight={600}>
            {label}:
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            {displayValue}
          </Typography>
        </Box>
      </Stack>
    </Grid>
  );
};

export function VehiclePostCondition() {
  const theme = useTheme();
  const [postConditions, setPostConditions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [customerUsernames, setCustomerUsernames] = useState({}); // { [preConditionId]: username } 
  const token = Cookies.get('token');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get('/vehicle-postconditions/postconditions')
      .then(async (res) => {
        const data = res.data.$values || res.data;
        setPostConditions(data);

        // 🔥 Fetch customer username for each post-condition (same as pre-condition logic)
        const map = {};
        await Promise.all(
          data.map(async (pc) => {
            try {
              const resp = await api.get(
                `/vehicle-postconditions/${pc.id}/customer-username`,
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
        console.error('Error fetching post-condition data:', err);
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
      await api.delete(`/vehicle-postconditions/delete-postcondition/${deleteId}`);
      setPostConditions((prev) => prev.filter((p) => p.id !== deleteId));
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting post-condition:', err);
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
// Replace your existing getVehicleName with this:

const getVehicleName = (vehicleId) => {
  if (vehicleId == null) return '';
  const v = vehicles.find((x) => x.vehicleId === vehicleId);
  return v ? `${v.mark} ${v.model}` : vehicleId.toString();
};


  // 6) Download handler
  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/vehicle-postconditions/download-postcondition/${id}`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `postcondition_${id}.pdf`);
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

      {/* Grid of cards: one per post-condition */}
      <Grid container spacing={3}>
        {postConditions.map((p) => (
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
              {/* CardHeader: Vehicle name + creation date */}
             <CardHeader
                title={getVehicleName(p.vehicleId)}
                subheader={`Customer: ${customerUsernames[p.id] || '—'} • ${p.createdAt ? p.createdAt.split('T')[0] : ''}`}
                titleTypographyProps={{ fontWeight: 600 }}
              />
              <Divider />

              {/* Card Content: truncated values */}
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
                  <Info
                    icon={<EuroIcon fontSize="small" color="action" />}
                    label="Total Cost"
                    value={`€${(p.totalCost ?? 0).toFixed(2)}`}
                  />
                </Grid>
              </CardContent>

              <Divider />

              {/* Card Actions: Delete, Download, Edit */}
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

                {/* <Button
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
                </Button> */}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detail Dialog (shows full descriptions) */}
      <PostconditionOverview
        open={detailOpen}
        onClose={handleCloseDetail}
        record={detailRecord}
        getVehicleName={getVehicleName}
        customerUsername={customerUsernames[detailRecord?.id] || ''}
      />

      {/* AddVehiclePostCondition dialog */}
      {showCreateForm && (
        <AddVehiclePostCondition
          onClose={() => setShowCreateForm(false)}
          vehicleId={selectedVehicleId}
          onAdded={(newPostCondition) =>
            setPostConditions((prev) => [...prev, newPostCondition])
          }
        />
      )}

      {/* UpdateVehiclePostCondition dialog */}
      {showUpdateForm && (
        <UpdateVehiclePostCondition
          id={selectedId}
          onClose={() => setShowUpdateForm(false)}
          onUpdated={(updatedPost) =>
            setPostConditions((prev) =>
              prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
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

export default VehiclePostCondition;
