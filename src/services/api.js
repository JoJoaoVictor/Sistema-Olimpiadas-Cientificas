// src/services/api.js

// Importa a biblioteca axios, responsável por realizar requisições HTTP
import axios from 'axios';

// Cria uma instância do axios para centralizar a configuração da API
const api = axios.create({
  // URL base do backend
  // Todas as requisições feitas usando "api" irão usar essa URL como base
  // Exemplo final de chamada:
  // http://localhost:8000 + /api/v1/auth/login
  baseURL: 'http://localhost:8000',

  // Tempo máximo de espera por uma resposta do servidor (em milissegundos)
  timeout: 10000,
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE REQUISIÇÃO
// -----------------------------------------------------------------------------

// Esse interceptor é executado ANTES de cada requisição HTTP
// Ele é usado para adicionar automaticamente o token JWT no header Authorization
api.interceptors.request.use(config => {
  // Recupera o token salvo no localStorage
  const token = localStorage.getItem('access_token');

  // Se o token existir, adiciona no cabeçalho da requisição
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Retorna a configuração da requisição para que ela continue
  return config;
});

// -----------------------------------------------------------------------------
// INTERCEPTOR DE RESPOSTA
// -----------------------------------------------------------------------------

// Esse interceptor é executado APÓS a resposta do servidor
// Ele trata erros globais de autenticação
api.interceptors.response.use(
  // Caso a resposta seja bem-sucedida, apenas retorna normalmente
  response => response,

  // Caso ocorra erro na resposta
  error => {
    // Verifica se o erro é de não autorizado (token inválido ou expirado)
    if (error.response?.status === 401) {
      // Remove o token salvo
      localStorage.removeItem('access_token');

      // Remove os dados do usuário
      localStorage.removeItem('user');

      // Redireciona o usuário para a tela de login
      window.location.href = '/login';
    }

    // Repassa o erro para quem chamou a requisição
    return Promise.reject(error);
  }
);

// Exporta a instância da API para ser usada nos services
export { api };

// Exportação padrão (mantida para compatibilidade com imports existentes)
export default api;
