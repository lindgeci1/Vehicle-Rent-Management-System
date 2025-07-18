import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { api } from "@/apiClient"; // withCredentials: true

// ✅ Exportable function for use in AuthProvider or elsewhere
export const performLogout = async (navigate) => {
  try {
    await api.post('/user/logout'); // Relies on HttpOnly cookie
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('refreshExpiresAt', { path: '/' });
    navigate('/login');
    window.location.reload();
  }
};

// ✅ Component version (e.g., when navigating to <Logout /> route)
const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    performLogout(navigate);
  }, [navigate]);

  return null;
};

export default Logout;