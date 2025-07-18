// crudNotifications.js
import { Snackbar, Alert } from '@mui/material';
import React from 'react';

let showSuccessFn = null;

export function SnackbarProvider({ children }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');

  showSuccessFn = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

return (
  React.createElement(React.Fragment, null,
    children,
    React.createElement(Snackbar, {
      open,
      autoHideDuration: 4000,
      onClose: () => setOpen(false)
    },
      React.createElement(Alert, {
        severity: "success",
        onClose: () => setOpen(false)
      }, message)
    )
  )
);

}

// Call this from anywhere after SnackbarProvider is mounted
export function showSuccess(message = 'Action completed successfully') {
  if (showSuccessFn) {
    showSuccessFn(message);
  } else {
    console.warn('SnackbarProvider not mounted.');
  }
}
