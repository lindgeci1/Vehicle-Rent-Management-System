import React, { useState } from 'react';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox,
  MDBCard,
  MDBCardBody
} from 'mdb-react-ui-kit';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'; // ✅ Import js-cookie
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

const handleLogin = async () => {
  setError('');
  setIsLoggingIn(true);

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/user/login`,
      { email, password },
      { withCredentials: true } // ⬅️ Important to allow HttpOnly cookie to be set
    );

    const { token, refreshTokenExpiryTime } = response.data;

    if (token) {
      Cookies.set('token', token); // Only store the access token
       Cookies.set('refreshExpiresAt', new Date(refreshTokenExpiryTime).getTime());
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard/profile');
      window.location.reload();
    } else {
      setError('Login failed: Token not returned');
    }
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || 'Login failed');
  } finally {
    setIsLoggingIn(false);
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
                alt="Login"
                style={{ maxHeight: '280px' }}
              />
            </MDBCol>

            {/* Form Section */}
            <MDBCol md="6">
              <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                <p
                  className="text-center fw-bold mb-0 text-primary"
                  style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}
                >
                  Vehicle Rent Management System
                </p>
              </div>

              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="form1"
                type="email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="form2"
                type="password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

            <div className="d-flex justify-content-between mb-4">
              {/* <MDBCheckbox name="flexCheck" id="flexCheckDefault" label="Remember me" /> */}
              <Link to="/forgot-password" className="text-decoration-none text-primary">
                Forgot password
              </Link>
            </div>



              {error && <div className="alert alert-danger text-center mb-3">{error}</div>}


              <div className="text-center">
                <MDBBtn className="mb-0 px-5" size="lg" onClick={handleLogin} disabled={isLoggingIn}>
                  {isLoggingIn ? 'Logging in...' : 'Login'}
                </MDBBtn>
                <p className="small fw-bold mt-2 pt-1 mb-2">
                  Don't have an account? <Link to="/register" className="link-danger">Register</Link>
                </p>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default Login;
