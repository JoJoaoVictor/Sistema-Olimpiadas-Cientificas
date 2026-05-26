// src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

// Flag global para saber se já estamos no meio de um logout
let isLoggingOut = false;

// -----------------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO (IDA)
// -----------------------------------------------------------------------------
api.interceptors.request.use(config => {
  // Se já estamos sendo deslogados, cancela instantaneamente qualquer nova requisição
  // Isso evita a "condição de corrida" onde várias requisições falham ao mesmo tempo
  if (isLoggingOut) {
    const cancelToken = axios.CancelToken.source();
    config.cancelToken = cancelToken.token;
    cancelToken.cancel("Sessão expirada, requisição cancelada.");
    return config;
  }

  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE RESPOSTA (VOLTA)
// -----------------------------------------------------------------------------
api.interceptors.response.use(
  response => response,
  async error => {
    // Ignora erros gerados pelo nosso próprio cancelamento acima
    if (axios.isCancel(error)) return Promise.reject(error);

    const originalRequest = error.config;

    // Se não for erro de autenticação, apenas segue o jogo
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Função nuclear de logout
    const killSession = () => {
      // Liga a flag para barrar qualquer outra requisição concorrente
      isLoggingOut = true; 
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      sessionStorage.clear();

      // Redireciona na hora e sai do ciclo
      if (!window.location.pathname.includes('/login')) {
         window.location.replace('/login');
      }
    };

    // Evita loop infinito: se já tentou renovar, mata a sessão
    if (originalRequest._retry) {
      killSession();
      return Promise.reject(error);
    }

    // Tenta renovar o token
    try {
      const authData = JSON.parse(localStorage.getItem('user_token') || '{}');
      const refreshToken = authData.refresh_token;
      
      if (!refreshToken || refreshToken === 'null') {
         throw new Error('Sem refresh token');
      }

      originalRequest._retry = true;
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      const newAccessToken = data.data.tokens.access_token;
      localStorage.setItem('access_token', newAccessToken);
      authData.access_token = newAccessToken;
      
      if (data.data.tokens.refresh_token) {
        authData.refresh_token = data.data.tokens.refresh_token;
      }
      localStorage.setItem('user_token', JSON.stringify(authData));

      // Atualiza o header com o novo token salvo a pátria e tenta de novo
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
      
    } catch (refreshError) {
      // Falhou na renovação (token antigo morreu de vez) -> Logout Nuclear
      killSession();
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