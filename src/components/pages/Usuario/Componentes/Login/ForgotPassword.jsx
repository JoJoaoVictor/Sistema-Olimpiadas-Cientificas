import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // Usa o CSS moderno do Login
import { authService } from "../../../../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // Feedback de Sucesso
  const [error, setError] = useState("");     // Feedback de Erro
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, digite seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        setMessage("Se o e-mail estiver cadastrado, enviamos um link de redefinição.");
        setEmail(""); // Limpa o campo para evitar múltiplos envios acidentais
      } else {
        // Tenta extrair a mensagem de erro de forma segura
        const msg = result.error || "Erro ao processar solicitação.";
        setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Recuperar Senha</h2>
        
        <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "25px" }}>
           Digite o e-mail associado à sua conta e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit}>
          
          {/* === ÁREA DE MENSAGENS === */}
          
          {/* Erro (Box Vermelho - classe do Login.css) */}
          {error && <div className="error-message">{error}</div>}
          
          {/* Sucesso (Box Verde - estilo inline para complementar o CSS existente) */}
          {message && (
            <div style={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              border: "1px solid #c8e6c9",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px"
            }}>
              {message}
            </div>
          )}

          {/* === INPUT DE EMAIL === */}
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* === BOTÃO DE ENVIO === */}
          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar Link de Recuperação"}
          </button>
        </form>

        {/* === LINK PARA VOLTAR === */}
        <div className="login-footer-links" style={{ justifyContent: "center", marginTop: "20px" }}>
            <Link to="/login" style={{ fontSize: "14px", fontWeight: "600", color: "#1f1f1f" }}>
               &larr; Voltar para o Login
            </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;