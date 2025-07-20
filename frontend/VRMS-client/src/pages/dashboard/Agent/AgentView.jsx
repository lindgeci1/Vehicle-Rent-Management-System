import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Typography,
  Avatar,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  Box,
  TextField,
  Grid,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
} from "@mui/material";
import { PencilIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import { decodeToken } from "../../../../decodeToken";
import { api } from "@/apiClient";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
const licenseCategories = [
  { code: "AM", description: "Mopeds and light quadricycles" },
  { code: "A1", description: "Motorcycles up to 125cc" },
  { code: "A2", description: "Motorcycles up to 35kW" },
  { code: "A", description: "Any motorcycle" },
  { code: "B1", description: "Light vehicles and quadricycles" },
  { code: "B", description: "Standard car license" },
  { code: "C1", description: "Medium trucks up to 7.5 tons" },
  { code: "C", description: "Heavy trucks over 7.5 tons" },
  { code: "D1", description: "Mini-buses up to 16 passengers" },
  { code: "D", description: "Buses with more than 16 passengers" },
  { code: "Be", description: "Car with trailer up to 3,500kg" },
  { code: "C1E", description: "Medium truck with trailer" },
  { code: "CE", description: "Heavy truck with trailer" },
  { code: "D1E", description: "Mini-bus with trailer" },
  { code: "DE", description: "Bus with trailer" },
];

const AgentView = () => {
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
const [showPwd, setShowPwd] = useState(false);
  const token = Cookies.get("token");
  const userId = Number(decodeToken(token)?.userId);

  useEffect(() => {
    if (userId) {
      api
        .get(`/agents/agents`)
        .then((res) => {
          const customers = res.data?.$values || res.data;
          const match = customers.find((c) => c.userId === userId);
          if (match) {
            setCustomer(match);
            const licenseArray = match.driverLicense
              ? match.driverLicense.split(",").map((x) => x.trim())
              : [];
            setFormData({ ...match, driverLicense: licenseArray, password: "" });
          }
        })
        .catch((err) => console.error("Failed to fetch customer:", err));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    const emptyFields = [];
    if (!formData.workExperience) emptyFields.push("Work Experience");
    if (!formData.branchLocation) emptyFields.push("Branch Location");
    if (changePassword && !formData.password) emptyFields.push("Password");

    if (emptyFields.length > 0) {
      setErrorMessage(`Required: ${emptyFields.join(", ")}`);
      setShowSnackbar(true);
      return;
    }

    const payload = {
      ...formData,
      driverLicense: formData.driverLicense.join(","),
      ...(changePassword ? {} : { password: "" }),
    };

    try {
      const res = await api.put(`/agents/update-agent/${userId}`, payload);
      setCustomer(res.data);
      setIsEditing(false);
      setChangePassword(false);
    } catch (err) {
      console.error("Update failed:", err);
      setErrorMessage(err.response?.data?.message || "Update failed");
      setShowSnackbar(true);
    }
  };

  if (!customer)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Typography variant="h6" color="blue-gray">
          Loading agent profile...
        </Typography>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-gray-50 p-8">
      {/* Logo and Header */}
      <header className="max-w-5xl mx-auto mb-6 flex items-center gap-4 select-none">
      <img
        src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"    
        alt="Vehicle Rent Management System Logo"
          className="h-20 w-auto rounded-lg shadow-md" // changed from h-14 to h-20
          draggable={false}
        />
        <Typography variant="h4" color="blue-gray" className="font-semibold">
          Vehicle Rent Management System — Profile
        </Typography>
      </header>

      {/* Profile Card */}
     <Card className="max-w-6xl mx-auto rounded-lg border border-blue-gray-100 shadow-lg bg-white">
        <CardBody className="p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-6">
              
              <Avatar
                src={
                  customer.photoUrl && customer.photoUrl.trim() !== ""
                    ? customer.photoUrl
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        customer.username
                      )}&background=random`
                }
                alt="customer-profile"
                size="lg"
                variant="rounded"
                className="shadow-md"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="font-semibold">
                  {customer.username}
                </Typography>
                
                <Typography variant="small" className="text-blue-gray-500">
                  Agent Profile
                </Typography>

                <Typography
    variant="small"
    className="text-blue-gray-600 italic text-sm mt-2"
  >
    You can view and update your profile details below. Click "Edit" to make changes.
  </Typography>
                
              </div>
              
            </div>

            <Tooltip content="Edit Profile">
              <Button
                variant="text"
                size="sm"
                color="blue-gray"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
                className="flex items-center gap-1 transition-opacity duration-300"
              >
                <PencilIcon className="h-5 w-5" />
                Edit
              </Button>
            </Tooltip>
          </div>



{/* Account Information Section */}
<Box sx={{ mb: 4 }}>
<Typography variant="h6" color="blue-gray" fontWeight="600" gutterBottom sx={{ mb: 6 }}>
  Account Information
</Typography>

  <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} > {/* add top margin here */}
          <TextField
            label="Email"
            name="email"
            value={formData.email || ""}
            fullWidth
            disabled
            size="small"           // changed from medium to small
            variant="outlined"
            sx={{ borderRadius: 1, mb: 1 }}
          />
          <FormHelperText sx={{ mt: 0.5 }}>Email is not editable.</FormHelperText>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Username"
            name="username"
            value={formData.username || ""}
            fullWidth
            disabled
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
          <FormHelperText sx={{ mt: 0.5 }}>Username is not editable.</FormHelperText>
        </Grid>


  </Grid>
  <Box borderBottom="1px solid #e0e0e0" mt={2} />
</Box>

{/* Contact Details Section */}
<Box sx={{ mb:4 }}>
  <Typography variant="h6" color="blue-gray" fontWeight="600" gutterBottom sx={{ mb: 1 }}>
    Contact Details
  </Typography>
        
      <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
  select
  label="Work Experience"
  name="workExperience"
  value={formData.workExperience || ""}
  onChange={handleInputChange}
  fullWidth
  size="small"
  disabled={!isEditing}
  variant="outlined"
  sx={{ mb: 1 }}
>
  {[...Array(10)].map((_, i) => (
    <MenuItem key={i + 1} value={i + 1}>
      {i + 1} {i === 0 ? "year" : "years"}
    </MenuItem>
  ))}
</TextField>

            <FormHelperText sx={{ mt: 0.5 }}>Enter your work experience (in years).</FormHelperText>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Branch Location"
              name="branchLocation"
              value={formData.branchLocation || ""}
              onChange={handleInputChange}
              fullWidth
              size="small"
              disabled={!isEditing}
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <FormHelperText sx={{ mt: 0.5 }}>Enter your branch location.</FormHelperText>
          </Grid>


      </Grid>
  <Box borderBottom="1px solid #e0e0e0" mt={2} />
</Box>




{isEditing && (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      mb: 1,
      mt: 2,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: "#f5f5f5",
      boxShadow: "inset 0 0 0 1px #e0e0e0",
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          checked={changePassword}
          onChange={(e) => {
            setChangePassword(e.target.checked);
            if (!e.target.checked) {
              setFormData((prev) => ({ ...prev, password: "" }));
            }
          }}
          color="primary"
        />
      }
      label={
        <Typography sx={{ fontWeight: 500, fontSize: "0.95rem", color: "#333" }}>
          Change Password
        </Typography>
      }
    />
  </Box>
)}
{isEditing && (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="h6"
      color="blue-gray"
      fontWeight="600"
      gutterBottom
      sx={{ mb: 1 }}
    >
      New Password
    </Typography>
    <Grid container spacing={3} sx={{ mt: 2 }}>
    <TextField
      label="Password"
      name="password"
      type={showPwd ? "text" : "password"}
      value={formData.password || ""}
      onChange={handleInputChange}
      fullWidth
      size="small"
      variant="outlined"
      disabled={!changePassword}
      sx={{ mb: 1 }}
      helperText={!changePassword ? "Enable to change your password" : ""}
      required={changePassword}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPwd(!showPwd)}
              edge="end"
              size="small"
            >
              {showPwd ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    </Grid>
  </Box>
)}
{isEditing && (
  <Box
    sx={{
      mt: 4,
      display: "flex",
      gap: 3,
      justifyContent: "flex-end",
    }}
  >
    <Button
      variant="gradient"
      onClick={handleUpdate}
      className="flex items-center justify-center gap-2 bg-blue-gray-800 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-gray-900 transition duration-200"
    >
      Save Changes
    </Button>
    <Button
      variant="outlined"
      onClick={() => {
        setIsEditing(false);
        setChangePassword(false);
        setFormData({
          ...customer,
          driverLicense: customer.driverLicense?.split(",") || [],
          password: "",
        });
      }}
      className="flex items-center justify-center gap-2 border-blue-gray-800 text-blue-gray-800 px-6 py-2 rounded-md shadow-sm hover:bg-blue-gray-50 transition duration-200"
    >
      Cancel
    </Button>
  </Box>
)}


        </CardBody>

        {/* Snackbar for errors */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={6000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSnackbar(false)}
            severity="error"
            sx={{ minWidth: 300, maxWidth: 400, borderRadius: 1 }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Card>
    </div>
  );
};

export default AgentView;
