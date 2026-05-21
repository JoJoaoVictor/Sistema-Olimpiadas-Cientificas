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
// Mapa dos 18 campi UNEMAT: value (armazenado no banco) → label legível
// ─────────────────────────────────────────────────────────────────────────────
const UNEMAT_CAMPUSES = [
  // Câmpus Oficiais da UNEMAT no Projeto
  { value: "ALTA_FLORESTA",         label: "UNEMAT - Alta Floresta",        cidade: "Alta Floresta" },
  { value: "BARRA_DO_BUGRES",       label: "UNEMAT - Barra do Bugres",      cidade: "Barra do Bugres" },
  { value: "CACERES",               label: "UNEMAT - Cáceres (Sede)",       cidade: "Cáceres" },
  { value: "COLIDER",               label: "UNEMAT - Colíder",              cidade: "Colíder" },
  { value: "DIAMANTINO",            label: "UNEMAT - Diamantino",           cidade: "Diamantino" },
  { value: "GUARANTA_DO_NORTE",     label: "UNEMAT - Guarantã do Norte",    cidade: "Guarantã do Norte" },
  { value: "JUARA",                 label: "UNEMAT - Juara",                cidade: "Juara" },
  { value: "JUINA",                 label: "UNEMAT - Juína",                cidade: "Juína" },
  { value: "NOVA_MUTUM",            label: "UNEMAT - Nova Mutum",           cidade: "Nova Mutum" },
  { value: "NOVA_XAVANTINA",        label: "UNEMAT - Nova Xavantina",       cidade: "Nova Xavantina" },
  { value: "PONTES_E_LACERDA",      label: "UNEMAT - Pontes e Lacerda",     cidade: "Pontes e Lacerda" },
  { value: "SINOP",                 label: "UNEMAT - Sinop",                cidade: "Sinop" },
  { value: "TANGARA_DA_SERRA",      label: "UNEMAT - Tangará da Serra",     cidade: "Tangará da Serra" },

  // Cidades do Polo de Cáceres (Olimpíada de Matemática / Extensão)
  { value: "ALTO_PARAGUAI",         label: "Polo - Alto Paraguai",          cidade: "Alto Paraguai" },
  { value: "NORTELANDIA",           label: "Polo - Nortelândia",            cidade: "Nortelândia" },
  { value: "NOVA_MARILANDIA",       label: "Polo - Nova Marilândia",        cidade: "Nova Marilândia" },
  { value: "NOVA_OLIMPIA",          label: "Polo - Nova Olímpia",           cidade: "Nova Olímpia" },
  { value: "PORTO_ESTRELA",         label: "Polo - Porto Estrela",          cidade: "Porto Estrela" },

  // Cidades do Polo de Sinop (Olimpíada de Matemática / Extensão)
  { value: "CAMPO_NOVO_DO_PARECIS", label: "Polo - Campo Novo do Parecis",  cidade: "Campo Novo do Parecis" },
  { value: "CARLINDA",              label: "Polo - Carlinda",               cidade: "Carlinda" },
  { value: "ITANHANGA",             label: "Polo - Itanhangá",              cidade: "Itanhangá" },
  { value: "ITAUBA",                label: "Polo - Itaúba",                 cidade: "Itaúba" },
  { value: "LUCAS_DO_RIO_VERDE",    label: "Polo - Lucas do Rio Verde",     cidade: "Lucas do Rio Verde" },
  { value: "MARCELANDIA",           label: "Polo - Marcelândia",            cidade: "Marcelândia" },
  { value: "NOVA_CANAA_DO_NORTE",   label: "Polo - Nova Canaã do Norte",    cidade: "Nova Canaã do Norte" },
  { value: "NOVA_MONTE_VERDE",      label: "Polo - Nova Monte Verde",       cidade: "Nova Monte Verde" },
  { value: "NOVA_SANTA_HELENA",     label: "Polo - Nova Santa Helena",      cidade: "Nova Santa Helena" },
  { value: "PARANAITA",             label: "Polo - Paranaíta",              cidade: "Paranaíta" },
  { value: "PORTO_DOS_GAUCHOS",     label: "Polo - Porto dos Gaúchos",      cidade: "Porto dos Gaúchos" },
  { value: "TABAPORA",              label: "Polo - Tabaporã",               cidade: "Tabaporã" },
  { value: "TAPURAH",               label: "Polo - Tapurah",                cidade: "Tapurah" },
  { value: "TERRA_NOVA_DO_NORTE",   label: "Polo - Terra Nova do Norte",    cidade: "Terra Nova do Norte" }
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formatação para exibição (banco guarda só dígitos)
// ─────────────────────────────────────────────────────────────────────────────

/** "52998224725" → "529.982.247-25" */
const formatCPFDisplay = (cpf) => {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf; // devolve como veio se inesperado
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

/** "65999887766" → "(65) 99988-7766"  |  "6533221100" → "(65) 3322-1100" */
const formatTelefoneDisplay = (tel) => {
  if (!tel) return "—";
  const d = tel.replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return tel;
};

/** "SINOP" → "Sinop"  |  valor desconhecido → devolve o próprio valor */
const formatCampusDisplay = (value) => {
  if (!value) return "—";
  return UNEMAT_CAMPUSES.find((c) => c.value === value)?.label ?? value;
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

  const handleCampusChange = (e) => {
  const selected = UNEMAT_CAMPUSES.find((c) => c.value === e.target.value);
    setEditCampus(e.target.value);
    setEditCidade(selected ? selected.cidade : "");
  };

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
      await api.put('/api/v1/users/me', {
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

      // Atualiza o contexto com os novos dados (sem recarregar a página)
      if (typeof updateUser === 'function') {
        updateUser({
          name: editName,
          avatar_url: finalAvatarUrl,
          profile: {
            cpf: user?.profile?.cpf,   // mantém o CPF original (não editável aqui)
            telefone: editTelefone.replace(/\D/g, ""),
            campus: editCampus,
            cidade: editCidade,
            matricula: editMatricula,
            curso: editCurso,
          },
        });
      }

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
  const displayRole  = role        || "Estudante";

  // ─── Dados do perfil acadêmico ───────────────────────────────────────────
  // Lidos de user.profile — disponíveis após UserSchema incluir o relacionamento.
  // Todos os campos têm fallback "—" para não quebrar se ainda não existirem.
  const perfil         = user?.profile ?? {};
  const displayCPF      = formatCPFDisplay(perfil.cpf);
  const displayTelefone = formatTelefoneDisplay(perfil.telefone);
  const displayCampus   = formatCampusDisplay(perfil.campus);
  const displayCidade   = perfil.cidade   || "—";
  const displayMatricula = perfil.matricula || "—";
  const displayCurso    = perfil.curso    || "—";

  // Matrícula e Curso só fazem sentido para STUDENT e PROFESSOR
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

            {/* Campus exibido sob o badge se preenchido */}
            {perfil.campus && (
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
            <div className={styles.info_item}>
              <label><FiUser /> Nome Completo</label>
              <p>{displayName}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiMail /> Email</label>
              <p>{displayEmail}</p>
            </div>
            <div className={styles.info_item}>
              <label><RiIdCardLine /> CPF</label>
              <p>{editCPF ? formatCPFDisplay(editCPF) : "—"}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiPhone /> Telefone / WhatsApp</label>
              <p>{user?.profile?.telefone ? formatTelefoneDisplay(user.profile.telefone) : "—"}</p>
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

          {/* ── Dados Acadêmicos ──────────────────────────────────── */}
          <div className={styles.details_divider}>
            <span>Dados Acadêmicos</span>
          </div>

            <div className={styles.info_grid}>
              <div className={styles.info_item}>
                <label><BsBuilding /> Campus / Polo</label>
                <p>{user?.profile?.campus ? formatCampusDisplay(user.profile.campus) : "—"}</p>
              </div>
              <div className={styles.info_item}>
                <label><FiMapPin /> Cidade</label>
                <p>{editCidade || "—"}</p>
            </div>

            {showMatricula && (
              <div className={styles.info_item}>
                <label>
                  <RiIdCardLine />
                  {user?.role === "STUDENT" ? "Matrícula" : "Nº Funcional"}
                </label>
                <p>{user?.profile?.matricula || "—"}</p>
              </div>
            )}

            {showCurso && (
              <div className={styles.info_item}>
                <label><FiBook /> Curso</label>
                <p>{user?.profile?.curso || "—"}</p>
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

                {/* COLUNA 2: DADOS ACADÉMICOS */}
                <div className={styles.modal_column}>
                  <h4 className={styles.modal_section_title}>Dados Académicos</h4>

                  <div className={styles.form_group}>
                    <label>Campus / Polo</label>
                    <select
                      className={styles.custom_select}
                      value={editCampus}
                      onChange={(e) => setEditCampus(e.target.value)}
                      required
                    >
                      <option value="">Selecione o campus</option>
                      {UNEMAT_CAMPUSES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <div className="input-group">
                      <label htmlFor="cidade">Cidade</label>
                      <input
                        id="cidade"
                        type="text"
                        value={editCidade}
                        readOnly
                        className="input-readonly"
                        tabIndex="-1"
                        placeholder="Preenchida conforme o campus"
                      />
                    </div>
                  </div>

                  {/* Mostra Matrícula/Nº Funcional baseado no cargo atual do utilizador logado */}
                  {["STUDENT", "PROFESSOR"].includes(user?.role) && (
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

                  {/* Mostra Curso apenas se for estudante */}
                  {user?.role === "STUDENT" && (
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