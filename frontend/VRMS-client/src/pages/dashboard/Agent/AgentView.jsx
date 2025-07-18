import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Avatar,
  Tooltip,
  Button,
} from '@material-tailwind/react';
import {
  Box, Grid, TextField, MenuItem, Checkbox, FormControlLabel,
  Snackbar, Alert, FormHelperText
} from '@mui/material';
import { PencilIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';

const AgentView = () => {
  const [agent, setAgent] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const token = Cookies.get('token');
  const userId = Number(decodeToken(token)?.userId);

  useEffect(() => {
    if (userId) {
      api.get('/agents/agents')
        .then(res => {
          const agents = res.data?.$values || res.data;
          const match = agents.find(a => a.userId === userId);
          if (match) {
            setAgent(match);
            setFormData({ ...match, password: '' });
          }
        })
        .catch(err => console.error('Failed to fetch agent:', err));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const emptyFields = [];
    if (!formData.workExperience) emptyFields.push('Work Experience');
    if (!formData.branchLocation) emptyFields.push('Branch Location');
    if (changePassword && !formData.password) emptyFields.push('Password');

    if (emptyFields.length > 0) {
      setErrorMessage(`The following fields are required: ${emptyFields.join(', ')}`);
      setShowSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      ...(changePassword ? {} : { password: '' }),
    };

    try {
      const res = await api.put(`/agents/update-agent/${userId}`, payload);
      setAgent(res.data);
      setIsEditing(false);
      setChangePassword(false);
    } catch (err) {
      console.error('Update failed:', err);
      setErrorMessage(err.response?.data?.message || 'Update failed');
      setShowSnackbar(true);
    }
  };

  if (!agent) return <Typography>Loading agent profile...</Typography>;

  return (
    <Card className="mx-4 mt-6 mb-6 border border-blue-gray-100 shadow-sm">
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={
                agent.photoUrl && agent.photoUrl.trim() !== ''
                  ? agent.photoUrl
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.username)}&background=random`
              }
              alt="agent-profile"
              size="lg"
              variant="rounded"
              className="shadow-md"
            />
            <div>
              <Typography variant="h5" color="blue-gray">
                {agent.username}
              </Typography>
              <Typography variant="small" className="text-blue-gray-500">
                Agent Profile
              </Typography>
            </div>
          </div>
          <Tooltip content="Edit Profile">
            <Button variant="text" size="sm" onClick={() => setIsEditing(true)}>
              <PencilIcon className="h-4 w-4 text-blue-gray-500" />
            </Button>
          </Tooltip>
        </div>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email || ''}
                fullWidth
                disabled
                size="small"
              />
              <FormHelperText>Email is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                value={formData.username || ''}
                fullWidth
                disabled
                size="small"
              />
              <FormHelperText>Username is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Work Experience"
                name="workExperience"
                value={formData.workExperience || ''}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={!isEditing}
              >
                {[...Array(20)].map((_, i) => {
                  const year = i + 1;
                  return (
                    <MenuItem key={year} value={year.toString()}>
                      {year} {year === 1 ? 'year' : 'years'}
                    </MenuItem>
                  );
                })}
              </TextField>
              <FormHelperText>Years of experience</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Branch Location"
                name="branchLocation"
                value={formData.branchLocation || ''}
                onChange={handleInputChange}
                fullWidth
                size="small"
                disabled={!isEditing}
              />
              <FormHelperText>Branch location</FormHelperText>
            </Grid>

            {isEditing && (
              <>
                <Grid item xs={12} sm={6}>
                  {changePassword && (
                    <>
                      <TextField
                        label="New Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        size="small"
                      />
                      <FormHelperText>Password must meet security criteria.</FormHelperText>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} display="flex" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={changePassword}
                        onChange={(e) => {
                          setChangePassword(e.target.checked);
                          if (!e.target.checked) {
                            setFormData(prev => ({ ...prev, password: '' }));
                          }
                        }}
                        size="small"
                      />
                    }
                    label={<Typography sx={{ fontSize: '0.85rem' }}>Change Password</Typography>}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={handleUpdate}>
                Save Changes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setChangePassword(false);
                  setFormData({ ...agent, password: '' });
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </CardBody>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default AgentView;
