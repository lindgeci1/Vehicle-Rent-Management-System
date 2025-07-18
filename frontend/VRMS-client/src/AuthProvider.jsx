import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { api } from '@/apiClient';
import useMidnightVehicleSync from './useMidnightVehicleSync';
import { performLogout } from './pages/auth/Logout';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useMidnightVehicleSync();

  const clearSession = useCallback(() => {
    ['token', 'refreshToken', 'refreshExpiresAt'].forEach(name =>
      Cookies.remove(name, { path: '/' })
    );
    setIsLoggedIn(false);
    navigate('/login');
    window.location.reload();
  }, [navigate]);

const performBackendLogout = useCallback(() => {
  performLogout(navigate); // ✅ Call the centralized logout function
}, [navigate]);

  const scheduleLogoutOnRefreshExpire = useCallback(async () => {
      let refreshExpiresAt = Cookies.get('refreshExpiresAt');

      if (!refreshExpiresAt) {
        try {
          const { data } = await api.get('/user/refresh-expiration');
          refreshExpiresAt = new Date(data.refreshExpiresAt).getTime().toString();
          Cookies.set('refreshExpiresAt', refreshExpiresAt, { path: '/' }); // not HttpOnly
        } catch (error) {
          console.warn('[Auth] Failed to fetch refreshExpiresAt. Logging out.');
          performBackendLogout();
          return;
        }
      }

      const expiresAtMs = parseInt(refreshExpiresAt, 10);
      const now = Date.now();
      const timeoutDuration = expiresAtMs - now - 5000;

      const triggerLogout = () => {
        setShowPopup(true);
      setTimeout(() => {
        performBackendLogout();
      }, 2000); // ⏱ Wait 2 seconds before calling backend logout
      };

      if (timeoutDuration <= 0) {
        triggerLogout();
      } else {
        setTimeout(triggerLogout, timeoutDuration);
      }
    }, [performBackendLogout]);

  useEffect(() => {
    if (Cookies.get('token')) {
      setIsLoggedIn(true);
      scheduleLogoutOnRefreshExpire();
      if (location.pathname === '/login'||location.pathname === '/register'|| location.pathname === '/forgot-password'|| location.pathname === '/create-password') {
        navigate('/dashboard/home');
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname, navigate, scheduleLogoutOnRefreshExpire]);

  useEffect(() => {
    if (!showPopup) return;
    const timer = setTimeout(() => setShowPopup(false), 3000);
    return () => clearTimeout(timer);
  }, [showPopup]);

  return (
    <AuthContext.Provider value={{ isLoggedIn }}>
      {children}
      {showPopup && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          Session expired. Redirecting to login...
        </div>
      )}
    </AuthContext.Provider>
  );
};