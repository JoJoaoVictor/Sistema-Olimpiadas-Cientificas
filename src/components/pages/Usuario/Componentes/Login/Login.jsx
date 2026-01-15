import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importar ícones de olho
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../../../../img/logov2-fotor.png";
import useAuth from "../../../../../hooks/useAuth"; 
import { authService } from "../../../../../services/authService";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar senha

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

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);
      const result = await authService.loginWithGoogle(credentialResponse.credential);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError("Erro no login com Google");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "1095631680198-osc0a7pdlkler2napk9iakp42p3r3if2.apps.googleusercontent.com",
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
          width:"365px", /* Opcional: Tenta forçar uma largura específica */
          theme:"filled_black", /* Opcional: Estilo do botão */
          shape:"pill", /* Opcional: Arredondado */
          fontWeight: "600"
          

        }
      );
    }
  }, []);

  return (
    <div className="login-page">
      {/* Se tiver uma logo do seu sistema, coloque aqui fora do card */}
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

          {/* Divisor OU */}
          <div className="divider">
            <span>OU</span>
          </div>

          {/* Google Login Wrapper */}
          <div className="social-login">
            <div id="google-btn" style={{ width: "100%" }}></div>
            {/* Se tiver botão da Apple, adicione aqui */}
          </div>
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