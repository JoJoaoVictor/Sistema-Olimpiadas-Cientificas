import styles from "./Usuario.module.css"; 
import useAuth from "../../../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Ícones
import { FiLogOut } from "react-icons/fi";
import { RiLock2Line } from "react-icons/ri";
import { BsPencil } from 'react-icons/bs';

function Usuario() {
  const { signout } = useAuth();
  const navigate = useNavigate();

  // Estados para armazenar os dados do perfil
  const [name, setName] = useState("Usuário");
  const [email, setEmail] = useState("Carregando...");
  const [profilePic, setProfilePic] = useState("https://via.placeholder.com/150"); 
  const [role, setRole] = useState("Professor"); // Exemplo de cargo

  useEffect(() => {
    // 1. Recupera o objeto salvo pelo authService no Login
    const storedData = localStorage.getItem("user_token");

    if (storedData) {
      try {
        // O authService agora salva um JSON: { user: {...}, access_token: "..." }
        const parsedData = JSON.parse(storedData);

        // Verifica se existe a propriedade 'user' dentro do objeto salvo
        if (parsedData.user) {
          const user = parsedData.user;
          
          setName(user.name || "Usuário sem nome");
          setEmail(user.email || "Email não disponível");
          setRole(user.role || "Professor");
          
          // Se tiver foto salva, usa. Se não, mantém o placeholder padrão.
          if (user.picture || user.avatar_url) {
            setProfilePic(user.picture || user.avatar_url);
          }
        } 
      } catch (error) {
        console.error("Erro ao ler dados do usuário:", error);
        // Se der erro no JSON.parse, os dados estão corrompidos ou no formato antigo.
        // O logout forçado abaixo ajuda a limpar isso.
      }
    }
  }, []);

  // Função de Logout com navegação segura
  const handleLogout = () => {
    signout();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <h2>Perfil do Usuário</h2>
      
      <div className={styles.user_img}>
        {/* Imagem de Perfil com tratamento de erro e estilo inline corrigido */}
        <img 
          style={{ 
            width: "120px", 
            height: "120px", 
            borderRadius: "50%", 
            objectFit: "cover",
            border: "3px solid #f0f0f0" // Adicionei uma borda sutil para destaque
          }} 
          src={profilePic} 
          alt="Imagem de perfil"
          onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} // Fallback caso a imagem quebre
        />
        
        <div className={styles.user_text}>
          {/* Nome do Usuário */}
          <p style={{ marginTop: "20px", fontWeight: "bold", fontSize: "1.3rem" }}>
            {name}
          </p> 
          
          {/* Cargo / ID */}
          <p className={styles.user_text} style={{ color: "#666" }}>
            ID: <strong>{role}</strong>
          </p>
          
          {/* Botão Alterar Senha */}
          <div className={styles.bnt}>
            <Link className={styles.bnt_password} to={`/alterar-senha`}>
              <RiLock2Line style={{ marginRight: "5px" }}/> Alterar Senha
            </Link>
          </div>
        </div>

        {/* Botão Editar (Posicionado ao lado ou abaixo, dependendo do CSS) */}
        <div className={styles.bnt}>
          <Link className={styles.bnt_edit} to={`/editar-perfil`}>
            <BsPencil style={{ marginRight: "5px" }}/> Editar
          </Link>
        </div>
      </div>

      {/* Seção de Detalhes */}
      <h2 style={{ margin: '25px 0 10px 25px' }}>Informações do Usuário</h2>
      
      <div className={styles.container}>
        <div className={styles.user_text} style={{ width: '100%' }}>
          
          <div className={styles.bordas}>
            <p><strong>Nome:</strong> {name}</p>
          </div>
          
          <div className={styles.bordas}>
            <p><strong>Email:</strong> {email}</p>
          </div>
          
          <div className={styles.bordas}>
            <p><strong>Tipo de Usuário:</strong> {role}</p>
          </div>
          
          <div className={styles.bordas}>
            <p><strong>Data de Cadastro:</strong> 01/01/2023</p> {/* Pode vir do backend futuramente */}
          </div>
          
          <div className={styles.bordas}>
            <p><strong>Status:</strong> <span style={{color: 'green', fontWeight: 'bold'}}>Ativo</span></p>
          </div>
        
        </div>      
      </div>

      {/* Botão de Sair */}
      <div className={styles.bnt} style={{ marginTop: "20px" }}>
        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
          <FiLogOut style={{ marginRight: "8px" }} />
          Sair
        </button>
      </div>
      
    </div>
  );
}

export default Usuario;