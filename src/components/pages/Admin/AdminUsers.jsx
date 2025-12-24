import { useState, useEffect } from 'react';
import styles from './AdminUsers.module.css'; 
import Container from '../../Layout/Container';
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { token } = useAuth(); // Recupera o token do contexto para autenticar as requisições

  /**
   * EFEITO: Carregar usuários
   * Executa automaticamente assim que o componente abre ou se o token mudar.
   */
  useEffect(() => {
    async function loadUsers() {
      // Se não tiver token (usuário não logado), não tenta buscar nada
      if (!token) return;

      try {
        const data = await userService.getAllUsers(token);
        
        // Verificação de segurança: só salva se receber uma lista (array)
        if (Array.isArray(data)) {
          setUsers(data);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }

    loadUsers();
  }, [token]);

  /**
   * FUNÇÃO: Deletar Usuário
   * Remove o usuário do banco e atualiza a lista visualmente.
   */
  async function handleDelete(id) {
    const confirm = window.confirm("Tem certeza que deseja excluir este usuário?");
    
    if (confirm) {
      const success = await userService.deleteUser(id, token);
      
      if (success) {
        // ATUALIZAÇÃO OTIMISTA: Remove o usuário da lista localmente
        // Isso evita ter que recarregar a página inteira
        setUsers(users.filter(user => user.id !== id));
        alert("Usuário removido com sucesso!");
      } else {
        alert("Erro ao remover usuário. Tente novamente.");
      }
    }
  }

  /**
   * FUNÇÃO: Mudar Cargo (Promover/Rebaixar)
   * Envia o novo cargo para o backend e atualiza a interface.
   */
  async function handleRoleChange(id, newRole) {
    const success = await userService.updateUserRole(id, newRole, token);
    
    if (success) {
      alert(`Cargo do usuário atualizado para: ${newRole}`);
      
      // Atualiza apenas o usuário modificado na lista local
      setUsers(users.map(user => 
        user.id === id ? { ...user, role: newRole } : user
      ));
    } else {
      alert("Erro ao atualizar cargo. Lembre-se: um Admin não pode rebaixar a si mesmo.");
    }
  }

  return (
    <div className={styles.admin_container}>
      <Container customClass="column">
        {/* Cabeçalho da Página */}
        <div className={styles.admin_header}>
          <h1>Gerenciar Usuários</h1>
          <p>Total de usuários: <strong>{users.length}</strong></p>
        </div>

        {/* Tabela de Usuários */}
        {users.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Cargo Atual</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  
                  {/* Coluna de Cargo (Dropdown) */}
                  <td>
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={styles.role_select}
                    >
                      <option value="STUDENT">Estagiário</option>
                      <option value="PROFESSOR">Professor</option>
                      <option value="REVISOR">Revisor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  {/* Coluna de Ações (Botão Excluir) */}
                  <td data-label="Ações">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className={styles.delete_btn}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.empty_msg}>Carregando usuários ou lista vazia...</p>
        )}
      </Container>
    </div>
  );
}

export default AdminUsers;