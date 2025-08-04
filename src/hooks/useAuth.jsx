import { useContext } from "react";
import { AuthContext } from "../contexts/auth.jsx";

/**
  Hook personalizado para acessar o contexto de autenticação.

  returns {Object} Retorna o contexto de autenticação.
  throws {Error} Lança um erro se o hook for usado fora de um AuthProvider.
 */ 
const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export default useAuth;
