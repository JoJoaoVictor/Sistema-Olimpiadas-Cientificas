import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import useAuth from "../../../../../hooks/useAuth";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode"; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handle de login tradicional
  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin();
    console.log("Dados de Login:", { username, password });
  };

  const handleLogin = () => {
    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const res = login(username, password);
    if (res) {
      setError(res);
      return;
    }

     const token = Math.random().toString(36).substring(2);
  localStorage.setItem("user_token", JSON.stringify({
    username,
    name: username.split("@")[0], // ou busque o nome real se tiver
    picture: "https://www.w3schools.com/howto/img_avatar.png", // <- imagem padrão
    token
  }));
    navigate("/");
    window.location.reload();
  };

  // Login com Google
    const handleGoogleLogin = (credentialResponse) => {
      try {
        // Decodifica o token JWT
        const decoded = jwtDecode(credentialResponse.credential);

        const email = decoded.email;
        const name = decoded.name;

        console.log("Usuário Google:", { email, name });

        // Armazena no localStorage com formato compatível com seu contexto
        const token = Math.random().toString(36).substring(2); 
        localStorage.setItem("user_token", JSON.stringify({
          username: decoded.email,
          name: decoded.name,
          picture: decoded.picture || decoded.imageUrl || "https://www.w3schools.com/howto/img_avatar.png",
          token
        }));
        

        // Define um usuário fake (não precisa senha aqui)
        localStorage.setItem("users_bd", JSON.stringify([{ username: email, password: "google_auth" }]));

        // Redireciona
        navigate("/");
        window.location.reload();

      } catch (err) {
        console.error("Erro ao decodificar o token Google:", err);
        setError("Erro no login com Google");
      }
    };

  return (
    <div className="background">
      <div className="container" style={{ marginInline: 'auto', marginTop: '90px' }}>
        <form onSubmit={handleSubmit}>
          <h1>Acessar sistema</h1>
          {error && <p className="error-message">{error}</p>}

          <div className="input-field">
            <input
              type="text"
              placeholder="@unemat.br"
              required
              value={username}
              onChange={(e) => [setUsername(e.target.value), setError("")]}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => [setPassword(e.target.value), setError("")]}
            />
            <FaLock className="icon" />
          </div>

          <div className="recall-forget">
            <label>
              <input type="checkbox" /> Lembre de mim
            </label>
            <a href="#">Esqueceu a senha?</a>
          </div>

          <button type="submit" onClick={handleLogin}>Entrar</button>

          <div className="google-button" style={{ marginTop: "20px" }}>
            <GoogleOAuthProvider clientId="1095631680198-hcaqmakiotpccdo5osvs811a0c33v2bl.apps.googleusercontent.com">
              <GoogleLogin 
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.log("Login com Google falhou");
                  setError("Erro no login com Google");
                }}
              />
            </GoogleOAuthProvider>
          </div>

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
