import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiMapPin, FiBook, FiSave, FiArrowLeft, FiImage } from 'react-icons/fi';
import { BsBuilding } from 'react-icons/bs';
import useAuth from '../../../../hooks/useAuth';
import api from '../../../../services/api';
import styles from './EditarPerfil.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes restauradas para garantir a edição dos usuários antigos
// ─────────────────────────────────────────────────────────────────────────────
const UNEMAT_CAMPUSES = [
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
  { value: "ALTO_PARAGUAI",         label: "Polo - Alto Paraguai",          cidade: "Alto Paraguai" },
  { value: "NORTELANDIA",           label: "Polo - Nortelândia",            cidade: "Nortelândia" },
  { value: "NOVA_MARILANDIA",       label: "Polo - Nova Marilândia",        cidade: "Nova Marilândia" },
  { value: "NOVA_OLIMPIA",          label: "Polo - Nova Olímpia",           cidade: "Nova Olímpia" },
  { value: "PORTO_ESTRELA",         label: "Polo - Porto Estrela",          cidade: "Porto Estrela" },
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

const formatTelefone = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd();
};

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  // ── Estado dos campos ──
  const [name,      setName]      = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [cidade,    setCidade]    = useState(""); 
  
  // Estados antigos (restaurados)
  const [campus,    setCampus]    = useState("");
  const [matricula, setMatricula] = useState("");
  const [curso,     setCurso]     = useState("");

  // ── Flags de exibição condicional (Se o dado veio do banco, a flag é true) ──
  const [hasCampus,    setHasCampus]    = useState(false);
  const [hasMatricula, setHasMatricula] = useState(false);
  const [hasCurso,     setHasCurso]     = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

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
          setCidade(p.cidade || '');

          // Se o usuário tem campus salvo, ativamos a flag de exibição
          if (p.campus) {
            setHasCampus(true);
            setCampus(p.campus);
          }
          
          if (p.matricula) {
            setHasMatricula(true);
            setMatricula(p.matricula);
          }
          
          if (p.curso) {
            setHasCurso(true);
            setCurso(p.curso);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleCampusChange = (e) => {
    const campusValue = e.target.value;
    const selected = UNEMAT_CAMPUSES.find((c) => c.value === campusValue);
    setCampus(campusValue);
    setCidade(selected ? selected.cidade : "");
  };

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
      const response = await api.put('/api/v1/users/me', {
        name: name.trim(),
        avatar_url: finalAvatar,
        profile: {
          telefone: telefone.replace(/\D/g, "") || null,
          cidade: cidade.trim() || null,
          campus: campus || null,
          matricula: matricula || null,
          curso: curso || null,
        }
      });

      if (typeof updateUser === 'function' && response.data?.data) {
        const serverData = response.data.data;
        updateUser(serverData);
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card_header}>
          <button type="button" className={styles.btn_back} onClick={() => navigate('/usuario')}>
            <FiArrowLeft /> Voltar
          </button>
          <div>
            <h2>Editar Perfil</h2>
            <p>Atualize suas informações pessoais e de contato</p>
          </div>
        </div>

        {error   && <div className={styles.alert_error}>{error}</div>}
        {success && <div className={styles.alert_success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.section_divider}><span>Dados Pessoais</span></div>

          <div className={styles.avatar_row}>
            <img
              src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "U")}&background=random&size=150`}
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

          <div className={styles.section_divider}><span>Localização e Dados Acadêmicos</span></div>

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

            {/* EXIBIÇÃO CONDICIONAL DO CAMPUS E CIDADE */}
            {hasCampus ? (
              <>
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
              </>
            ) : (
              <div className={styles.form_group}>
                <label htmlFor="ep_cidade"><FiMapPin /> Cidade</label>
                <input
                  id="ep_cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite o nome da sua cidade"
                />
              </div>
            )}

            {/* EXIBIÇÃO CONDICIONAL DA MATRÍCULA (Apenas se já tinha salvo) */}
            {hasMatricula && (
              <div className={styles.form_group}>
                <label htmlFor="ep_matricula">Matrícula / Nº Funcional</label>
                <input
                  id="ep_matricula"
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {/* EXIBIÇÃO CONDICIONAL DO CURSO (Apenas se já tinha salvo) */}
            {hasCurso && (
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

          <div className={styles.form_actions}>
            <button type="button" className={styles.btn_cancel} onClick={() => navigate('/usuario')} disabled={loading}>
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