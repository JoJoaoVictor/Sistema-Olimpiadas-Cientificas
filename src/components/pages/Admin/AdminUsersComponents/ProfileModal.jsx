import { 
  FiX, 
  FiMail, 
  FiCalendar, 
  FiBook, 
  FiFileText, 
  FiExternalLink, 
  FiTrash2,
  FiMapPin // Novo ícone importado para Cidade e Campus
} from 'react-icons/fi';
import { RiIdCardLine } from 'react-icons/ri';
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
  formatDate
}) {
  const navigate = useNavigate();

  if (!profileUser) return null;

  // 1. Tratamento resiliente do Avatar
  const getAvatar = () => {
    const avatar = profileUser.avatar_url || profileUser.avatarUrl || profileUser.avatar;
    if (avatar && avatar.trim() !== "") {
      return avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name || 'JA')}&background=random&size=150`;
  };

  // 2. Acesso seguro ao perfil aninhado retornado pelo backend
  const perfil = profileUser.profile || {};

  // 3. Formatação local simples para exibição limpa no modal admin
  const formatCPF = (cpf) => {
    if (!cpf) return "—";
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Regras de exibição de campos com base no cargo (role)
  const isStudent = profileUser.role === "STUDENT";
  const isProfessorOrRevisor = ["PROFESSOR", "REVISOR"].includes(profileUser.role);

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_profile} onClick={e => e.stopPropagation()}>

        <button className={styles.modal_close} onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* Topo do perfil */}
        <div className={styles.profile_hero}>
          <img 
            src={getAvatar()} 
            alt="Avatar" 
            className={styles.profile_avatar} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/150?text=Foto";
            }}
          />
          <div>
            <h2 className={styles.profile_name}>{profileUser.name}</h2>
            <RoleBadge role={profileUser.role} />
          </div>
        </div>

        {/* Grade de Informações Gerais e Acadêmicas */}
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

          {/* Cidade */}
          <div className={styles.profile_info_item}>
            <FiMapPin className={styles.profile_info_icon} />
            <div>
              <span className={styles.info_label}>Cidade</span>
              <span className={styles.info_value}>{perfil.cidade || "—"}</span>
            </div>
          </div>

          {/* Campus */}
          <div className={styles.profile_info_item}>
            <FiMapPin className={styles.profile_info_icon} />
            <div>
              <span className={styles.info_label}>Campus</span>
              <span className={styles.info_value}>{perfil.campus || "—"}</span>
            </div>
          </div>

          {/* Sempre exibe o CPF se ele existir no perfil */}
          <div className={styles.profile_info_item}>
            <RiIdCardLine className={styles.profile_info_icon} />
            <div>
              <span className={styles.info_label}>CPF</span>
              <span className={styles.info_value}>{formatCPF(perfil.cpf)}</span>
            </div>
          </div>

          {/* Exibe Matrícula se for Estudante */}
          {isStudent && (
            <div className={styles.profile_info_item}>
              <RiIdCardLine className={styles.profile_info_icon} />
              <div>
                <span className={styles.info_label}>Matrícula</span>
                <span className={styles.info_value}>{perfil.matricula || "—"}</span>
              </div>
            </div>
          )}

          {/* Exibe Número Funcional se for Professor ou Revisor */}
          {isProfessorOrRevisor && (
            <div className={styles.profile_info_item}>
              <RiIdCardLine className={styles.profile_info_icon} />
              <div>
                <span className={styles.info_label}>Nº Funcional</span>
                <span className={styles.info_value}>{perfil.matricula || "—"}</span>
              </div>
            </div>
          )}
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
                  onClick={() => { onClose(); navigate(`/projects?professor_id=${profileUser.id}`); }}
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
                  onClick={() => { onClose(); navigate(`/provas?professor_id=${profileUser.id}`); }}
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