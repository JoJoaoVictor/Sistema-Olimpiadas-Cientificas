import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Ícones de olho
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css"; // Reutiliza o CSS moderno do Login
import { authService } from "../../../../../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pega o token da URL
  const token = searchParams.get("token");

  // Estados
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Ver senha
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou ausente. Solicite uma nova recuperação.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
        setError("A senha deve ter no mínimo 8 caracteres.");
        return;
    }

    setLoading(true);

    try {
        const result = await authService.resetPassword(token, password);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } else {
            // Tratamento de erro robusto
            let msg = result.error;
            if (typeof msg === 'object') {
                if (Array.isArray(msg) && msg.length > 0) {
                    msg = msg[0].msg || JSON.stringify(msg);
                } else if (msg.detail) {
                    msg = msg.detail;
                } else {
                    msg = JSON.stringify(msg);
                }
            }
            setError(String(msg));
        }
    } catch (err) {
        setError("Ocorreu um erro inesperado.");
    }
    
    setLoading(false);
  };

  // TELA DE SUCESSO (Renderizada dentro do Card também)
  if (success) {
      return (
        <div className="login-page">
            <div className="login-card" style={{ textAlign: "center", padding: "60px 40px" }}>
                <h2 style={{ color: "#00935F", marginBottom: "20px" }}>Sucesso!</h2>
                <p style={{ color: "#333", fontSize: "16px" }}>Sua senha foi redefinida com sucesso.</p>
                <p style={{ color: "#666", fontSize: "14px", marginTop: "10px" }}>Redirecionando para o login...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="login-page">
      {/* Logo opcional fora do card */}
      {/* <h1 className="brand-logo">SeuLogo</h1> */}

      <div className="login-card">
        <h2>Criar nova senha</h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "30px" }}>
           Digite sua nova senha abaixo.
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* Mensagens de Erro */}
          {error && <div className="error-message">{error}</div>}
          {!token && <div className="error-message">Link inválido. Tente solicitar novamente.</div>}

          {/* NOVA SENHA */}
          <div className="input-group">
            <label htmlFor="password">Nova Senha</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || !token}
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
            <label htmlFor="confirmPassword">Confirme a senha</label>
            <div className="password-wrapper">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                required
              />
               {/* Opcional: Segundo botão de olho, ou controla ambos com o de cima */}
            </div>
          </div>

          {/* BOTÃO */}
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading || !token}
          >
            {loading ? "Salvando..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;