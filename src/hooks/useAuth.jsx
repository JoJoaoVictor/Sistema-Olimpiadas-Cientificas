import { useContext } from "react";
// CORREÇÃO: O caminho deve apontar para a pasta 'context' e o arquivo 'auth'
import { AuthContext } from "../contexts/auth.jsx"; 

const useAuth = () => {
  const context = useContext(AuthContext);

  // Verificação de segurança (Boa prática)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};

export default useAuth;