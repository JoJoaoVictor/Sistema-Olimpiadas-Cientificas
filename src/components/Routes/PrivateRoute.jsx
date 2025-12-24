import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/authService"; // Importe seu authService

const PrivateRoute = ({ allowedRoles }) => {
  const user = authService.getUser();
  const isLogged = authService.isAuthenticated();

  // 1. Se não estiver logado, manda pro Login
  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se tem regras de perfil (allowedRoles) e o usuário não tem o perfil certo
  // Ex: A rota pede ['ADMIN'] e o user é 'STUDENT'
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/nao-autorizado" replace />; // Ou manda pro dashboard
  }

  // 3. Se passou por tudo, renderiza a página (Outlet)
  return <Outlet />;
};

export default PrivateRoute;