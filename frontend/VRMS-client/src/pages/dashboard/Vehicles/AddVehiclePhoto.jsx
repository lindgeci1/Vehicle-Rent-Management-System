// src/components/AddVehiclePhoto.js
import React, { useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
const AddVehiclePhoto = ({ vehicleId, onUploaded }) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef();

  const token = Cookies.get('token');

  const handleOpen = e => {
    e.stopPropagation();   // don’t trigger parent clicks
    setOpen(true);
  };
  const handleClose = () => {
    if (!uploading) setOpen(false);
  };

  const handleFileChange = async e => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    // append each file under the key "photos"
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    setUploading(true);
    try {
      await api.post(
        `/vehicles/${vehicleId}/photos`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSnackbar({ open: true, message: 'Upload successful', severity: 'success' });
      window.location.reload();
      onUploaded?.();         // notify parent to re-fetch photos
      setOpen(false);

    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        // backend might return .message
        message: err.response?.data?.message || 'Upload failed',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Button fullWidth size="small" variant="outlined" onClick={handleOpen}>
        Upload
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Vehicle Photo(s)</DialogTitle>
        <DialogContent>
          {/* hidden multi-file input */}
          <input
            type="file"
            accept="image/*"
            name="photos"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Uploading…' : 'Select & Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddVehiclePhoto;
