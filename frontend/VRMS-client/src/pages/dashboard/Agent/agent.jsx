import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import axios from 'axios';
import AddAgent from './addagent';
import UpdateAgent from './updateagent';
import { Add, Delete, Edit } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken'; // ✅ import it here
import ConfirmDialog from '../../../../utils/ConfirmDialog'; // adjust path based on your folder structure
import { api } from '@/apiClient';

export function Agent() {
  const [agents, setAgents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteAgentId, setDeleteAgentId] = useState(null);

  const token = Cookies.get('token');
  const tokenPayload = token ? decodeToken(token) : null;
  const userRole = tokenPayload ? tokenPayload.role : '';

  useEffect(() => {
    api.get('/agents/agents')
      .then(response => {
        const raw = response.data.$values || response.data;
        setAgents(raw.map(agent => ({
          ...agent,
          joinedDate: agent.joinedDate?.split('T')[0] || ''
        })));
      })
      .catch(error => {
        console.error('Error fetching agent data:', error);
      });
  }, [token]);

  const handleUpdateButtonClick = (agentId) => {
    setSelectedAgentId(agentId);
    setShowUpdateForm(true);
    setShowCreateForm(false);
  };

  const handleDeleteButtonClick = (agentId) => {
    setDeleteAgentId(agentId);
    setShowDeleteConfirmDialog(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/agents/delete-agent/${deleteAgentId}`);
      setAgents(prev => prev.filter(agent => agent.userId !== deleteAgentId));
      setShowDeleteConfirmDialog(false);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const columns = [
    { field: 'userId', headerName: 'ID', width: 80 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'joinedDate', headerName: 'JoinedDate', flex: 1 },
    { field: 'workExperience', headerName: 'Work Experience(in Years)', flex: 1 },
    { field: 'branchLocation', headerName: 'Branch Location',width: 130 },
    {
      field: 'update',
      headerName: 'Update',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleUpdateButtonClick(params.row.userId)}
          startIcon={<Edit />}
        />
      ),
    },
    ...(userRole === 'Admin' ? [{
      field: 'delete',
      headerName: 'Delete',
      sortable: false,
      width: 90,
      renderCell: (params) => (
        <Button
          variant="contained"
          color ="error"
          onClick={() => handleDeleteButtonClick(params.row.userId)}
          startIcon={<Delete />}
        />
      ),
    }] : [])
  ];

  return (
    <div>
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

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={agents}
          columns={columns}
          pageSize={5}
          // checkboxSelection
          getRowId={(row) => row.userId}
        />
      </div>

      {showCreateForm && (
  <AddAgent
    onClose={() => setShowCreateForm(false)}
    onAdded={(createdAgent) => {
      setAgents((prev) => [...prev, createdAgent]);
      setShowCreateForm(false);
    }}
  />
)}

{showUpdateForm && (
  <UpdateAgent
    id={selectedAgentId}
    onClose={() => setShowUpdateForm(false)}
    onUpdated={(updatedAgent) => {
      setAgents((prev) =>
        prev.map((a) => (a.userId === updatedAgent.userId ? updatedAgent : a))
      );
      setShowUpdateForm(false);
    }}
  />
)}

<ConfirmDialog
  open={showDeleteConfirmDialog}
  title="Confirm Deletion"
  content="Are you sure you want to delete this agent?"
  onClose={() => setShowDeleteConfirmDialog(false)}
  onConfirm={handleDelete}
/>
    </div>
  );
}

export default Agent;