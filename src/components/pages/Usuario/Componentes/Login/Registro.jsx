import { useState } from "react";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
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
    if (!name || !email || !password ) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
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

      // Backend faz login automático
      navigate("/");

    } catch (err) {
      console.error("Erro no registro:", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TOGGLE VISIBILIDADE SENHA
  // =========================
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="background">
      <div className="container" style={{ marginInline: "auto", marginTop: "40px" }}>
        <form onSubmit={handleRegistro}>
          <h1>Cadastro</h1>

          {/* ERRO */}
          {error && <p className="error-message">{error}</p>}

          {/* NOME */}
          <div className="input-field">
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
            <FaUser className="icon" />
          </div>

          {/* EMAIL */}
          <div className="input-field">
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
            <FaUser className="icon" />
          </div>

          {/* SENHA */}
          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha (mín. 8 caracteres)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* CONFIRMAR SENHA */}
          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
          </div>

          {/* PERFIL */}
          <div className="input-field select-field">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: "40px",
                border: "2px solid rgba(255, 255, 255, 0.6)",
                backgroundColor: "transparent",
                color: "white",
                fontSize: "16px",
            
                outline: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              <option value="" disabled style={{ color: "#555" }}>
                Selecione o tipo de perfil
              </option>

              <option value="PROFESSOR" style={{ color: "black" }}>
                Professor
              </option>
              <option value="STUDENT" style={{ color: "black" }}>
                Estudante
              </option>
              <option value="REVISOR" style={{ color: "black" }}>
                Revisor
              </option>
            </select>
          </div>

          {/* BOTÃO */}
          <button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button> 
           {/* LINK LOGIN */}
          <div className="signup-link">
            <p>
              Já possui conta? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
