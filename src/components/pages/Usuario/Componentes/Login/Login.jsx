import { useState, useEffect } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
// Hook de autenticação (centraliza login / estado global)
import useAuth from "../../../../../hooks/useAuth";

// Service direto (Google Login passa pelo backend)
import { authService } from "../../../../../services/authService";

const Login = () => {
  const { login } = useAuth(); // login(email, password)
  const navigate = useNavigate();

  // Estados do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UX
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Login tradicional (email + senha)
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validação básica
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);

    /**
     * useAuth.login retorna:
     * - null → sucesso
     * - string → mensagem de erro
     */
    const errorMessage = await login(email, password);

    if (errorMessage) {
      setError(errorMessage);
      setLoading(false);
      return;
    }

    // Login OK
    navigate("/");
     window.location.reload();
  };

  /**
   * Login com Google (OAuth via BACKEND)
   * credentialResponse.credential vem do Google Identity
   */
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      setLoading(true);

      const result = await authService.loginWithGoogle(
        credentialResponse.credential //  enviado ao backend
      );
      // Verifica erros
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Login OK
      navigate("/");
      window.location.reload();
    } catch (err) {
      setError("Erro no login com Google");
      setLoading(false);
    }
  };
  // Inicializa o botão do Google Identity
    useEffect(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "1095631680198-osc0a7pdlkler2napk9iakp42p3r3if2.apps.googleusercontent.com",
          callback: handleGoogleLogin,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-btn"),
          {
            theme: "outline",
            size: "large",
            width: 250,
          }
        );
      }
    }, []);

// Renderização do componente
  return (
    <div className="background">
      <div
        className="container"
        style={{ marginInline: "auto", marginTop: "90px" }}
      >
        <form onSubmit={handleSubmit}>
          <h1>Acessar sistema</h1>

          {/* Mensagem de erro */}
          {error && <p className="error-message">{error}</p>}

          {/* Email */}
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
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

          {/* Senha */}
          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              required
            />
            <FaLock className="icon" />
          </div>

          {/* Lembrar / Esqueceu senha */}
          <div className="recall-forget">
            <label>
              <input type="checkbox" disabled={loading} /> Lembre de mim
            </label>
            <Link to="/forgot-password">Esqueceu a senha?</Link>
          </div>

          {/* Botão Login */}
          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Google Login (renderizado via script Google Identity) */}
          {/* Aqui você só liga o callback handleGoogleLogin */}
          {/* O botão em si vem do Google */}
          {/* Exemplo: google.accounts.id.initialize(...) */}
              {/* 🔐 Login com Google */}
            <div
                id="google-btn"
                style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
              ></div>
          {/* Cadastro */}
          <div className="signup-link">
            <p>
              Ainda não possui uma conta?
              <Link to="/register">&nbsp;Cadastre-se</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
