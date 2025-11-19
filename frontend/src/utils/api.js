import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username) => api.post('/api/auth/login', { username }),
  getProfile: () => api.get('/api/auth/profile'),
};

export const gameAPI = {
  placeBet: (betData) => api.post('/api/game/roll', betData),
  getBetHistory: (params) => api.get('/api/game/history', { params }),
  verifyBet: (params) => api.get('/api/game/verify', { params }),
  getConfig: () => api.get('/api/game/config'),
};

export const seedAPI = {
  getSeedHash: () => api.get('/api/seeds/hash'),
  resetServerSeed: () => api.post('/api/seeds/reset'),
  updateClientSeed: (clientSeed) => api.post('/api/seeds/client', { clientSeed }),
  getSeedHistory: (limit = 10) => api.get(`/api/seeds/history?limit=${limit}`),
  unhashServerSeed: (serverSeedHash) => api.post('/api/seeds/unhash', { serverSeedHash }),
};

export default api;