// src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO
// -----------------------------------------------------------------------------
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE RESPOSTA
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Se não for 401, rejeita normalmente
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Evita loop: se já tentou renovar, faz logout
    if (originalRequest._retry) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Tenta renovar o token
    try {
      const authData = JSON.parse(localStorage.getItem('user_token') || '{}');
      const refreshToken = authData.refresh_token;
      if (!refreshToken) throw new Error('Sem refresh token');

      originalRequest._retry = true;
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      const newAccessToken = data.data.tokens.access_token;
      localStorage.setItem('access_token', newAccessToken);
      authData.access_token = newAccessToken;
      // Se o backend retornar novo refresh token, atualiza também
      if (data.data.tokens.refresh_token) {
        authData.refresh_token = data.data.tokens.refresh_token;
      }
      localStorage.setItem('user_token', JSON.stringify(authData));

      // Atualiza o cabeçalho e repete a requisição original
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Se a renovação falhar, aí sim desloga
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_token');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// -----------------------------------------------------------------------------
// SINCRONIZAÇÃO ENTRE ABAS
// -----------------------------------------------------------------------------
window.addEventListener('storage', (event) => {
  if (event.key === 'access_token' && !event.newValue) {
    // Outra aba fez logout
    window.location.href = '/login';
  }
});

// -----------------------------------------------------------------------------
// SERVIÇOS ESPECÍFICOS (PROVAS)
// -----------------------------------------------------------------------------
export const examService = {
  list: (params = {}) => api.get('/api/v1/exams', { params }),
  getById: (id) => api.get(`/api/v1/exams/${id}`),
  create: (data) => api.post('/api/v1/exams', data),
  update: (id, data) => api.patch(`/api/v1/exams/${id}`, data),
  updateQuestions: (id, question_ids) =>
    api.patch(`/api/v1/exams/${id}/questions`, { question_ids }),
  generatePDF: (payload, blobResponse = true) =>
    api.post('/api/v1/exams/generate_pdf', payload, {
      responseType: blobResponse ? 'blob' : 'json',
    }),
};

export default api;