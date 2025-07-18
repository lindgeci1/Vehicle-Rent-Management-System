// ConfirmDialog.jsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

function ConfirmDialog({ open, title, content, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title || "Confirm Action"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {content || "Are you sure you want to proceed?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
