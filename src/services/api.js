// src/services/api.js

// Importa a biblioteca axios, responsável por realizar requisições HTTP
import axios from 'axios';

// Cria uma instância do axios para centralizar a configuração da API
const api = axios.create({
  // URL base do backend
  baseURL: 'http://localhost:8000',
  // Tempo máximo de espera por uma resposta do servidor (em milissegundos)
  timeout: 30000,
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO
// -----------------------------------------------------------------------------

api.interceptors.request.use(config => {
  // Recupera o token salvo no localStorage
  const token = localStorage.getItem('access_token');

  // Se o token existir, adiciona no cabeçalho da requisição
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
  error => {
    // Verifica se o erro é de não autorizado (token inválido ou expirado)
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// SERVIÇOS ESPECÍFICOS (PROVAS)
// -----------------------------------------------------------------------------

export const examService = {
  /**
   * Lista provas com filtros (paginação, busca, etc.)
   * @param {Object} params - Parâmetros de consulta (page, per_page, search, etc.)
   */
  list: (params = {}) => api.get('/api/v1/exams', { params }),

  /**
   * Busca uma prova por ID
   * @param {number} id
   */
  getById: (id) => api.get(`/api/v1/exams/${id}`),

  /**
   * Cria uma nova prova
   * @param {Object} data - { name, fase, anos, status, question_ids }
   */
  create: (data) => api.post('/api/v1/exams', data),

  /**
   * Atualiza os metadados de uma prova (nome, fase, anos, status)
   * @param {number} id
   * @param {Object} data
   */
  update: (id, data) => api.patch(`/api/v1/exams/${id}`, data),

  /**
   * Atualiza a lista de questões de uma prova
   * @param {number} id
   * @param {Array<number>} question_ids
   */
  updateQuestions: (id, question_ids) =>
    api.patch(`/api/v1/exams/${id}/questions`, { question_ids }),

  /**
   * Gera PDF de uma prova on-the-fly
   * @param {Object} payload - { name, fase, anos, questions }
   * @param {boolean} blobResponse - Se true, retorna blob (para download)
   */
  generatePDF: (payload, blobResponse = true) =>
    api.post('/api/v1/exams/generate_pdf', payload, {
      responseType: blobResponse ? 'blob' : 'json',
    }),
};

// -----------------------------------------------------------------------------
// EXPORTAÇÃO PADRÃO
// -----------------------------------------------------------------------------

export default api;