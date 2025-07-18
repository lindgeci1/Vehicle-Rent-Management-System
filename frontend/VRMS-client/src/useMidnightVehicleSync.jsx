import { useEffect } from 'react';
import Axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { api } from "@/apiClient";  // ← use centralized client

const useMidnightVehicleSync = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutAndRedirect = () => {
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      console.error('[Auth] ❌ Token expired or unauthorized. Logging out.');
      navigate('/login');
      window.location.reload();
    };

    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setDate(now.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          const token = Cookies.get('token');
          const res = await api.post('/vehicles/update-today-availability', {});
          console.log(`[DateSync] ✅ Synced vehicle availability at ${new Date().toLocaleTimeString()}`);
          console.log(`[DateSync] 🚗 Vehicles updated: ${res.data}`);
        } catch (err) {
          console.error('[DateSync] ❌ Sync error:', err);

          // 🔐 Handle token expiration or unauthorized
          if (err.response?.status === 401 || err.response?.data?.message?.includes('token')) {
            logoutAndRedirect();
          } else if (err.response?.data?.message) {
            console.error('[DateSync] ❌ Backend message:', err.response.data.message);
          }
        }

        // 🔁 Schedule again for next midnight
        scheduleMidnightUpdate();
      }, msUntilMidnight);
    };

    scheduleMidnightUpdate();
  }, [navigate]);
};

export default useMidnightVehicleSync;
