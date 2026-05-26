import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../../../../img/logov2-fotor.png";
import useAuth from "../../../../../hooks/useAuth"; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    const errorMessage = await login(email, password);

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    navigate("/");
    window.location.reload();
  };

  return (
    <div className="login-page">
      <h1 className="brand-logo"><img src={logo} alt="Logo" /></h1> 

      <div className="login-card">
        <h2>Iniciar sessão</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {/* Input Email */}
          <div className="input-group">
            <label htmlFor="email">Endereço de e-mail <span className="required">*</span></label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Input Senha */}
          <div className="input-group">
            <label htmlFor="password">Senha <span className="required">*</span></label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Botão Principal */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sessão"}
          </button>
        </form>
      </div>

      {/* Links do Rodapé (Fora do Card) */}
      <div className="login-footer-links">
        <Link to="/register">Crie uma conta</Link>
        <Link to="/forgot-password">Esqueci minha senha</Link>
      </div>
    </div>
  );
};

export default Login;