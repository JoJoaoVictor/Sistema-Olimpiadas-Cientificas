import { useEffect, useState } from "react";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Registro.css";
import Select from "../../../../../components/form/Select";
import useAuth from "../../../../../hooks/useAuth";

const Registro = () => {
  const { registro } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [usernameConf, setUsernameConf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  // Buscar categorias (professor, aluno)
  useEffect(() => {
    fetch("http://localhost:5001/categories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((resp) => {
        if (!resp.ok) throw new Error("Erro ao buscar categorias");
        return resp.json();
      })
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
      });
  }, []);

  // Envio do formulário
  const handleRegistro = (e) => {
    e.preventDefault();

    if (!username || !usernameConf || !password || !categoryId) {
      setError("Preencha todos os campos");
      return;
    }

    if (username !== usernameConf) {
      setError("Os e-mails não são iguais");
      return;
      
    }
    const res = registro(username, password);
    if (res) {
      setError(res);
      return;
    }
    const newUser = {
      username,
      password,
      categoryId: parseInt(categoryId),
      createdAt: new Date().toISOString()
   
    };

    fetch("http://localhost:5001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error("Erro ao cadastrar usuário");
        }
        return resp.json();
      })
      .then((data) => {
        console.log("Usuário salvo:", data);
        alert("Usuário cadastrado com sucesso!");
        navigate("/login");
      })
      .catch((err) => {
        console.error("Erro no registro:", err);
        setError("Erro ao cadastrar. Tente novamente.");
      });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="background">
      <div className="container" style={{ marginInlineEnd: "auto",
          marginInlineStart: "auto",
          marginTop: "40px", }}>
        <form onSubmit={handleRegistro}>
          <h1>Cadastro</h1>

          {error && <p className="error-message">{error}</p>}

          <div className="input-field">
            <input
              type="text"
              placeholder="Digite seu E-mail @unemat.br"
              required
              value={username}
              onChange={(e) => [setUsername(e.target.value), setError("")]}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type="text"
              placeholder="Confirme o E-mail"
              required
              value={usernameConf}
              onChange={(e) => [setUsernameConf(e.target.value), setError("")]}
            />
            <FaUser className="icon" />
          </div>

          <div className="input-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua Senha"
              required
              value={password}
              onChange={(e) => [setPassword(e.target.value), setError("")]}
            />
            <span
              className="password-toggle"
              onClick={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-field" style={{ color:"white", marginBottom: "50px"}}>
            <Select
              name="category_id"
              text="Selecione seu perfil "
              options={categories}
              value={categoryId}
              handleOnChange={(e) => setCategoryId(e.target.value)}
            />
          </div>

          <div className="signup-link">
            <p>
              Já possui conta? <Link to="/login">&nbsp;Login</Link>
            </p>
          </div>

          <button type="submit"onClick={handleRegistro}>Cadastrar email</button>
        </form>
      </div>
    </div>
  );
};

export default Registro;
