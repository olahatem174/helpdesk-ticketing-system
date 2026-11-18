import axios from 'axios';
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
    localStorage.removeItem('hd_token');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});
export default api;
