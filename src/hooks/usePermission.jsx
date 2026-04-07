// src/hooks/usePermission.jsx
//
// ── ALTERAÇÃO 7 ────────────────────────────────────────────────────────────
// Arquivo NOVO. Centraliza toda a lógica de verificação de permissão que antes
// estava duplicada em cada componente como useEffect + localStorage.getItem.
//
// Antes (em Projetos.jsx, ProjectForme.jsx, AdminUsers.jsx):
//   useEffect(() => {
//     const data = JSON.parse(localStorage.getItem("user_token"));
//     setIsRevisor(['Revisor','admin'].includes(data?.user?.role));
//   }, []);
//
// Agora (em qualquer componente):
//   const { isRevisor, isAdmin, userId } = usePermission();
//
// Impacto: ao trocar de conta, o AuthContext é atualizado e todos os
// componentes que usam usePermission() recebem o novo role imediatamente,
// sem precisar de reload ou re-leitura do localStorage. Isso resolve o bug
// de campos sumindo/persistindo da sessão anterior.

import { useContext } from "react";
import { AuthContext } from "../contexts/auth";

export function usePermission() {
  const { user, role, userId, hasRole } = useContext(AuthContext);

  return {
    // Flags booleanas por papel — use diretamente nos componentes
    isAdmin:     hasRole(["ADMIN"]),
    isRevisor:   hasRole(["REVISOR", "ADMIN"]),
    isProfessor: hasRole(["PROFESSOR", "ADMIN"]),
    isEstudante: role === "STUDENT" || role === "ESTUDANTE",
    isStaff:     hasRole(["ADMIN", "PROFESSOR", "REVISOR"]),

    // Dados do usuário logado
    userId,
    role,
    user,

    // Permissões específicas do domínio
    // canEdit: pode editar questões (próprias ou qualquer uma, dependendo do role)
    canEdit:   hasRole(["ADMIN", "PROFESSOR", "REVISOR"]),
    // canReview: pode aprovar/reprovar questões
    canReview: hasRole(["ADMIN", "REVISOR"]),
    // canAdmin: acessa painel administrativo
    canAdmin:  hasRole(["ADMIN"]),

    // Função genérica caso precise verificar um role específico pontualmente
    hasRole,
  };
}