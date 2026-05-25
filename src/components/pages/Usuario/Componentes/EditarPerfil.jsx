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

const formatTelefone = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd();
};

const EditarPerfil = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  // ── Estado dos campos (A cidade foi removida daqui de forma intencional) ──
  const [name,      setName]      = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [campus,    setCampus]    = useState("");
  const [matricula, setMatricula] = useState("");
  const [curso,     setCurso]     = useState("");

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // 🌟 FONTE ÚNICA DA VERDADE: A cidade passa a ser derivada em tempo real do campus selecionado
  const cidade = UNEMAT_CAMPUSES.find((c) => c.value === campus)?.cidade || "";

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
          setMatricula(p.matricula || '');
          setCurso(p.curso || '');

          // 🌟 NORMALIZAÇÃO AVANÇADA: Trata strings cruas vindas do banco de dados
          if (p.campus) {
            // Remove prefixos comuns como "UNEMAT - " ou "Polo - " caso existam salvos incorretamente
            let rawCampus = p.campus.replace(/^(UNEMAT\s*-\s*|Polo\s*-\s*)/i, "");
            
            // Substitui espaços por underline, remove acentos básicos e joga para maiúsculas
            let sanitized = rawCampus
              .trim()
              .toUpperCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove acentos temporariamente para dar match no value
              .replace(/\s+/g, '_');

            // Caso o banco traga o label textual, tentamos encontrar pelo label correspondente
            const matchByLabel = UNEMAT_CAMPUSES.find(
              c => c.label.toUpperCase() === p.campus.toUpperCase() || c.value === sanitized
            );

            setCampus(matchByLabel ? matchByLabel.value : sanitized);
          } else {
            setCampus('');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleCampusChange = (e) => {
    setCampus(e.target.value);
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
      // 🌟 UNIFICAÇÃO: Enviamos tudo em uma única chamada PUT, exatamente como o backend espera
      const response = await api.put('/api/v1/users/me', {
        name: name.trim(),
        avatar_url: finalAvatar,
        profile: {
          telefone: telefone.replace(/\D/g, "") || null,
          campus: campus || null,
          cidade: cidade !== "—" ? cidade : null, // Envia o nome real da cidade (ex: "Tangará da Serra")
          matricula: matricula || null,
          curso: curso || null,
        }
      });

      // Se o contexto tiver a função de atualização, notificamos o app com os dados retornados do servidor
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

  const showMatricula = ["STUDENT", "PROFESSOR"].includes(user?.role);
  const showCurso     = user?.role === "STUDENT";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.card_header}>
          <button type="button" className={styles.btn_back} onClick={() => navigate('/usuario')}>
            <FiArrowLeft /> Voltar
          </button>
          <div>
            <h2>Editar Perfil</h2>
            <p>Atualize suas informações pessoais e acadêmicas</p>
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