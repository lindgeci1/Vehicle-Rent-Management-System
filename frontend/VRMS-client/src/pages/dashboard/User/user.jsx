import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContentText, DialogContent, DialogTitle, Box } from '@mui/material';
import axios from 'axios';
import { Add, Delete, Edit } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import { decodeToken } from '../../../../decodeToken'; // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure

export function User() {
  const [users, setUsers] = useState([]);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);


  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';


      useEffect(() => {
        if (!token) {
          console.error("No token found, cannot fetch users.");
          return;
        }
        api.get('/user/users')
          .then(response => {
            const usersArray = response.data.$values || response.data;
            setUsers(usersArray);
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
          });
      }, [token]);


  const handleDeleteButtonClick = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/user/delete-user/${deleteUserId}`);
      setUsers(prev => prev.filter(user => user.userId !== deleteUserId));
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Base columns for the DataGrid.
  const columns = [
    { field: 'userId', headerName: 'ID', width: 80 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'roleNames', headerName: 'Roles', flex: 1 },
    // Only add the delete column if the userRole is "admin"
    ...(userRole === 'Admin' ? [{

        field: 'delete',
        headerName: 'Delete',
        width: 100,
        renderCell: (params) => (
          <Button
            variant="contained"
            color ="error"
            onClick={() => handleDeleteButtonClick(params.row.userId)}
            startIcon={<Delete />}
          >
          </Button>
        )
      }] : [])
  ];

  return (
    <div>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid 
          rows={users} 
          columns={columns} 
          pageSize={5} 
          // checkboxSelection 
          getRowId={(row) => row.userId} 
        />
      </div>

      <ConfirmDialog
  open={showDeleteConfirmDialog}
  title="Confirm Deletion"
  content="Are you sure you want to delete this user?"
  onClose={() => setShowDeleteConfirmDialog(false)}
  onConfirm={handleDelete}
/>

      
    </div>
  );
}

export default User;
