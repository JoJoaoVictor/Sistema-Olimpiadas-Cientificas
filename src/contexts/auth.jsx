import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { authService } from "../services/authService";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // 1. INICIALIZAÇÃO: Já começa lendo do service para evitar 'null' no F5
  const [user, setUser] = useState(authService.getUser());
  const [token, setToken] = useState(authService.getToken()); 
  const [loading, setLoading] = useState(true);

  // Validação inicial ao montar o componente
  useEffect(() => {
    const checkAuth = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      } else {
        // Se algo estiver corrompido, limpa tudo
        authService.clearAuthData();
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // --- LOGIN ---
  const login = async (email, password) => {
    const result = await authService.login(email, password);

    if (result.success) {
      // Atualiza o estado lendo o que o service acabou de salvar
      setUser(authService.getUser());
      setToken(authService.getToken()); 
      return null; // Sucesso
    }
    return result.error; // Retorna erro (string ou objeto)
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

  return (
    <AuthContext.Provider
      value={{
        signed: !!user, // Converte user para booleano (true se existir)
        user,
        token, 
        loading,
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