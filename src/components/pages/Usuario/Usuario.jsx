import styles from "./Usuario.module.css";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiLogOut, FiCalendar, FiUser, FiMail, FiCheckCircle } from "react-icons/fi";
import { RiLock2Line } from "react-icons/ri";
import { BsPencil } from 'react-icons/bs';

// ── ALTERAÇÃO 1 ──────────────────────────────────────────────────────────────
// Antes: fetch() com URLs hardcoded (127.0.0.1:8000 e 127.0.0.1:5000) e
// leitura manual do token via localStorage.
// Agora: usa o serviço `api` centralizado (Axios) que já injeta o token
// automaticamente e aponta para o baseURL correto do projeto.
// Impacto: uma única variável de ambiente controla a URL — não há mais risco
// de esquecermos de atualizar URLs espalhadas pelo código.
import api from "../../../services/api";

// ── ALTERAÇÃO 2 ──────────────────────────────────────────────────────────────
// Antes: dados do usuário (name, email, role, createdAt) eram lidos do
// localStorage via useEffect — ao trocar de conta, os dados da sessão anterior
// persistiam até o componente ser remontado.
// Agora: dados vêm do AuthContext via useAuth/usePermission — são reativos e
// atualizados imediatamente após login/logout.
// Impacto: ao trocar de conta, o perfil exibido reflete o novo usuário
// instantaneamente, sem dados fantasma da sessão anterior.
import { usePermission } from "../../../hooks/usePermission";

function Usuario() {
  const { signout, user } = useAuth();
  const { role } = usePermission();
  const navigate = useNavigate();

  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  // Dados visuais derivados do contexto (não mais do localStorage)
  const [profilePic,  setProfilePic]  = useState(DEFAULT_IMAGE);
  const [createdAt,   setCreatedAt]   = useState("...");
  const [hasPassword, setHasPassword] = useState(false);

  // Modais
  const [showEditModal,     setShowEditModal]     = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Formulário de edição
  const [editName,      setEditName]      = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");

  // Formulário de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── ALTERAÇÃO 3 ──────────────────────────────────────────────────────────
  // Antes: useEffect lia localStorage para popular os campos visuais.
  // Agora: useEffect observa `user` do AuthContext — quando o usuário muda
  // (login com outra conta), todos os campos são atualizados automaticamente.
  // Impacto: resolve o bug do nome/foto/role persistindo após troca de conta.
  useEffect(() => {
    if (!user) return;

    const userName = user.name || "Usuário";
    setEditName(userName);

    // Lógica de prioridade da imagem
    if (user.avatar_url) {
      setProfilePic(user.avatar_url);
      setEditAvatarUrl(user.avatar_url);
    } else {
      const autoAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=150`;
      setProfilePic(autoAvatar);
      setEditAvatarUrl("");
    }

    // Usuário Google tem password_hash vazio — sem senha cadastrada
    setHasPassword(!!user.has_password || false);

    if (user.created_at) {
      setCreatedAt(new Date(user.created_at).toLocaleDateString('pt-BR'));
    }
  }, [user]);

  const handleLogout = () => {
    signout();
    navigate("/login");
  };

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
      // ── ALTERAÇÃO 4 ────────────────────────────────────────────────────
      // Antes: fetch('http://127.0.0.1:8000/api/v1/users/me', { headers: { Authorization: Bearer ${token} } })
      // Agora: api.put('/api/v1/users/me', ...) — token injetado automaticamente pelo interceptor do Axios.
      // Impacto: sem hardcode de URL, sem leitura manual de token.
      await api.put('/api/v1/users/me', {
        name:       editName,
        avatar_url: finalAvatarUrl,
      });

      setProfilePic(finalAvatarUrl);
      setShowEditModal(false);
      alert("Perfil atualizado com sucesso!");
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
      // ── ALTERAÇÃO 5 ────────────────────────────────────────────────────
      // Antes: fetch('http://127.0.0.1:5000/api/v1/users/change-password', ...)
      //   → porta 5000 era incorreta (backend roda na 8000), causando ERR_CONNECTION_REFUSED.
      // Agora: api.post('/api/v1/users/change-password', ...) via Axios centralizado.
      // Impacto: a requisição chega ao backend correto; usuários Google conseguem
      // criar senha pela primeira vez sem erro de conexão.
      await api.post('/api/v1/users/change-password', {
        current_password: currentPassword || "",
        new_password:     newPassword,
      });

      alert("Senha atualizada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);

      // Marca que o usuário agora tem senha (sem precisar de reload)
      setHasPassword(true);
    } catch (error) {
      const msg = error.response?.data?.detail || "Falha ao alterar senha.";
      alert(`Erro: ${msg}`);
    }
  };

  // Dados lidos do contexto diretamente (reativos)
  const displayName  = user?.name  || "Usuário";
  const displayEmail = user?.email || "Email não disponível";
  const displayRole  = role        || "Estudante";

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
          <div className={styles.section_title}>
            <h3>Informações da Conta</h3>
            <p>Seus dados pessoais cadastrados no sistema.</p>
          </div>

          <div className={styles.info_grid}>
            <div className={styles.info_item}>
              <label><FiUser /> Nome Completo</label>
              <p>{displayName}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiMail /> Email</label>
              <p>{displayEmail}</p>
            </div>
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
        </main>
      </div>

      {/* === MODAL: EDITAR PERFIL === */}
      {showEditModal && (
        <div className={styles.modal_overlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Perfil</h3>
            <form onSubmit={handleSaveProfile}>
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

              {/* Só exige senha atual se o usuário já tiver uma */}
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
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                  minLength={6}
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
                  minLength={6}
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