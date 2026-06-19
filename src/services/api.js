import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
});

// ------------------------------------------------------------------
// Gerenciamento de refresh (evita múltiplos refreshes concorrentes)
// ------------------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO
// ------------------------------------------------------------------
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ------------------------------------------------------------------
// INTERCEPTOR DE RESPOSTA
// ------------------------------------------------------------------
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Só trata 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Se já tentou refresh e falhou de novo, força logout
    if (originalRequest._retry) {
      return forceLogout();
    }

    // Se já existe um refresh em andamento, enfileira esta requisição
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    // Inicia o refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const authData = JSON.parse(localStorage.getItem('user_token') || '{}');
      const refreshToken = authData.refresh_token;

      if (!refreshToken) throw new Error('Sem refresh token');

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh-token`,
        { refresh_token: refreshToken }
      );

      const newAccessToken = data.data.tokens.access_token;
      const newRefreshToken = data.data.tokens.refresh_token;

      // Atualiza localStorage
      localStorage.setItem('access_token', newAccessToken);
      const storedData = JSON.parse(localStorage.getItem('user_token') || '{}');
      storedData.access_token = newAccessToken;
      if (newRefreshToken) storedData.refresh_token = newRefreshToken;
      localStorage.setItem('user_token', JSON.stringify(storedData));

      // Liberta a fila com o novo token
      processQueue(null, newAccessToken);

      // Repete a requisição original
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh falhou → força logout preservando rascunhos
      processQueue(refreshError, null);
      return forceLogout();
    } finally {
      isRefreshing = false;
    }
  }
);

// ------------------------------------------------------------------
// Função de logout forçado (preserva rascunhos)
// ------------------------------------------------------------------
function forceLogout() {
  // Dispara evento para que os formulários salvem dados
  window.dispatchEvent(new CustomEvent('session-expired'));

  // Remove APENAS as chaves de autenticação (preserva outras)
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
  // NÃO limpa sessionStorage, pois contém rascunhos

  if (!window.location.pathname.includes('/login')) {
    window.location.replace('/login');
  }
  return Promise.reject(new Error('Sessão expirada'));
}

// ------------------------------------------------------------------
// SINCRONIZAÇÃO ENTRE ABAS (mantida)
// ------------------------------------------------------------------
window.addEventListener('storage', (event) => {
  if (event.key === 'access_token' && !event.newValue) {
    window.location.href = '/login';
  }
});

// ------------------------------------------------------------------
// SERVIÇOS ESPECÍFICOS (mantidos)
// ------------------------------------------------------------------
export const examService = {
  list: (params = {}) => api.get('/api/v1/exams', { params }),
  getById: id => api.get(`/api/v1/exams/${id}`),
  create: data => api.post('/api/v1/exams', data),
  update: (id, data) => api.patch(`/api/v1/exams/${id}`, data),
  updateQuestions: (id, question_ids) =>
    api.patch(`/api/v1/exams/${id}/questions`, { question_ids }),
  generatePDF: (payload, blobResponse = true) =>
    api.post('/api/v1/exams/generate_pdf', payload, {
      responseType: blobResponse ? 'blob' : 'json',
    }),
};

export default api;