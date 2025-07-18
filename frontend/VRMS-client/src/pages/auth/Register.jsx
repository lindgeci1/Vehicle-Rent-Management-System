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
import { api } from "@/apiClient";  // ← use centralized client
export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
const [success, setSuccess] = useState('');
  const handleRegister = async () => {
    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/user/register', {
        username,
        email,
        password
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess('Redirecting to login...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <MDBContainer fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <MDBCard className="shadow-lg rounded-5" style={{ maxWidth: '950px', width: '100%', padding: '20px 0' }}>
        <MDBCardBody className="p-5">
          <MDBRow>
            <MDBCol md="6" className="mb-4 d-flex align-items-center justify-content-center border-end">
              <img
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                className="img-fluid"
                alt="Register"
                style={{ maxHeight: '280px' }}
              />
            </MDBCol>

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
                label="Username"
                id="name"
                type="text"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Email address"
                id="email"
                type="email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBInput
                wrapperClass="mb-4"
                label="Password"
                id="password"
                type="password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
{/* 
              <div className="d-flex justify-content-between mb-4">
                <MDBCheckbox name="flexCheck" id="flexCheckDefault" label="Remember me" />
                <a href="#!">Forgot password?</a>
              </div> */}

              {error && <div className="alert alert-danger text-center">{error}</div>}
{success && <div className="alert alert-success text-center">{success}</div>}

              <div className="text-center">
<MDBBtn className="mb-0 px-5" size="lg" onClick={handleRegister} disabled={isRegistering}>
  {isRegistering ? 'Registering...' : 'Register'}
</MDBBtn>
                <p className="small fw-bold mt-2 pt-1 mb-2">
                  Already have an account? <Link to="/login" className="link-primary">Login</Link>
                </p>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default Register;
