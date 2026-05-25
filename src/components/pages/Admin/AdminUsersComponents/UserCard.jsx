import { FiEye, FiTrash2 } from 'react-icons/fi';
import styles from '../AdminUsers.module.css';
import RoleBadge from './RoleBadge';

function UserCard({
  user,
  onRoleChange,
  onViewProfile,
  onDeleteClick,
  ROLE_META
}) {
  // Tratamento altamente resiliente para encontrar o avatar do usuário
  const getAvatar = () => {
    // 1. Garante que o objeto user existe
    if (!user) return "https://placehold.co/150?text=Foto";

    // 2. Tenta extrair a string do avatar de forma direta ou propriedades similares
    const avatar = user.avatar_url || user.avatarUrl || user.avatar;
    
    if (avatar && avatar.trim() !== "") {
      return avatar;
    }

    // 3. Fallback dinâmico usando o nome do usuário seguro
    const userName = user.name || user.username || "Usuario";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=150`;
  };

  return (
    <div className={styles.user_card}>
      <div className={styles.card_header}>
        <img 
          src={getAvatar()} 
          alt={user?.name ? `Avatar de ${user.name}` : "Avatar"} 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "https://placehold.co/150?text=Foto"; 
          }}
        />
        <div className={styles.card_info}>
          <strong>{user?.name || "Usuário Sem Nome"}</strong>
          <span className={styles.email_text}>{user?.email || "E-mail não informado"}</span>
          <RoleBadge role={user?.role} />
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
          value={user?.role || "STUDENT"}
          onChange={e => onRoleChange(user?.id, e.target.value)}
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