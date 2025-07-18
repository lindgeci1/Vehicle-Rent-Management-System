import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn
} from 'mdb-react-ui-kit';
import { api } from "@/apiClient";  // ← use centralized client
const CreatePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  useEffect(() => {
    const { email } = location.state || {};
    if (email) {
      setEmail(email);
      fetchUserData(email);
    } else {
      setErrorMessage('Email not found. Please try again.');
    }
  }, [location]);

  const fetchUserData = async (email) => {
    try {
      const response = await api.get(`/user/email/${email}`);
      if (response.data.success) {
        const { userId, username } = response.data.data;
        setUserId(userId);
        setUsername(username);
        // setMessage('User found. You can now reset your password.');
      } else {
        setErrorMessage('User not found.');
      }
    } catch (error) {
      setErrorMessage('Error fetching user data. Please try again later.');
      console.error(error);
    }
  };
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    setIsResetting(true); // ðŸ”’ disable button immediately
  
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsResetting(false); // ðŸ”“ re-enable immediately if mismatch
      return;
    }
  
    try {
      const response = await api.put(
        `/user/update-password/${userId}`,
        { password },
        { headers: { 'Content-Type': 'application/json' } }
      );      
  
      if (response.data.success) {
        setMessage('Password changed successfully!');

        setTimeout(() => {
          setTimeout(() => navigate('/login'));
        }, 1000);
      } else {
        setErrorMessage(response.data.error || response.data.message || 'Failed to update password.');
        setIsResetting(false); 
      }
    } catch (error) {
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error resetting password. Please try again later.';
      setErrorMessage(backendError);
      console.error('Error updating password:', backendError);
      setIsResetting(false);
    }
  };  

  return (
    <MDBContainer fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <MDBCard className="shadow-lg rounded-5" style={{ maxWidth: '950px', width: '100%', padding: '20px 0' }}>
        <MDBCardBody className="p-5">
          <MDBRow>
            {/* Image Section */}
            <MDBCol md="6" className="mb-4 d-flex align-items-center justify-content-center border-end">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                className="img-fluid"
                alt="Reset"
                style={{ maxHeight: '280px' }}
              />
            </MDBCol>

            {/* Form Section */}
            <MDBCol md="6">
            <div className="d-flex flex-column align-items-center justify-content-center mb-4">
  <h3 className="text-primary fw-bold mb-3" style={{ fontSize: '1.75rem' }}>
    Reset Password
  </h3>
</div>


              {message && !errorMessage && <div className="alert alert-success">{message}</div>}
              {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

              <form onSubmit={handleChangePassword}>
                <MDBInput
                  wrapperClass="mb-4"
                  label="New Password"
                  id="password"
                  type="password"
                  size="lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <MDBInput
                  wrapperClass="mb-4"
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  size="lg"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
<MDBBtn className="w-100 mb-4" disabled={isResetting}>
  {isResetting ? 'Resetting...' : 'Reset Password'}
</MDBBtn>
              </form>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default CreatePassword;