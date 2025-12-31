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

    try {
        // Passamos o token e a senha.
        // O authService deve formatar isso corretamente para { token: "...", new_password: "..." }
        const result = await authService.resetPassword(token, password);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } else {
            // --- PROTEÇÃO CONTRA CRASH DO REACT ---
            // Se o erro for um objeto ou array (comum no 422), transformamos em texto
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
            setError(String(msg)); // Garante que é string
        }
    } catch (err) {
        setError("Ocorreu um erro inesperado.");
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

          {/* O erro agora é renderizado com segurança */}
          {error && <p className="error-message">{error}</p>}
          {!token && <p className="error-message">Link inválido. Tente solicitar novamente.</p>}

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