import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";
import { authService } from "../../../../../services/authService";
import useAuth from "../../../../../hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Constante atualizada com o nome da instituição para diferenciar da cidade
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

  // Cidades do Primeiro Bloco de Texto
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
  "Administração", "Agronomia", "Biologia", "Ciência da Computação", "Ciências Contábeis",
  "Direito", "Educação Física", "Enfermagem", "Engenharia Ambiental", "Engenharia Civil",
  "Engenharia de Produção", "Farmácia", "Geografia", "História", "Jornalismo", "Letras",
  "Matemática", "Medicina Veterinária", "Pedagogia", "Química", "Sistemas de Informação",
  "Zootecnia", "Outro"
];

const formatCPF = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const formatTelefone = (value) => {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trimEnd();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trimEnd();
};

const validateCPF = (cpf) => {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  if (r !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = 11 - (sum % 11);
  if (r >= 10) r = 0;
  return r === parseInt(d[10]);
};

const Registro = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [campus, setCampus] = useState("");
  const [cidade, setCidade] = useState("");
  const [matricula, setMatricula] = useState("");
  const [curso, setCurso] = useState("");

  const handleCampusChange = (e) => {
    const selected = UNEMAT_CAMPUSES.find((c) => c.value === e.target.value);
    setCampus(e.target.value);
    setCidade(selected ? selected.cidade : "");
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setMatricula("");
    setCurso("");
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword || !cpf || !campus) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    if (!validateCPF(cpf)) {
      setError("CPF inválido. Verifique o número digitado.");
      return;
    }
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if ((role === "STUDENT" || role === "PROFESSOR") && !matricula) {
      setError("Matrícula é obrigatória para Estudante e Professor");
      return;
    }
    if (role === "STUDENT" && !curso) {
      setError("Selecione o curso");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register({
        name,
        email,
        password,
        role,
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        campus,
        cidade,          
        matricula,
        curso,
      });

      if (!result?.success) {
        setError(result?.error || "Erro ao cadastrar usuário");
        return;
      }
      
      if (result.success) {
        if (typeof updateUser === 'function' && result.data?.user) {
          updateUser(result.data.user);
        }
        navigate("/");
      }
    } catch (err) {
      console.error("Erro no registro:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Criar uma conta</h2>
        <p className="subtitle">Preencha seus dados para começar</p>

        <form onSubmit={handleRegistro} autoComplete="on">
          {error && <div className="error-message">{error}</div>}

          <div className="form-columns">
            
            {/* ── COLUNA 1: DADOS PESSOAIS ─────────────────────────────── */}
            <div className="form-column">
              <h3 className="section-title">Dados Pessoais</h3>

              <div className="input-group">
                <label htmlFor="name">Nome completo <span className="required">*</span></label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="email">E-mail <span className="required">*</span></label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="cpf">CPF <span className="required">*</span></label>
                <input
                  id="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  disabled={loading}
                  autoComplete="off"
                  inputMode="numeric"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="telefone">Telefone / WhatsApp</label>
                <input
                  id="telefone"
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  disabled={loading}
                  autoComplete="tel"
                  inputMode="numeric"
                />
              </div>

              <div className="input-group">
                <label htmlFor="password">Senha <span className="required">*</span></label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar senha <span className="required">*</span></label>
                <div className="password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── COLUNA 2: DADOS ACADÊMICOS ───────────────────────────── */}
            <div className="form-column">
              <h3 className="section-title">Dados Acadêmicos</h3>

              <div className="input-group">
                <label htmlFor="role">Eu sou... <span className="required">*</span></label>
                <select
                  id="role"
                  className="custom-select"
                  value={role}
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <option value="STUDENT">Estudante</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="REVISOR">Revisor</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="campus">Campus / Polo <span className="required">*</span></label>
                <select
                  id="campus"
                  className="custom-select"
                  value={campus}
                  onChange={handleCampusChange}
                  disabled={loading}
                  required
                >
                  <option value="">Selecione o campus</option>
                  {UNEMAT_CAMPUSES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CIDADE (Fixada na raiz da coluna para estar disponível a todos os cargos) */}
              <div className="input-group">
                <label htmlFor="cidade">Cidade</label>
                <input
                  id="cidade"
                  type="text"
                  value={cidade}
                  readOnly
                  className="input-readonly"
                  tabIndex="-1"
                  placeholder="Preenchida conforme o campus"
                />
              </div>

              {/* MATRÍCULA */}
              {(role === "STUDENT" || role === "PROFESSOR") && (
                <div className="input-group">
                  <label htmlFor="matricula">
                    {role === "STUDENT" ? "Matrícula" : "Nº Funcional"}
                    <span className="required"> *</span>
                  </label>
                  <input
                    id="matricula"
                    type="text"
                    placeholder={
                      role === "STUDENT" ? "Número de matrícula do aluno" : "Número funcional"
                    }
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    disabled={loading}
                    autoComplete="off"
                    required
                  />
                </div>
              )}

              {/* CURSO */}
              {role === "STUDENT" && (
                <div className="input-group">
                  <label htmlFor="curso">Curso <span className="required">*</span></label>
                  <select
                    id="curso"
                    className="custom-select"
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <option value="">Selecione o curso</option>
                    {CURSOS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* O botão de cadastro agora fica fixado corretamente na base da segunda coluna */}
              <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "Criando conta..." : "Cadastrar"}
              </button>
            </div>

          </div>
        </form>
      </div>

      <div className="register-footer-link">
        <p>Já possui uma conta? <Link to="/login">Fazer Login</Link></p>
      </div>
    </div>
  );
};

export default Registro;