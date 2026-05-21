import { FiX, FiMail, FiCalendar, FiBook, FiFileText, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import styles from '../AdminUsers.module.css';
import RoleBadge from './RoleBadge';

function ProfileModal({
  profileUser,
  profileStats,
  profileLoading,
  onClose,
  onRoleChange,
  onDeleteClick,
  ROLE_META,
  formatDate,
  avatarUrl
}) {
  const navigate = useNavigate();

  if (!profileUser) return null;

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_profile} onClick={e => e.stopPropagation()}>

        <button className={styles.modal_close} onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* Topo do perfil */}
        <div className={styles.profile_hero}>
          <img src={avatarUrl(profileUser.name)} alt="Avatar" className={styles.profile_avatar} />
          <div>
            <h2 className={styles.profile_name}>{profileUser.name}</h2>
            <RoleBadge role={profileUser.role} />
          </div>
        </div>

        {/* Infos */}
        <div className={styles.profile_info_grid}>
          <div className={styles.profile_info_item}>
            <FiMail className={styles.profile_info_icon} />
            <div>
              <span className={styles.info_label}>Email</span>
              <span className={styles.info_value}>{profileUser.email}</span>
            </div>
          </div>
          <div className={styles.profile_info_item}>
            <FiCalendar className={styles.profile_info_icon} />
            <div>
              <span className={styles.info_label}>Cadastrado em</span>
              <span className={styles.info_value}>{formatDate(profileUser.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Stats de produção */}
        <div className={styles.profile_stats_title}>Produção</div>
        {profileLoading ? (
          <div className={styles.profile_loading}><div className={styles.spinner} /></div>
        ) : (
          <div className={styles.profile_stats_grid}>
            {/* Questões */}
            <div className={styles.profile_stat_card}>
              <div className={styles.pstat_icon} style={{ background: '#e7f0ff', color: '#0d6efd' }}>
                <FiBook size={22} />
              </div>
              <div>
                <strong className={styles.pstat_value}>
                  {profileStats?.questionsTotal ?? '—'}
                </strong>
                <span className={styles.pstat_label}>Questões criadas</span>
              </div>
              {profileStats?.questionsTotal > 0 && (
                <button
                  className={styles.pstat_link}
                  onClick={() => navigate(`/projects?professor_id=${profileUser.id}`)}
                  title="Ver questões deste usuário"
                >
                  <FiExternalLink size={15} /> Ver
                </button>
              )}
            </div>

            {/* Provas */}
            <div className={styles.profile_stat_card}>
              <div className={styles.pstat_icon} style={{ background: '#e6fcf5', color: '#0ca678' }}>
                <FiFileText size={22} />
              </div>
              <div>
                <strong className={styles.pstat_value}>
                  {profileStats?.examsTotal ?? '—'}
                </strong>
                <span className={styles.pstat_label}>Provas criadas</span>
              </div>
              {profileStats?.examsTotal > 0 && (
                <button
                  className={styles.pstat_link}
                  onClick={() => navigate(`/provas?professor_id=${profileUser.id}`)}
                  title="Ver provas deste usuário"
                >
                  <FiExternalLink size={15} /> Ver
                </button>
              )}
            </div>
          </div>
        )}

        {/* Alterar cargo direto no modal */}
        <div className={styles.profile_role_section}>
          <label className={styles.info_label}>Alterar cargo</label>
          <select
            value={profileUser.role}
            onChange={e => onRoleChange(profileUser.id, e.target.value)}
            className={styles.role_select_modal}
            style={{
              color: ROLE_META[profileUser.role?.toUpperCase()]?.color || '#333',
              borderColor: ROLE_META[profileUser.role?.toUpperCase()]?.color || '#ddd',
            }}
          >
            <option value="STUDENT">Estudante</option>
            <option value="PROFESSOR">Professor</option>
            <option value="REVISOR">Revisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Ação de exclusão no rodapé */}
        <div className={styles.profile_footer}>
          <button
            className={styles.btn_danger_outline}
            onClick={() => { onClose(); onDeleteClick(profileUser); }}
          >
            <FiTrash2 /> Excluir conta
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
