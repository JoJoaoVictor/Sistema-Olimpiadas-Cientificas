import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";
import { authService } from "../../../../../services/authService";

const Registro = () => {
  const navigate = useNavigate();

  // =========================
  // ESTADOS DO FORMULÁRIO
  // =========================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");

  // UX
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // SUBMIT DO REGISTRO
  // =========================
  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    // ===== VALIDAÇÕES FRONT =====
    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios");
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
      });

      if (!result?.success) {
        setError(result?.error || "Erro ao cadastrar usuário");
        return;
      }

      // Sucesso
      navigate("/");
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

        <form onSubmit={handleRegistro}>
          {/* ERRO */}
          {error && <div className="error-message">{error}</div>}

          {/* NOME */}
          <div className="input-group">
            <label htmlFor="name">Nome completo <span className="required">*</span></label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label htmlFor="email">E-mail <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* SENHA */}
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

          {/* CONFIRMAR SENHA */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar senha <span className="required">*</span></label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
               {/* Opcional: Repetir o ícone ou deixar sem, já que o de cima controla ambos ou individualmente */}
            </div>
          </div>

          {/* PERFIL */}
          <div className="input-group">
            <label htmlFor="role">Eu sou... <span className="required">*</span></label>
            <select
              id="role"
              className="custom-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
            >
              <option value="STUDENT">Estudante</option>
              <option value="PROFESSOR">Professor</option>
              <option value="REVISOR">Revisor</option>
            </select>
          </div>

          {/* BOTÃO */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>
        </form>
      </div>

      {/* LINK LOGIN - Fora do card */}
      <div className="register-footer-link">
        <p>
          Já possui uma conta? <Link to="/login">Fazer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;