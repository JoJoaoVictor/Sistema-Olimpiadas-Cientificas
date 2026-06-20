import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Container from "./Container";
import styles from "./Navbar.module.css";
import logo from "./../../img/logov.png";
import useAuth from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell";

const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png";

function Navbar() {
  const { user, signed } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const profilePic = user?.picture || user?.avatar || DEFAULT_AVATAR;

  const isProfessor = user?.role === "PROFESSOR" || user?.role === "ADMIN";
  const isRevisor = user?.role === "REVISOR";
  const isEstagiario = user?.role === "STUDENT";
  const isAdmin = user?.role === "ADMIN";

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <Container>
        <div className={styles.flexWrapper}>
          
          {/* Logo */}
          <a href="/" onClick={handleLinkClick}>
            <img src={logo} alt="S.G.O.M" className={styles.logo} />
          </a>

          {/* Ícone hamburguer */}
          <div className={styles.mobileIcon} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          <ul className={`${styles.list} ${isOpen ? styles.active : ""}`}>
            
            <li className={styles.item}>
              <a href="/" onClick={handleLinkClick}>Home</a>
            </li>

            {signed && isEstagiario && (
              <>
                <li className={styles.item}>
                  <a href="/newproject" onClick={handleLinkClick}>Criar Nova Questão</a>
                </li>
                <li className={styles.item}>
                  <a href="/projects" onClick={handleLinkClick}>Minhas Questões</a>
                </li>
              </>
            )}

            {signed && isProfessor && (
              <>
                <li className={styles.item}>
                  <a href="/montarProva" onClick={handleLinkClick}>Montar Prova</a>
                </li>
                <li className={styles.item}>
                  <a href="/Prova" onClick={handleLinkClick}>Banco de Provas</a>
                </li>
                <li className={styles.item}>
                  <a href="/projects" onClick={handleLinkClick}>Revisar Questões</a>
                </li>
              </>
            )}

            {signed && isRevisor && (
              <li className={styles.item}>
                <a href="/projects" onClick={handleLinkClick}>Revisar Questões</a>
              </li>
            )}

            {signed && isAdmin && (
              <li className={styles.item}>
                <a href="/admin/users" style={{ color: "red" }} onClick={handleLinkClick}>
                  Usuários
                </a>
              </li>
            )}

            {signed && (
              <li className={styles.item_notification}>
                <NotificationBell />
              </li>
            )}

            {!signed && (
              <li className={styles.item}>
                <a href="/login" onClick={handleLinkClick}>Entrar</a>
              </li>
            )}

            {signed && (
              <li className={styles.item_avatar}>
                <a
                  href="/usuario"
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
                </a>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </nav>
  );
}

export default Navbar;