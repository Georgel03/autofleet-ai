import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // URL-ul de baza al backend-ului 
});

// Interceptor pentru a adauga automat token-ul la fiecare request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;