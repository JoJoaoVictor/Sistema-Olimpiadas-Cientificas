import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { authService } from "../services/authService";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(authService.getUser());
  const [token,   setToken]   = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const storedToken = authService.getToken();
      const storedUser  = authService.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        authService.clearAuthData();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const role   = user?.role   || null;
  const userId = user?.id     || null;

  const hasRole = (roles = []) => {
    if (!role) return false;
    return roles.map(r => r.toUpperCase()).includes(role.toUpperCase());
  };

  // --- LOGIN ---
  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success) {
      const newUser = authService.getUser();
      setUser(newUser);
      setToken(authService.getToken());
      return null;
    }
    return result.error;
  };

  // --- REGISTRO ---
  const registro = async (data) => {
    const result = await authService.register(data);
    if (result.success) {
      setUser(authService.getUser());
      setToken(authService.getToken());
      return null;
    }
    return result.error;
  };

  // --- LOGOUT ---
  const signout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // FUNÇÃO — atualiza o usuário sem recarregar a página (Ajustada)
  // ═══════════════════════════════════════════════════════════════
  const updateUser = (userData) => {
    setUser(prev => {
      if (!prev) return null;
      
      const updated = {
        ...prev,
        ...userData,
        // Mantém a clonagem do perfil se enviado, senão preserva o anterior intacto
        profile: userData.profile
          ? { ...prev.profile, ...userData.profile }
          : prev.profile,
      };

      // Sincroniza e persiste a informação no local storage baseado na estrutura do seu authService
      try {
        const authData = authService.getAuthData();
        if (authData) {
          authData.user = updated;
          localStorage.setItem('user_token', JSON.stringify(authData));
        }
      } catch (err) {
        console.error("Erro ao sincronizar dados de atualização no localStorage:", err);
      }
      
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        signed:  !!user,
        user,
        token,
        loading,
        role,
        userId,
        hasRole,
        login,
        registro,
        signout,
        updateUser,         
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};