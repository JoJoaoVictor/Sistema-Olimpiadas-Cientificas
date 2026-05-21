import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiBook, FiSave, FiArrowLeft, FiImage } from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import useAuth from '../../../../hooks/useAuth';
import api from '../../../../services/api';
import styles from './EditarPerfil.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes (idênticas ao Registro para consistência)
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

  // Cidades do Primeiro Bloco de Texto (Polo de Cáceres)
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

const CURSOS = [
  "Administração", "Agronomia", "Biologia", "Ciência da Computação",
  "Ciências Contábeis", "Direito", "Educação Física", "Enfermagem",
  "Engenharia Ambiental", "Engenharia Civil", "Engenharia de Produção",
  "Farmácia", "Geografia", "História", "Jornalismo", "Letras",
  "Matemática", "Medicina Veterinária", "Pedagogia", "Química",
  "Sistemas de Informação", "Zootecnia", "Outro",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
const formatTelefone = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd();
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────
const EditarPerfil = () => {
  const navigate          = useNavigate();
  const { user, updateUser } = useAuth(); // updateUser atualiza o contexto sem reload

  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  // ── Estado dos campos ────────────────────────────────────────────────────
  const [name,      setName]      = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [campus,    setCampus]    = useState("");
  const [cidade,    setCidade]    = useState("");
  const [matricula, setMatricula] = useState("");
  const [curso,     setCurso]     = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // ── Preenche com os dados atuais vindos do contexto ──────────────────────
  // Antes: lia localStorage + chamada manual com token
  // Agora: lê diretamente de useAuth — já está atualizado e não precisa de token manual
  useEffect(() => {
  const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success && result.data) {
          const userData = result.data;
          setName(userData.name || '');
          setAvatarUrl(userData.avatar_url || '');

          const p = userData.profile || {};
          setTelefone(p.telefone ? formatTelefone(p.telefone) : '');
          setCampus(p.campus || '');
          setCidade(p.cidade || '');
          setMatricula(p.matricula || '');
          setCurso(p.curso || '');
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };

    fetchProfile();
  }, []); // array vazio = executa apenas na montagem

  const handleCampusChange = (e) => {
    const selected = UNEMAT_CAMPUSES.find((c) => c.value === e.target.value);
    setCampus(e.target.value);
    setCidade(selected ? selected.cidade : "");
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("O nome não pode estar vazio.");
      return;
    }

    const finalAvatar = avatarUrl.trim() ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=150`;

    setLoading(true);
    try {
      // Chamada 1 — dados básicos (endpoint já existia)
      await api.put('/api/v1/users/me', {
        name:       name.trim(),
        avatar_url: finalAvatar,
      });

      // Chamada 2 — dados acadêmicos (ver endpoint no comentário ao final)
      await api.patch('/api/v1/users/me/profile', {
        telefone:  telefone.replace(/\D/g, "") || null,
        campus:    campus    || null,
        cidade:    cidade    || null,
        matricula: matricula || null,
        curso:     curso     || null,
      });

      // Atualiza o AuthContext sem recarregar a página
      // Antes: localStorage.setItem(...) + window.location.reload()
      // Agora: updateUser() notifica todos os componentes que consomem useAuth
      if (typeof updateUser === 'function') {
        updateUser({
          name: name.trim(),
          avatar_url: finalAvatar,
          profile: {
            telefone: telefone.replace(/\D/g, ""),
            campus,
            cidade,
            matricula: showMatricula ? matricula : null,
            curso: showCurso ? curso : null,
          },
        });
      }

      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => navigate('/usuario'), 1200);

    } catch (err) {
      const msg = err.response?.data?.detail || "Erro ao salvar. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const showMatricula = ["STUDENT", "PROFESSOR"].includes(user?.role);
  const showCurso     = user?.role === "STUDENT";

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Cabeçalho */}
        <div className={styles.card_header}>
          <button
            type="button"
            className={styles.btn_back}
            onClick={() => navigate('/usuario')}
          >
            <FiArrowLeft /> Voltar
          </button>
          <div>
            <h2>Editar Perfil</h2>
            <p>Atualize suas informações pessoais e acadêmicas</p>
          </div>
        </div>

        {/* Feedback */}
        {error   && <div className={styles.alert_error}>{error}</div>}
        {success && <div className={styles.alert_success}>{success}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── SEÇÃO: Dados Pessoais ──────────────────────────────── */}
          <div className={styles.section_divider}><span>Dados Pessoais</span></div>

          <div className={styles.avatar_row}>
            <img
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random&size=150`
              }
              alt="Preview do avatar"
              className={styles.avatar_preview}
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
            />
            <div className={styles.avatar_inputs}>
              <div className={styles.form_group}>
                <label htmlFor="ep_name"><FiUser /> Nome Completo</label>
                <input
                  id="ep_name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor="ep_avatar"><FiImage /> URL do Avatar</label>
                <input
                  id="ep_avatar"
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          {/* ── SEÇÃO: Dados Acadêmicos ────────────────────────────── */}
          <div className={styles.section_divider}><span>Dados Acadêmicos</span></div>

          <div className={styles.fields_grid}>

            <div className={styles.form_group}>
              <label htmlFor="ep_telefone"><FiPhone /> Telefone / WhatsApp</label>
              <input
                id="ep_telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
                autoComplete="tel"
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="ep_campus"><BsBuilding /> Campus / Polo</label>
              <select id="ep_campus" value={campus} onChange={handleCampusChange}>
                <option value="">Selecione o campus</option>
                {UNEMAT_CAMPUSES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.form_group}>
              <label htmlFor="ep_cidade"><FiMapPin /> Cidade</label>
              <input
                id="ep_cidade"
                type="text"
                value={cidade}
                readOnly
                className={styles.input_readonly}
                tabIndex="-1"
                placeholder="Preenchida conforme o campus"
              />
            </div>

            {showMatricula && (
              <div className={styles.form_group}>
                <label htmlFor="ep_matricula">
                  {user?.role === "STUDENT" ? "Matrícula" : "Nº Funcional"}
                </label>
                <input
                  id="ep_matricula"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder={user?.role === "STUDENT" ? "Número de matrícula" : "Número funcional"}
                  autoComplete="off"
                />
              </div>
            )}

            {showCurso && (
              <div className={styles.form_group}>
                <label htmlFor="ep_curso"><FiBook /> Curso</label>
                <select id="ep_curso" value={curso} onChange={(e) => setCurso(e.target.value)}>
                  <option value="">Selecione o curso</option>
                  {CURSOS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className={styles.form_actions}>
            <button
              type="button"
              className={styles.btn_cancel}
              onClick={() => navigate('/usuario')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.btn_save} disabled={loading}>
              <FiSave /> {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;