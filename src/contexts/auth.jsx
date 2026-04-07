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

  // ── ALTERAÇÃO 5 ────────────────────────────────────────────────────────────
  // Antes: o contexto expunha apenas { signed, user, token, loading, ... }
  // Agora: expõe também role, userId e hasRole() de forma centralizada.
  //
  // Impacto: todos os componentes que antes liam localStorage diretamente
  // (Projetos.jsx, ProjectForme.jsx, AdminUsers.jsx) podem trocar isso por
  // useContext(AuthContext) e obter role/userId de forma segura e reativa.
  // Quando o usuário troca de conta (logout + login), o estado é atualizado
  // automaticamente em todos os componentes que consomem o contexto — resolvendo
  // o bug onde campos como "nome do professor" sumiam após troca de conta porque
  // os componentes ainda liam o localStorage desatualizado.
  const role   = user?.role   || null;
  const userId = user?.id     || null;

  /**
   * Verifica se o usuário atual possui um dos papéis informados.
   * Uso: hasRole(['ADMIN', 'REVISOR'])
   */
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
  // ── ALTERAÇÃO 6 ────────────────────────────────────────────────────────────
  // Antes: signout limpava user e token mas não resetava role/userId (porque não
  // existiam no contexto). Componentes que liam localStorage continuavam com
  // dados da sessão anterior após logout.
  // Agora: role e userId derivam de user — quando user vira null no logout,
  // role e userId automaticamente viram null também. Zero estado fantasma.
  const signout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signed:  !!user,
        user,
        token,
        loading,
        // Novos campos expostos
        role,
        userId,
        hasRole,
        // Ações
        login,
        registro,
        signout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};