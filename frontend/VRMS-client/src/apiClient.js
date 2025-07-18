import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use(config => {
  const token = Cookies.get('token'); // still readable
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
   if (error.response?.status === 401) {

  try {
    const { data } = await axios.post(
      `${baseURL}/user/refresh-token`,
      {}, // ⬅ empty body
      { withCredentials: true }
    );


    Cookies.set('token', data.token, { path: '/', expires: 1 });
    error.config.headers.Authorization = `Bearer ${data.token}`;
    return api(error.config); // retry the failed request

  } catch (refreshError) {
    console.error('[apiClient] Refresh failed — redirecting to /login', refreshError);
    clearAuthCookiesAndRedirect();
    return Promise.reject(refreshError);
  }
}

    return Promise.reject(error);
  }
);

function clearAuthCookiesAndRedirect() {
  ['token', 'refreshToken', 'refreshExpiresAt'].forEach(name =>
    Cookies.remove(name, { path: '/' })
  );
  window.location.href = '/login';
}
