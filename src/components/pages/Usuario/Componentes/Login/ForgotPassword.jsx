import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Login.css"; // Reusa o mesmo CSS
import { authService } from "../../../../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // Sucesso
  const [error, setError] = useState("");     // Erro
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

    const result = await authService.forgotPassword(email);

    if (result.success) {
      setMessage("Se o e-mail existir, enviamos as instruções.");
      setEmail(""); // Limpa o campo
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="background">
      <div className="container" style={{ marginInline: "auto", marginTop: "90px" }}>
        <form onSubmit={handleSubmit}>
          <h1>Recuperar Senha</h1>
          <p style={{ textAlign: "center", color: "#fff", marginBottom: "20px", fontSize: "0.9rem" }}>
            Digite seu e-mail para receber o link de redefinição.
          </p>

          {/* Mensagens de Feedback */}
          {error && <p className="error-message">{error}</p>}
          {message && <p style={{ color: "#4caf50", textAlign: "center", marginBottom: "15px" }}>{message}</p>}

          {/* Campo Email */}
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <FaEnvelope className="icon" />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Link"}
          </button>

          <div className="signup-link">
            <p>
              Lembrou a senha? <Link to="/login">Voltar ao Login</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;