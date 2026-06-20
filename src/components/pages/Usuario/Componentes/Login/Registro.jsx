import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./Registro.css";
import { authService } from "../../../../../services/authService";
import useAuth from "../../../../../hooks/useAuth";

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

  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  const initialRole = (roleFromUrl && ['STUDENT', 'PROFESSOR', 'REVISOR'].includes(roleFromUrl))
    ? roleFromUrl
    : 'STUDENT';
    
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState(""); // Texto livre
  const [campus, setCampus] = useState(""); // Instituição vinculada como texto livre

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword || !cpf) {
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

    setLoading(true);
    try {
      const result = await authService.register({
        name,
        email,
        password,
        role,
        cpf: cpf.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        cidade: cidade || null,
        campus: campus || null, // A instituição enviada pelo usuário
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

            {/* ── COLUNA 2: DADOS ACADÊMICOS / FUNÇÃO ──────────────────── */}
            <div className="form-column">
              <h3 className="section-title">Dados Profissionais</h3>

              <div className="input-group">
                <label htmlFor="role">Função<span className="required">*</span></label>
                <select
                  id="role"
                  className="custom-select"
                  value={role}
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <option value="STUDENT">Elaborador</option>
                  <option value="REVISOR">Revisor</option>
                </select>
              </div>

              {/* INSTITUIÇÃO VINCULADA - Transformado num campo de digitação livre */}
              <div className="input-group">
                <label htmlFor="campus">Instituição vinculada</label>
                <input
                  id="campus"
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="Digite o nome da instituição"
                  disabled={loading}
                />
              </div>

              {/* CIDADE - Transformado num campo de digitação livre */}
              <div className="input-group">
                <label htmlFor="cidade">Cidade</label>
                <input
                  id="cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Digite o nome da sua cidade"
                  disabled={loading}
                />
              </div>

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