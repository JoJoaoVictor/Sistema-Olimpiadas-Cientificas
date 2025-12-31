// src/services/userService.js

// URL base apontando para a versão 1 da API
const API_URL = 'http://localhost:8000/api/v1'; 

export const userService = {
  
  // =========================================================================
  // ÁREA ADMINISTRATIVA (Gerenciamento de outros usuários)
  // =========================================================================

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
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Erro na requisição:", response.status, response.statusText);
        return [];
      }

      const responseData = await response.json();
      
      // O backend retorna: { success: true, data: { users: [...] } }
      if (responseData.success && responseData.data && responseData.data.users) {
        return responseData.data.users;
      }
      
      return [];
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
      
      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return false;
    }
  },

  /**
   * Atualiza o cargo (Role) de um usuário específico (Admin -> Outros).
   * Rota Backend: PUT /api/v1/users/{id}/role
   */
  updateUserRole: async (id, newRole, token) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
  },

  // =========================================================================
  // ÁREA DO USUÁRIO (Perfil e Senha)
  // =========================================================================

  /**
   * Busca os dados atualizados do usuário logado.
   * Rota Backend: GET /api/v1/users/me
   * Útil para atualizar o estado da aplicação sem precisar relogar.
   */
  getMe: async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return null;

      const responseData = await response.json();
      // O backend retorna: { success: true, data: { ...user_data } }
      if (responseData.success && responseData.data) {
        return responseData.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      return null;
    }
  },

  /**
   * Atualiza dados do próprio perfil (Nome e Foto).
   * Rota Backend: PUT /api/v1/users/me
   */
  updateProfile: async (data, token) => {
    // data deve ser um objeto: { name: "Novo Nome", avatar_url: "http://..." }
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil");
      }

      const responseData = await response.json();
      // Retorna os dados do usuário atualizados
      return responseData.data || null; 
    } catch (error) {
      console.error("Erro na atualização de perfil:", error);
      return null;
    }
  },

  /**
   * Altera a senha do usuário logado.
   * Rota Backend: POST /api/v1/users/change-password
   */
  changePassword: async (data, token) => {
    // data deve ser: { current_password: "...", new_password: "..." }
    try {
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        // Lança o erro específico retornado pelo backend (ex: "Senha atual incorreta")
        throw new Error(result.detail || "Erro ao alterar senha");
      }

      return result; // { success: true, message: "..." }
    } catch (error) {
      // Repassa o erro para ser tratado no componente (exibir alerta vermelho)
      throw error;
    }
  }
};