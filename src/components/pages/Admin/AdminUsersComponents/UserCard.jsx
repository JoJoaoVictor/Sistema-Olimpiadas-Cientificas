import { FiEye, FiTrash2 } from 'react-icons/fi';
import styles from '../AdminUsers.module.css';
import RoleBadge from './RoleBadge';

function UserCard({
  user,
  onRoleChange,
  onViewProfile,
  onDeleteClick,
  ROLE_META,
  avatarUrl
}) {
  return (
    <div className={styles.user_card}>
      <div className={styles.card_header}>
        <img src={avatarUrl(user.name)} alt="Avatar" />
        <div className={styles.card_info}>
          <strong>{user.name}</strong>
          <span className={styles.email_text}>{user.email}</span>
          <RoleBadge role={user.role} />
        </div>
        <button
          onClick={() => onViewProfile(user)}
          className={styles.icon_btn_view}
          title="Ver perfil"
        >
          <FiEye size={17} />
        </button>
      </div>

      <div className={styles.card_body}>
        <label>Cargo:</label>
        <select
          value={user.role}
          onChange={e => onRoleChange(user.id, e.target.value)}
          className={styles.role_select_mobile}
        >
          <option value="STUDENT">Estudante</option>
          <option value="PROFESSOR">Professor</option>
          <option value="REVISOR">Revisor</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <button
        onClick={() => onDeleteClick(user)}
        className={styles.btn_delete_mobile}
      >
        <FiTrash2 /> Excluir Usuário
      </button>
    </div>
  );
}

export default UserCard;
