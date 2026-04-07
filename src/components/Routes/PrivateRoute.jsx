// src/components/Routes/PrivateRoute.jsx
//
// ── ALTERAÇÃO 8 ────────────────────────────────────────────────────────────
// Antes: PrivateRoute lia authService.getUser() diretamente — fora do ciclo
// reativo do React. Isso significa que após troca de conta, o PrivateRoute
// poderia liberar rotas com o role da sessão anterior porque o localStorage
// ainda não havia sido limpo no momento certo.
//
// Agora: lê user e role do AuthContext, que é atualizado reativamente no
// login/logout. A verificação de allowedRoles também passa a comparar com
// o role em uppercase para evitar bugs de case (ex: "Admin" vs "ADMIN").
//
// Impacto: ao fazer logout + login com outro perfil, o PrivateRoute
// imediatamente enxerga o novo role e redireciona corretamente para
// /nao-autorizado se o novo usuário não tiver permissão para a rota atual.

import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";

const PrivateRoute = ({ allowedRoles }) => {
  const { signed, role, loading } = useContext(AuthContext);

  // Aguarda o contexto terminar de hidratar antes de decidir o redirect.
  // Sem isso, no F5 o contexto começa com loading=true e signed=false,
  // e o usuário seria jogado para /login mesmo estando autenticado.
  if (loading) return null;

  // 1. Não autenticado → login
  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  // 2. Autenticado mas sem o role exigido → tela de não autorizado
  if (allowedRoles && !allowedRoles.includes(role?.toUpperCase())) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  // 3. Passou por tudo → renderiza a rota
  return <Outlet />;
};

export default PrivateRoute;