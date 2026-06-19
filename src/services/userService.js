// src/services/userService.js
import api from './api';

export const userService = {
  // =========================================================================
  // ÁREA ADMINISTRATIVA (Gerenciamento de outros usuários)
  // =========================================================================

  /**
   * Busca todos os usuários cadastrados.
   * Rota Backend: GET /api/v1/users
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/users', { params });
      
      // O backend retorna: { success: true, data: { users: [...] } }
      if (response.data.success && response.data.data && response.data.data.users) {
        return response.data.data.users;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  /**
   * Remove um usuário pelo ID (Hard Delete).
   * Rota Backend: DELETE /api/v1/users/{id}
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/v1/users/${id}`);
      return response.data.success || false;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  },

  /**
   * Atualiza o cargo (Role) de um usuário específico (Admin -> Outros).
   * Rota Backend: PUT /api/v1/users/{id}/role
   */
  updateUserRole: async (id, newRole) => {
    try {
      const response = await api.put(`/api/v1/users/${id}/role`, { role: newRole });
      return response.data.success || false;
    } catch (error) {
      console.error('Erro ao atualizar cargo:', error);
      return false;
    }
  },

  /**
   * Cria um novo usuário (Admin).
   * Rota Backend: POST /api/v1/users
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/v1/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas gerais do sistema (Admin).
   * Rota Backend: GET /api/v1/users/stats/summary
   */
  getStatsSummary: async () => {
    try {
      const response = await api.get('/api/v1/users/stats/summary');
      if (response.data.success && response.data.data) {
        return response.data.data.stats;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  },

  /**
   * Obtém estatísticas de um usuário específico (Admin).
   * Rota Backend: GET /api/v1/users/{userId}/stats
   */
  getUserStats: async (userId) => {
    try {
      const response = await api.get(`/api/v1/users/${userId}/stats`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do usuário:', error);
      return null;
    }
  },

  // =========================================================================
  // ÁREA DO USUÁRIO (Perfil e Senha)
  // =========================================================================

  /**
   * Busca os dados atualizados do usuário logado.
   * Rota Backend: GET /api/v1/users/me
   */
  getMe: async () => {
    try {
      const response = await api.get('/api/v1/users/me');
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      return null;
    }
  },

  /**
   * Atualiza dados do próprio perfil (Nome e Foto).
   * Rota Backend: PUT /api/v1/users/me
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/api/v1/users/me', data);
      return response.data.data || null;
    } catch (error) {
      console.error('Erro na atualização de perfil:', error);
      return null;
    }
  },

  /**
   * Altera a senha do usuário logado.
   * Rota Backend: POST /api/v1/users/change-password
   */
  changePassword: async (data) => {
    try {
      const response = await api.post('/api/v1/users/change-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Aceita os termos de uso (LGPD).
   * Rota Backend: POST /api/v1/users/accept-terms
   */
  acceptTerms: async () => {
    try {
      const response = await api.post('/api/v1/users/accept-terms');
      return response.data.success || false;
    } catch (error) {
      console.error('Erro ao aceitar termos:', error);
      return false;
    }
  },
};