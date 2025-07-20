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

  if (!admin)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Typography variant="h6" color="blue-gray">
          Loading admin profile...
        </Typography>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-8">
      {/* Header with logo and title */}
      <header className="max-w-5xl mx-auto mb-6 flex items-center gap-4 select-none">
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          alt="Vehicle Rent Management System Logo"
          className="h-20 w-auto rounded-lg shadow-md"
          draggable={false}
        />
        <Typography variant="h4" color="blue-gray" className="font-semibold">
          Vehicle Rent Management System — Profile
        </Typography>
      </header>

      {/* Profile Card */}
      <Card className="max-w-6xl mx-auto rounded-lg border border-blue-gray-100 shadow-lg bg-white">
        <CardBody className="p-8">
          {/* Top section with avatar and title */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-6">
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
                <Typography variant="h5" color="blue-gray" className="font-semibold">
                  {admin.username}
                </Typography>
                <Typography variant="small" className="text-blue-gray-500">
                  Admin Profile
                </Typography>
                <Typography
                  variant="small"
                  className="text-blue-gray-600 italic text-sm mt-2"
                >
                  You can view your profile details below.
                </Typography>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" color="blue-gray" fontWeight="600" gutterBottom sx={{ mb: 6 }}>
              Account Information
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={admin.email || ''}
                  fullWidth
                  size="small"
                  disabled
                  variant="outlined"
                  sx={{ borderRadius: 1, mb: 1 }}
                />
                <FormHelperText sx={{ mt: 0.5 }}>Email is not editable.</FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Username"
                  value={admin.username || ''}
                  fullWidth
                  size="small"
                  disabled
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <FormHelperText sx={{ mt: 0.5 }}>Username is not editable.</FormHelperText>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Roles"
                  value={admin.roleNames || 'Admin'}
                  fullWidth
                  size="small"
                  disabled
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <FormHelperText sx={{ mt: 0.5 }}>System-assigned roles</FormHelperText>
              </Grid>
            </Grid>
            <Box borderBottom="1px solid #e0e0e0" mt={2} />
          </Box>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminView;
