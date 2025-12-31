/**
 * Serviço de Autenticação (Frontend)
 * Arquivo: src/services/authService.js
 * * Responsável por:
 * 1. Comunicar com a API (Login, Registro, Logout, Senhas)
 * 2. Gerenciar Tokens (Salvar no LocalStorage)
 * 3. Tratar erros de forma segura para não quebrar o React
 */

import api from "./api";

const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png";

export const authService = {
  
  /**
   * ==========================
   * 1. LOGIN & REGISTRO
   * ==========================
   */

  // Login tradicional (Email/Senha)
  async login(email, password) {
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { data } = response;

      if (data.success && data.data.tokens) {
        this.setAuthData(data.data);
      }

      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error), // Usa o tratador seguro
      };
    }
  },

  // Registro de novos usuários
  async register({ name, email, password, role }) {
    if (!name || !email || !password) {
      return { success: false, error: "Preencha todos os campos obrigatórios." };
    }

    try {
      const response = await api.post("/api/v1/auth/register", {
        name,
        email,
        password,
        role: role || "STUDENT",
      });

      const { data } = response;

      if (data.success && data.data.tokens) {
        this.setAuthData(data.data);
      }

      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error), // Usa o tratador seguro
      };
    }
  },

  // Login Social (Google)
  async loginWithGoogle(credential) {
    try {
      const response = await api.post("/api/v1/auth/google", {
        credential,
      });

      const { data } = response;

      if (data.success && data.data.tokens) {
        this.setAuthData(data.data);
      }

      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: "Falha ao autenticar com Google. Tente novamente.",
      };
    }
  },

  /**
   * ==========================
   * 2. RECUPERAÇÃO DE SENHA
   * ==========================
   */

  // Passo 1: Enviar email com link
  async forgotPassword(email) {
    try {
      const response = await api.post("/api/v1/auth/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error),
      };
    }
  },

  // Passo 2: Definir nova senha usando o token
  async resetPassword(token, newPassword) {
    try {
      // ATENÇÃO: Enviamos 'new_password' para bater com o Schema do Backend
      const response = await api.post("/api/v1/auth/reset-password", {
        token: token,
        new_password: newPassword, 
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: this._handleError(error),
      };
    }
  },

  /**
   * ==========================
   * 3. GESTÃO DE SESSÃO
   * ==========================
   */

  async logout() {
    try {
      // Opcional: Avisar o backend para invalidar token (blacklist)
      await api.post("/api/v1/auth/logout");
    } catch (err) {
      // Ignora erro de rede no logout, apenas limpa localmente
    } finally {
      this.clearAuthData();
    }
  },

  // Busca dados atualizados do usuário (útil após editar perfil)
  async getCurrentUser() {
    try {
      const response = await api.get("/api/v1/auth/me"); // ou /users/me dependendo da sua rota
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  async refreshToken() {
    const authData = this.getAuthData();
    if (!authData?.refresh_token) throw new Error("Sem refresh token");

    const response = await api.post("/api/v1/auth/refresh-token", {
      refresh_token: authData.refresh_token,
    });

    // Atualiza os tokens mantendo o usuário atual
    authData.access_token = response.data.data.access_token;
    // Se o back retornar novo refresh token, atualiza. Se não, mantem o velho.
    if (response.data.data.refresh_token) {
        authData.refresh_token = response.data.data.refresh_token;
    }

    // Salva novamente
    this.setAuthData({ user: authData.user, tokens: authData });

    return authData.access_token;
  },

  /**
   * ==========================
   * 4. LOCAL STORAGE (Persistência)
   * ==========================
   */

  setAuthData(data) {
    // Normalização de dados (avatar vs picture)
    const user = {
      ...data.user,
      picture: data.user.avatar_url || data.user.picture || DEFAULT_AVATAR,
    };

    const authPayload = {
      access_token: data.tokens ? data.tokens.access_token : data.access_token,
      refresh_token: data.tokens ? data.tokens.refresh_token : data.refresh_token,
      user,
    };

    localStorage.setItem("user_token", JSON.stringify(authPayload));
    localStorage.setItem("access_token", authPayload.access_token);
  },

  clearAuthData() {
    localStorage.removeItem("user_token");
    localStorage.removeItem("access_token");
  },

  getAuthData() {
    const data = localStorage.getItem("user_token");
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getUser() {
    return this.getAuthData()?.user || null;
  },

  getToken() {
    return this.getAuthData()?.access_token || null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * ==========================
   * 5. PERMISSÕES (ROLES)
   * ==========================
   */
  hasRole(role) {
    return this.getUser()?.role === role;
  },

  isAdmin() { return this.hasRole("ADMIN"); },
  isProfessor() { return this.hasRole("PROFESSOR"); },
  isRevisor() { return this.hasRole("REVISOR"); },
  isEstudante() { return this.hasRole("STUDENT"); },

  /**
   * ==========================
   * 6. UTILITÁRIOS (PRIVADO)
   * ==========================
   */
  
  /**
   * Trata erros do Axios/FastAPI de forma segura.
   * Evita o erro "Objects are not valid as a React child".
   * Transforma Arrays e Objetos em String simples.
   */
  _handleError(error) {
    let errorMessage = "Ocorreu um erro inesperado.";

    if (error.response && error.response.data) {
        const detail = error.response.data.detail;

        if (typeof detail === "string") {
            // Caso simples: "Senha incorreta"
            errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
            // Caso Pydantic (Erro 422): [{ loc:.., msg: "Campo obrigatório" }]
            // Pega a mensagem do primeiro erro
            errorMessage = detail[0].msg || "Dados inválidos enviadas.";
        } else if (typeof detail === "object") {
             // Caso objeto genérico
             errorMessage = JSON.stringify(detail);
        }
    } else if (error.message) {
        // Erro de rede ou timeout
        errorMessage = error.message;
    }

    return errorMessage;
  }
};