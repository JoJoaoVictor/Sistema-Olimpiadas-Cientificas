import { FiChevronUp, FiChevronDown, FiEye, FiTrash2 } from 'react-icons/fi';
import styles from '../AdminUsers.module.css';
import RoleBadge from './RoleBadge';

function UsersTable({
  users,
  sortField,
  sortDir,
  onSort,
  onRoleChange,
  onViewProfile,
  onDeleteClick,
  ROLE_META,
  formatDate
}) {
  const SortIcon = ({ field }) => {
    if (sortField !== field) return <FiChevronUp style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Resolve a renderização do avatar dinâmico por linha da tabela
  const getAvatar = (user) => {
    if (user.avatar_url && user.avatar_url.trim() !== "") {
      return user.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=40`;
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th onClick={() => onSort('name')} className={styles.sortable_th}>
            Usuário <SortIcon field="name" />
          </th>
          <th onClick={() => onSort('email')} className={styles.sortable_th}>
            Email <SortIcon field="email" />
          </th>
          <th>Cargo</th>
          <th onClick={() => onSort('created_at')} className={styles.sortable_th}>
            Cadastro <SortIcon field="created_at" />
          </th>
          <th style={{ textAlign: 'right' }}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>
              <div className={styles.user_cell}>
                <img 
                  src={getAvatar(user)} 
                  alt="Avatar" 
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = "https://placehold.co/150?text=Foto"; 
                  }}
                />
                <strong>{user.name}</strong>
              </div>
            </td>
            <td className={styles.email_td}>{user.email}</td>
            <td>
              <div className={styles.select_wrapper}>
                <select
                  value={user.role}
                  onChange={e => onRoleChange(user.id, e.target.value)}
                  className={styles.role_select}
                  style={{
                    color: ROLE_META[user.role?.toUpperCase()]?.color || '#333',
                    borderColor: ROLE_META[user.role?.toUpperCase()]?.color || '#ddd',
                  }}
                >
                  <option value="STUDENT">Estudante</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="REVISOR">Revisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </td>
            <td className={styles.date_td}>{formatDate(user.created_at)}</td>
            <td style={{ textAlign: 'right' }}>
              <div className={styles.action_group}>
                <button
                  onClick={() => onViewProfile(user)}
                  className={styles.icon_btn_view}
                  title="Ver perfil"
                >
                  <FiEye size={17} />
                </button>
                <button
                  onClick={() => onDeleteClick(user)}
                  className={styles.icon_btn_delete}
                  title="Excluir usuário"
                >
                  <FiTrash2 size={17} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UsersTable;