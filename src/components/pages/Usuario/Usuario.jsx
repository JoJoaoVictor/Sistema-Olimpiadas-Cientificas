import styles from "./Usuario.module.css";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiLogOut, FiCalendar, FiUser, FiMail,
  FiCheckCircle, FiPhone, FiMapPin, FiBook,
} from "react-icons/fi";
import { RiLock2Line, RiIdCardLine } from "react-icons/ri";
import { BsPencil, BsBuilding } from "react-icons/bs";
import { usePermission } from "../../../hooks/usePermission";
import api from "../../../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formatação
// ─────────────────────────────────────────────────────────────────────────────
const formatCPFDisplay = (cpf) => {
  if (!cpf) return "";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatTelefoneDisplay = (tel) => {
  if (!tel) return "";
  const d = tel.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
function Usuario() {
  const { signout, user, updateUser } = useAuth();
  const { role } = usePermission();
  const navigate = useNavigate();

  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  const [profilePic,  setProfilePic]  = useState(DEFAULT_IMAGE);
  const [createdAt,   setCreatedAt]   = useState("...");
  const [hasPassword, setHasPassword] = useState(false);
  
  // Modais
  const [showEditModal,     setShowEditModal]     = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Formulário de edição
  const [editName,      setEditName]      = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editCampus, setEditCampus] = useState("");
  const [editMatricula, setEditMatricula] = useState("");
  const [editCurso, setEditCurso] = useState("");
  const [editCidade, setEditCidade] = useState("");
  const [editCPF, setEditCPF] = useState("");

  // Formulário de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogout = () => {
    signout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/v1/users/me');
        const userData = response.data?.data;
        if (!userData) return;

        setEditName(userData.name || '');
        setProfilePic(userData.avatar_url || DEFAULT_IMAGE);
        setEditAvatarUrl(userData.avatar_url || '');
        setHasPassword(!!userData.has_password);
        if (userData.created_at) {
          setCreatedAt(new Date(userData.created_at).toLocaleDateString('pt-BR'));
        }

        const p = userData.profile || {};
        setEditCPF(p.cpf || '');
        setEditTelefone(p.telefone || '');
        setEditCampus(p.campus || '');
        setEditCidade(p.cidade || '');
        setEditMatricula(p.matricula || '');
        setEditCurso(p.curso || '');

        if (typeof updateUser === 'function') {
          updateUser(userData);
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };
    fetchProfile();
  }, []);

  // =========================================================
  // SALVAR PERFIL
  // =========================================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    let finalAvatarUrl = editAvatarUrl;
    if (!finalAvatarUrl || finalAvatarUrl.trim() === "") {
      finalAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}&background=random&size=150`;
    }

    try {
      const response = await api.put('/api/v1/users/me', {
        name: editName,
        avatar_url: finalAvatarUrl,
        profile: {
          telefone: editTelefone.replace(/\D/g, "") || null,
          campus: editCampus || null,
          cidade: editCidade || null,
          matricula: editMatricula || null,
          curso: editCurso || null
        }
      });

      const updatedData = response.data?.data;

      if (typeof updateUser === 'function' && updatedData) {
        updateUser(updatedData);
      } else if (typeof updateUser === 'function') {
        updateUser({
          ...user,
          name: editName,
          avatar_url: finalAvatarUrl,
          profile: {
            ...user?.profile,
            telefone: editTelefone.replace(/\D/g, ""),
            campus: editCampus,
            cidade: editCidade,
            matricula: editMatricula,
            curso: editCurso,
          },
        });
      }

      setProfilePic(finalAvatarUrl);
      setEditCidade(updatedData?.profile?.cidade || editCidade);
      setShowEditModal(false);
      alert("Perfil updated successfully!");
    } catch (error) {
      const msg = error.response?.data?.detail || "Erro ao salvar perfil.";
      alert(`Erro: ${msg}`);
    }
  };

  // =========================================================
  // ALTERAR / CRIAR SENHA
  // =========================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não conferem.");
      return;
    }

    try {
      await api.post('/api/v1/users/change-password', {
        current_password: currentPassword || "",
        new_password:     newPassword,
      });

      alert("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
      setHasPassword(true);
    } catch (error) {
      const msg = error.response?.data?.detail || "Falha ao alterar senha.";
      alert(`Erro: ${msg}`);
    }
  };

  // ─── Dados básicos (contexto) ────────────────────────────────────────────
  const displayName  = user?.name  || "Usuário";
  const displayEmail = user?.email || "Email não disponível";
  const displayRole = user?.role === "STUDENT" ? "ELABORADOR" : (role || "Elaborador");
  const perfil         = user?.profile ?? {};
  const displayCampus   = perfil.campus; // Agora pega direto a string livre

  const showMatricula = ["STUDENT", "PROFESSOR"].includes(user?.role);
  const showCurso     = user?.role === "STUDENT";

  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container}>

        {/* === CARD DA ESQUERDA === */}
        <aside className={styles.profile_card}>
          <div className={styles.profile_header}>
            <img
              className={styles.avatar}
              src={profilePic}
              alt="Perfil"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
            />
            <h2 className={styles.user_name}>{displayName}</h2>
            <span className={styles.user_badge}>{displayRole}</span>

            {/* Campus exibido sob o badge APENAS se existir */}
            {perfil?.campus && (
              <span className={styles.campus_badge}>
                <FiMapPin size={11} /> {displayCampus}
              </span>
            )}
          </div>

          <div className={styles.action_buttons}>
            <button className={styles.btn_outline} onClick={() => setShowEditModal(true)} translate="no">
              <BsPencil /> Editar Perfil
            </button>
            <button className={styles.btn_outline} onClick={() => setShowPasswordModal(true)} translate="no">
              <RiLock2Line /> {hasPassword ? "Alterar Senha" : "Criar Senha"}
            </button>
            <button className={`${styles.btn_outline} ${styles.btn_danger}`} onClick={handleLogout} translate="no">
              <FiLogOut /> Sair
            </button>
          </div>
        </aside>

        {/* === CARD DA DIREITA === */}
        <main className={styles.details_section}>

          {/* ── Dados Pessoais ────────────────────────────────────── */}
          <div className={styles.section_title}>
            <h3>Informações da Conta</h3>
            <p>Seus dados pessoais cadastrados no sistema.</p>
          </div>

          <div className={styles.info_grid}>
            {displayName && (
              <div className={styles.info_item}>
                <label><FiUser /> Nome Completo</label>
                <p>{displayName}</p>
              </div>
            )}
            
            {displayEmail && (
              <div className={styles.info_item}>
                <label><FiMail /> Email</label>
                <p>{displayEmail}</p>
              </div>
            )}
            
            {/* CPF: Ocultado caso esteja vazio */}
            {editCPF && (
              <div className={styles.info_item}>
                <label><RiIdCardLine /> CPF</label>
                <p>{formatCPFDisplay(editCPF)}</p>
              </div>
            )}
            
            {/* Telefone: Ocultado caso esteja vazio */}
            {perfil?.telefone && (
              <div className={styles.info_item}>
                <label><FiPhone /> Telefone / WhatsApp</label>
                <p>{formatTelefoneDisplay(perfil.telefone)}</p>
              </div>
            )}
            
            <div className={styles.info_item}>
              <label><FiCheckCircle /> Cargo</label>
              <p>{displayRole}</p>
            </div>
            
            <div className={styles.info_item}>
              <label><FiCalendar /> Membro Desde</label>
              <p>{createdAt}</p>
            </div>
            
            <div className={styles.info_item}>
              <label>Status da Conta</label>
              <span className={styles.status_active}>Ativo</span>
            </div>
          </div>

          {/* ── Dados Acadêmicos / Localização ──────────────────────── */}
          <div className={styles.details_divider}>
            <span>Dados Profissionais</span>
          </div>

          <div className={styles.info_grid}>
            
            {/* Exibe Campus/Polo APENAS se existir */}
            {perfil?.campus && (
              <div className={styles.info_item}>
                <label><BsBuilding /> Instituição vinculada</label>
                <p>{perfil.campus}</p>
              </div>
            )}

            {/* Cidade sempre exibe se houver string válida */}
            {editCidade && (
              <div className={styles.info_item}>
                <label><FiMapPin /> Cidade</label>
                <p>{editCidade}</p>
              </div>
            )}

            {/* Exibe Matrícula APENAS se existir e for o perfil adequado */}
            {showMatricula && perfil?.matricula && (
              <div className={styles.info_item}>
                <label>
                  <RiIdCardLine />
                  {user?.role === "STUDENT" ? "Matrícula" : "Nº Funcional"}
                </label>
                <p>{perfil.matricula}</p>
              </div>
            )}

            {/* Exibe Curso APENAS se existir e for Estudante */}
            {showCurso && perfil?.curso && (
              <div className={styles.info_item}>
                <label><FiBook /> Curso</label>
                <p>{perfil.curso}</p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* === MODAL: EDITAR PERFIL === */}
      {showEditModal && (
        <div className={styles.modal_overlay} onClick={() => setShowEditModal(false)}>
          <div className={`${styles.modal_content} ${styles.modal_content_wide}`} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Dados do Perfil</h3>
            
            <form onSubmit={handleSaveProfile}>
              
              <div className={styles.modal_columns}>
                
                {/* COLUNA 1: DADOS PESSOAIS */}
                <div className={styles.modal_column}>
                  <h4 className={styles.modal_section_title}>Dados Pessoais</h4>
                  
                  <div className={styles.form_group}>
                    <label>Nome Completo</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className={styles.form_group}>
                    <label>Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                    />
                  </div>
                  
                  <div className={styles.form_group}>
                    <label>URL da Imagem (Avatar)</label>
                    <input
                      type="text"
                      placeholder="Cole o link da sua imagem..."
                      value={editAvatarUrl}
                      onChange={(e) => setEditAvatarUrl(e.target.value)}
                      autoComplete="off"
                    />
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'10px', padding:'10px', background:'#f5f5f5', borderRadius:'8px' }}>
                    <span style={{ fontSize:'0.8rem', color:'#666' }}>Pré-visualização:</span>
                    <img
                      src={editAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}`}
                      alt="Preview"
                      style={{ width:'40px', height:'40px', borderRadius:'50%', objectFit:'cover', border:'1px solid #ddd' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                    />
                  </div>
                </div>

                {/* COLUNA 2: DADOS ACADÉMICOS / LOCALIZAÇÃO */}
                <div className={styles.modal_column}>
                  <h4 className={styles.modal_section_title}>Dados Profissionais</h4>

                  {/* AQUI ESTÁ A CORREÇÃO: Instituição vinculada livre */}
                  <div className={styles.form_group}>
                    <label>Instituição vinculada</label>
                    <input
                      type="text"
                      value={editCampus}
                      onChange={(e) => setEditCampus(e.target.value)}
                      placeholder="Digite o nome da instituição"
                    />
                  </div>

                  {/* AQUI ESTÁ A CORREÇÃO: Cidade livre (sem readOnly, sem if/else) */}
                  <div className={styles.form_group}>
                    <label>Cidade</label>
                    <input
                      type="text"
                      value={editCidade}
                      onChange={(e) => setEditCidade(e.target.value)}
                      placeholder="Digite o nome da sua cidade"
                    />
                  </div>

                  {/* Mostra Matrícula APENAS se o usuário JÁ TIVER esse dado salvo */}
                  {["STUDENT", "PROFESSOR"].includes(user?.role) && perfil?.matricula && (
                    <div className={styles.form_group}>
                      <label>{user?.role === "STUDENT" ? "Matrícula" : "Nº Funcional"}</label>
                      <input
                        type="text"
                        value={editMatricula}
                        onChange={(e) => setEditMatricula(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Mostra Curso APENAS se o usuário JÁ TIVER esse dado salvo */}
                  {user?.role === "STUDENT" && perfil?.curso && (
                    <div className={styles.form_group}>
                      <label>Curso</label>
                      <input
                        type="text"
                        placeholder="Nome do seu curso"
                        value={editCurso}
                        onChange={(e) => setEditCurso(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className={styles.modal_actions}>
                <button type="button" className={styles.btn_cancel} onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn_save}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL: ALTERAR / CRIAR SENHA === */}
      {showPasswordModal && (
        <div className={styles.modal_overlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <h3>{hasPassword ? "Alterar Senha" : "Criar Senha"}</h3>
            <form onSubmit={handleChangePassword}>

              {hasPassword && (
                <div className={styles.form_group}>
                  <label>Senha Atual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                    required
                  />
                </div>
              )}

              <div className={styles.form_group}>
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.form_group}>
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.modal_actions}>
                <button type="button" className={styles.btn_cancel} onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn_save}>
                  {hasPassword ? "Atualizar Senha" : "Criar Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuario;