/**
 * Serviço de Autenticação
 * Compatível com FastAPI + JWT + Refresh Token
 * Atualizado para tratar erros de validação (Pydantic/422)
 * Inclui: Login, Registro, Google, Logout, Refresh e Recuperação de Senha
 */

import api from "./api";

const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png";

export const authService = {
  /**
   * ==========================
   * LOGIN EMAIL + SENHA
   * ==========================
   */
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
      // Tratamento básico para login
      return {
        success: false,
        error: error.response?.data?.detail || "Erro ao fazer login",
      };
    }
  },

  /**
   * ==========================
   * REGISTRO (CORRIGIDO PARA O ERRO 422)
   * ==========================
   */
  async register({ name, email, password, role }) {
    // 1. Validação básica antes de enviar
    if (!name || !email || !password) {
      return { success: false, error: "Preencha todos os campos" };
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
      console.error("Erro no registro:", error);

      // --- CORREÇÃO DO ERRO 'REACT CHILD' ---
      // Aqui transformamos qualquer resposta do backend em uma STRING simples.
      let errorMessage = "Erro ao cadastrar usuário";

      if (error.response && error.response.data && error.response.data.detail) {
        const detail = error.response.data.detail;

        if (typeof detail === "string") {
          // Caso 1: Backend retornou texto simples (Ex: "Email já existe")
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          // Caso 2: Backend retornou Lista de Erros do Pydantic (Ex: Senha fraca)
          // Pegamos a mensagem do primeiro erro da lista
          errorMessage = detail[0].msg || "Dados inválidos";
        }
      }

      return {
        success: false,
        error: errorMessage, // Agora garantimos que isso é texto, não objeto
      };
    }
  },

  /**
   * ==========================
   * LOGIN COM GOOGLE
   * ==========================
   */
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
      console.error(error);
      return {
        success: false,
        error: "Falha ao autenticar com Google",
      };
    }
  },

  /**
   * ==========================
   * RECUPERAÇÃO DE SENHA (NOVO)
   * ==========================
   */
  // 1. Solicitar o link por email
  async forgotPassword(email) {
    try {
      const response = await api.post("/api/v1/auth/forgot-password", { email });
      // O backend retorna { message: "..." }
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Erro ao solicitar recuperação.",
      };
    }
  },

  // 2. Redefinir a senha com o token
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post("/api/v1/auth/reset-password", {
        token,
        new_password: newPassword, // Backend espera snake_case
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || "Erro ao redefinir senha.",
      };
    }
  },

  /**
   * ==========================
   * LOGOUT
   * ==========================
   */
  async logout() {
    try {
      // Tenta avisar o backend para invalidar token (opcional dependendo da API)
      await api.post("/api/v1/auth/logout");
    } catch {
      // Ignora erro de rede no logout
    } finally {
      // Sempre limpa o navegador
      this.clearAuthData();
    }
  },

  /**
   * ==========================
   * PERFIL
   * ==========================
   */
  async getCurrentUser() {
    try {
      const response = await api.get("/api/v1/auth/profile");
      return response.data.data.user;
    } catch (error) {
      return null;
    }
  },

  /**
   * ==========================
   * REFRESH TOKEN
   * ==========================
   */
  async refreshToken() {
    const authData = this.getAuthData();
    if (!authData?.refresh_token) throw new Error("Sem refresh token");

    const response = await api.post("/api/v1/auth/refresh-token", {
      refresh_token: authData.refresh_token,
    });

    // Atualiza os tokens na memória e no storage
    authData.access_token = response.data.data.tokens.access_token;
    authData.refresh_token = response.data.data.tokens.refresh_token;

    this.setAuthData({ user: authData.user, tokens: authData });

    return authData.access_token;
  },

  /**
   * ==========================
   * STORAGE (Salvar no Navegador)
   * ==========================
   */
  setAuthData(data) {
    // Garante que picture tenha um valor padrão se vier null do back
    const user = {
      ...data.user,
      picture: data.user.avatar_url || data.user.picture || DEFAULT_AVATAR,
    };

    // Estrutura que será salva
    const authPayload = {
      access_token: data.tokens.access_token,
      refresh_token: data.tokens.refresh_token,
      user,
    };

    // Salva o objeto JSON completo
    localStorage.setItem("user_token", JSON.stringify(authPayload));

    // Salva o token avulso (útil para interceptors simples)
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
   * ROLES (Permissões)
   * ==========================
   */
  hasRole(role) {
    return this.getUser()?.role === role;
  },

  isAdmin() {
    return this.hasRole("ADMIN");
  },

  isProfessor() {
    return this.hasRole("PROFESSOR");
  },

  isRevisor() {
    return this.hasRole("REVISOR");
  },

  isEstudante() {
    return this.hasRole("STUDENT");
  },
};