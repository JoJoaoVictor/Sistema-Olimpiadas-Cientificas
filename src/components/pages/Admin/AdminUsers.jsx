import { useState, useEffect } from 'react';
import styles from './AdminUsers.module.css'; 
import useAuth from '../../../hooks/useAuth';
import { userService } from '../../../services/userService';

// Ícones
import { FiTrash2, FiSearch, FiUsers, FiShield, FiAlertTriangle } from "react-icons/fi";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Novo: Filtro de busca
  const { token } = useAuth();
  
  // Estado para o Modal de Exclusão
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      if (!token) return;
      try {
        const data = await userService.getAllUsers(token);
        if (Array.isArray(data)) setUsers(data);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    }
    loadUsers();
  }, [token]);

  // Abre o modal perguntando se quer deletar
  const confirmDelete = (user) => {
    setUserToDelete(user);
  }

  // Ação real de deletar (chamada pelo modal)
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    const success = await userService.deleteUser(userToDelete.id, token);
    if (success) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null); // Fecha modal
    } else {
      alert("Erro ao remover usuário.");
    }
  }

  const handleRoleChange = async (id, newRole) => {
    // Feedback visual imediato (Otimista)
    const oldUsers = [...users];
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));

    const success = await userService.updateUserRole(id, newRole, token);
    if (!success) {
      setUsers(oldUsers); // Reverte se der erro
      alert("Erro ao atualizar cargo.");
    }
  };

  // Filtragem local
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container}>
        
        {/* === CABEÇALHO DO DASHBOARD === */}
        <div className={styles.header_section}>
            <div>
                <h1><FiShield style={{marginRight: '10px'}}/>Gerenciar Usuários</h1>
                <p>Administração de contas e permissões do sistema.</p>
            </div>
            
            <div className={styles.stats_card}>
                <FiUsers size={24} color="#007bff"/>
                <div>
                    <strong>{users.length}</strong>
                    <span>Total de Usuários</span>
                </div>
            </div>
        </div>

        {/* === BARRA DE FERRAMENTAS === */}
        <div className={styles.toolbar}>
            <div className={styles.search_box}>
                <FiSearch />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* === ÁREA DE DADOS (TABELA PC / CARDS MOBILE) === */}
        <div className={styles.content_area}>
            {filteredUsers.length > 0 ? (
                <>
                  {/* TABELA (Visível apenas em PC) */}
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Email</th>
                        <th>Cargo</th>
                        <th style={{textAlign: 'right'}}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className={styles.user_cell}>
                                {/* Avatar automático gerado com iniciais */}
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                                    alt="Avatar" 
                                />
                                <strong>{user.name}</strong>
                            </div>
                          </td>
                          <td style={{color: '#666'}}>{user.email}</td>
                          <td>
                            <div className={styles.select_wrapper}>
                                <select 
                                  value={user.role} 
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className={`${styles.role_select} ${styles[user.role?.toLowerCase()]}`}
                                >
                                  <option value="STUDENT">Estudante</option>
                                  <option value="PROFESSOR">Professor</option>
                                  <option value="REVISOR">Revisor</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}}>
                            <button 
                              onClick={() => confirmDelete(user)}
                              className={styles.icon_btn_delete}
                              title="Excluir Usuário"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* LISTA DE CARDS (Visível apenas em Mobile) */}
                  <div className={styles.mobile_list}>
                    {filteredUsers.map((user) => (
                        <div key={user.id} className={styles.user_card}>
                            <div className={styles.card_header}>
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`} 
                                    alt="Avatar" 
                                />
                                <div>
                                    <strong>{user.name}</strong>
                                    <span className={styles.email_text}>{user.email}</span>
                                </div>
                            </div>
                            
                            <div className={styles.card_body}>
                                <label>Cargo:</label>
                                <select 
                                  value={user.role} 
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className={styles.role_select_mobile}
                                >
                                  <option value="STUDENT">Estudante</option>
                                  <option value="PROFESSOR">Professor</option>
                                  <option value="REVISOR">Revisor</option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => confirmDelete(user)}
                                className={styles.btn_delete_mobile}
                            >
                                <FiTrash2 /> Excluir Usuário
                            </button>
                        </div>
                    ))}
                  </div>
                </>
            ) : (
                <div className={styles.empty_state}>
                    <p>Nenhum usuário encontrado.</p>
                </div>
            )}
        </div>

      </div>

      {/* === MODAL DE CONFIRMAÇÃO DE EXCLUSÃO === */}
      {userToDelete && (
        <div className={styles.modal_overlay} onClick={() => setUserToDelete(null)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modal_header_danger}>
                <FiAlertTriangle size={40} />
            </div>
            <h3>Excluir Usuário?</h3>
            <p>
              Tem certeza que deseja remover <strong>{userToDelete.name}</strong>? 
              <br/>Essa ação não pode ser desfeita.
            </p>
            
            <div className={styles.modal_actions}>
              <button className={styles.btn_cancel} onClick={() => setUserToDelete(null)}>Cancelar</button>
              <button className={styles.btn_confirm_danger} onClick={handleDelete}>Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;