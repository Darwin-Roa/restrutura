import axios from 'axios';

let apiUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Evitar la pantalla de advertencia de Microsoft Dev Tunnels
    config.headers['X-Tunnel-Skip-AntiPhishing-Page'] = 'true';
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
