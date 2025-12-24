import { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css"; 
import { authService } from "../../../../../services/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pega o token da URL
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
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

    if (password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setLoading(true);

    const result = await authService.resetPassword(token, password);

    if (result.success) {
      setSuccess(true);
      // Redireciona para o login após 3 segundos
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (success) {
      return (
        <div className="background">
            <div className="container" style={{ marginInline: "auto", marginTop: "90px", textAlign: "center", color: "white" }}>
                <h1>Sucesso!</h1>
                <p>Sua senha foi alterada.</p>
                <p>Redirecionando para o login...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="background">
      <div className="container" style={{ marginInline: "auto", marginTop: "90px" }}>
        <form onSubmit={handleSubmit}>
          <h1>Nova Senha</h1>

          {error && <p className="error-message">{error}</p>}
          {!token && <p className="error-message">Link inválido. Tente solicitar novamente.</p>}

          {/* Nova Senha */}
          <div className="input-field">
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !token}
              required
            />
            <FaLock className="icon" />
          </div>

          {/* Confirmar Senha */}
          <div className="input-field">
            <input
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
              required
            />
            <FaLock className="icon" />
          </div>

          <button type="submit" disabled={loading || !token}>
            {loading ? "Alterando..." : "Alterar Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;