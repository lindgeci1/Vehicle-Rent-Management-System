import React, { useState } from 'react';
import {
  MDBContainer,
  MDBCol,
  MDBRow,
  MDBBtn,
  MDBInput,
  MDBCard,
  MDBCardBody
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from "@/apiClient";  // ← use centralized client

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
const [countdown, setCountdown] = useState(0);
  const handleSendCode = async () => {
    setIsSending(true);
    try {
      const response = await api.post('/user/send-verification-code', { email });
      const { data } = response;
      if (data.success) {
        setMessage(data.message || 'Verification code sent successfully. Please check your email.');
        setErrorMessage('');
        startCountdown(60); // Start 30-second countdown
      } else {
        setErrorMessage(data.error || data.message || 'Something went wrong');
        setMessage('');
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to send verification code'
      );
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };
const startCountdown = (duration) => {
  setCountdown(duration);
  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};

  const handleVerifyCode = async () => {
    setIsVerifying(true);
    try {
      const response = await api.post('/user/check-code', { email, code });
      const { data } = response;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // â± artificial delay
  
      if (data.success) {
        setMessage(data.message || 'Code verified. Redirecting to password reset...');
        setErrorMessage('');
        setIsVerifying(false);
        setTimeout(() => navigate('/create-password', { state: { email } }), 1000);
      } else {
        setErrorMessage(data.error || data.message || 'Invalid verification attempt');
        setMessage('');
        setIsVerifying(false);
      }
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // â± delay even on error
      setErrorMessage(error.response?.data?.error || error.response?.data?.message || 'Failed to verify code');
      setMessage('');
      setIsVerifying(false);
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
              <div className="d-flex flex-row align-items-center justify-content-center mb-4">
                <p className="text-center fw-bold mb-0 text-primary" style={{ fontSize: '1.6rem', letterSpacing: '0.5px' }}>
                  Forgot Password
                </p>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

              <MDBInput
  wrapperClass="mb-4"
  label="Email address"
  id="email"
  type="email"
  size="lg"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  readOnly={!!message}
  disabled={!!message}
/>

              <MDBBtn
  className="w-100 mb-4"
  onClick={handleSendCode}
  disabled={isSending || countdown > 0}
>
  {isSending
    ? 'Sending...'
    : countdown > 0
    ? `Resend Code (${countdown})`
    : 'Send Verification Code'}
</MDBBtn>

              {email && (
                <>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Verification Code"
                    id="code"
                    type="text"
                    size="lg"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
<MDBBtn
  className="w-100 mb-3"
  color="success"
  onClick={handleVerifyCode}
  disabled={isVerifying}
  style={isVerifying ? { color: 'white' } : {}}
>
  {isVerifying ? 'Verifying...' : 'Verify Code'}
</MDBBtn>


                </>
              )}

              <div className="text-center mt-4">
                <MDBBtn className="px-5" size="lg" color="secondary" onClick={() => navigate('/login')}>
                  Go Back
                </MDBBtn>
              </div>

            </MDBCol>
          </MDBRow>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default ForgotPassword;