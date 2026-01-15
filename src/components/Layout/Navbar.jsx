import { useState } from "react"; // Importar useState
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; // Ícones para o menu mobile
import Container from "./Container";
import styles from "./Navbar.module.css";
import logo from "./../../img/logov.png";
import useAuth from "../../hooks/useAuth";

const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png";

function Navbar() {
  const { user, signed } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // Estado do menu mobile

  const profilePic = user?.picture || user?.avatar || DEFAULT_AVATAR;

  // Lógica de perfis
  const isProfessor = user?.role === "PROFESSOR" || user?.role === "ADMIN";
  const isRevisor = user?.role === "REVISOR";
  const isEstagiario = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN";

  // Função para fechar o menu ao clicar em um link (UX melhor no mobile)
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <Container>
        {/* Wrapper flex para alinhar Logo (esquerda) e Menu (direita) */}
        <div className={styles.flexWrapper}>
          
          {/* === LOGO === */}
          <Link to="/" onClick={handleLinkClick}>
            <img
              src={logo}
              alt="S.G.O.M"
              className={styles.logo} // Movi o estilo inline para o CSS
            />
          </Link>

          {/* === ÍCONE HAMBURGUER (Mobile) === */}
          <div className={styles.mobileIcon} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* === MENU === */}
          {/* Adiciona a classe 'active' se o menu estiver aberto */}
          <ul className={`${styles.list} ${isOpen ? styles.active : ""}`}>
            
            {/* 1. HOME */}
            <li className={styles.item}>
              <Link to="/" onClick={handleLinkClick}>Home</Link>
            </li>

            {/* ÁREA DO ESTAGIÁRIO */}
            {signed && isEstagiario && (
              <>
                <li className={styles.item}>
                  <Link to="/newproject" onClick={handleLinkClick}>Criar Nova Questão</Link>
                </li>
                <li className={styles.item}>
                  <Link to="/projects" onClick={handleLinkClick}>Minhas Questões</Link>
                </li>
              </>
            )}

            {/* ÁREA DO PROFESSOR */}
            {signed && isProfessor && (
              <>
                <li className={styles.item}>
                  <Link to="/montarProva" onClick={handleLinkClick}>Montar Prova</Link>
                </li>
                <li className={styles.item}>
                  <Link to="/Prova" onClick={handleLinkClick}>Banco de Provas</Link>
                </li>
                <li className={styles.item}>
                  <Link to="/projects" onClick={handleLinkClick}>Revisar Questões</Link>
                </li>
              </>
            )}

            {/* ÁREA DO REVISOR */}
            {signed && isRevisor && (
              <>
                <li className={styles.item}>
                  <Link to="/projects" onClick={handleLinkClick}>Revisar Questões</Link>
                </li>
                <li className={styles.item}>
                  <Link to="/Prova" onClick={handleLinkClick}>Revisar Provas</Link>
                </li>
              </>
            )}

            {/* ADMIN */}
            {signed && isAdmin && (
              <li className={styles.item}>
                <Link to="/admin/users" style={{ color: "red" }} onClick={handleLinkClick}>
                  Usuários
                </Link>
              </li>
            )}

            {/* LOGIN / PERFIL */}
            {!signed && (
              <li className={styles.item}>
                <Link to="/login" onClick={handleLinkClick}>Entrar</Link>
              </li>
            )}

            {/* AVATAR (Mostra diferente no mobile vs desktop) */}
            {signed && (
              <li className={styles.item_avatar}>
                <Link
                  to="/usuario"
                  title="Meu Perfil"
                  className={styles.profileLink}
                  onClick={handleLinkClick}
                >
                  <span className={styles.profileTextMobile}>Meu Perfil</span>
                  <img
                    src={profilePic}
                    alt="Perfil"
                    className={styles.avatar}
                    onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                  />
                </Link>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;