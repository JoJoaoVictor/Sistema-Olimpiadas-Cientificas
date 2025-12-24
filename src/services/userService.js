// src/services/userService.js

// 1. Ajuste da URL base para apontar para a versão 1 da API
const API_URL = 'http://localhost:8000/api/v1'; 

export const userService = {
  
  /**
   * Busca todos os usuários cadastrados.
   * Rota Backend: GET /api/v1/users
   */
  getAllUsers: async (token) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // O token é obrigatório para Admin
        }
      });

      // Se o token expirou ou não for admin, retorna array vazio
      if (!response.ok) {
        console.error("Erro na requisição:", response.status, response.statusText);
        return [];
      }

      const responseData = await response.json();
      
      // 2. Ajuste para a nova estrutura de resposta do Backend
      // O backend retorna: { success: true, data: { users: [...] } }
      if (responseData.success && responseData.data && responseData.data.users) {
        return responseData.data.users;
      }
      
      return []; // Retorna lista vazia se a estrutura não for a esperada
    } catch (error) {
      console.error("Erro de conexão ao buscar usuários:", error);
      return [];
    }
  },

  /**
   * Remove um usuário pelo ID (Soft Delete).
   * Rota Backend: DELETE /api/v1/users/{id}
   */
  deleteUser: async (id, token) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Retorna true se status for 200-299
      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return false;
    }
  },

  /**
   * Atualiza o cargo (Role) de um usuário específico.
   * Rota Backend: PUT /api/v1/users/{id}/role
   */
  updateUserRole: async (id, newRole, token) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT', // O backend espera PUT nesta rota específica
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Envia o JSON no formato esperado pelo schema UserRoleUpdate
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao atualizar cargo:", errorData.detail);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro de conexão ao atualizar cargo:", error);
      return false;
    }
  }
};