import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Avatar,
} from '@material-tailwind/react';
import { Box, Grid, TextField, FormHelperText } from '@mui/material';
import Cookies from 'js-cookie';
import { decodeToken } from '../../../../decodeToken';
import { api } from '@/apiClient';

const AdminView = () => {
  const [admin, setAdmin] = useState(null);
  const token = Cookies.get('token');
  const userId = Number(decodeToken(token)?.userId);

  useEffect(() => {
    if (userId) {
      api.get('/user/users')
        .then((res) => {
          const users = res.data?.$values || res.data;
          const current = users.find(u => u.userId === userId);
          setAdmin(current || null);
        })
        .catch(err => console.error('Failed to fetch admin user:', err));
    }
  }, [userId]);

  if (!admin) return <Typography>Loading admin profile...</Typography>;

  return (
    <Card className="mx-4 mt-6 mb-6 border border-blue-gray-100 shadow-sm">
      <CardBody className="p-6">
        <div className="flex items-center gap-4 mb-6">
            <Avatar
              src={
                admin.photoUrl && admin.photoUrl.trim() !== ''
                  ? admin.photoUrl
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.username)}&background=random`
              }
              alt="admin-profile"
              size="lg"
              variant="rounded"
              className="shadow-md"
            />
          <div>
            <Typography variant="h5" color="blue-gray">
              {admin.username}
            </Typography>
            <Typography variant="small" className="text-blue-gray-500">
              Admin Profile
            </Typography>
          </div>
        </div>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={admin.email || ''}
                fullWidth
                size="small"
                disabled
              />
              <FormHelperText>Email is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={admin.username || ''}
                fullWidth
                size="small"
                disabled
              />
              <FormHelperText>Username is not editable.</FormHelperText>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Roles"
                value={admin.roleNames || 'Admin'}
                fullWidth
                size="small"
                disabled
              />
              <FormHelperText>System-assigned roles</FormHelperText>
            </Grid>
          </Grid>
        </Box>
      </CardBody>
    </Card>
  );
};

export default AdminView;
