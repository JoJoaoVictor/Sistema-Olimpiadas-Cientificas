import { Link } from "react-router-dom";
import Container from "./Container";
import styles from "./Navbar.module.css";
import logo from "./../../img/logov.png";
import useAuth from "../../hooks/useAuth";

const DEFAULT_AVATAR = "https://www.w3schools.com/howto/img_avatar.png";

function Navbar() {
  const { user, signed } = useAuth();

  const profilePic = user?.picture || user?.avatar || DEFAULT_AVATAR;

  // === DEFINIÇÃO DE PERFIS ===
  // Professor/Admin: Monta provas e gerencia o sistema
  const isProfessor = user?.role === "PROFESSOR" || user?.role === "ADMIN";
  
  // Revisor: Pode revisar questões e provas
  const isRevisor = user?.role === "REVISOR";
  
  // Student (Estagiário): Cria questões para o banco
  const isEstagiario = user?.role === "STUDENT";
  // Admin: Acesso total ao sistema
  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className={styles.navbar}>
      <Container>
        {/* === LOGO === */}
        <Link to="/">
          <img
            src={logo}
            alt="S.G.O.M"
            style={{ padding: "0.2em", marginLeft: "5vw", width: "5vw" }}
          />
        </Link>

        {/* === MENU === */}
        <ul className={styles.list}>
          
          {/* 1. HOME (Acesso Geral para todos) */}
          <li className={styles.item}>
            <Link to="/">Home</Link>
          </li>

          {/* ====================================================
              ÁREA DO ESTAGIÁRIO (STUDENT)
              Foco: Criar questões e ver suas próprias questões
             ==================================================== */}
          {signed && isEstagiario && (
            <>
              <li className={styles.item}>
                {/* Onde ele cadastra uma nova pergunta */}
                <Link to="/newproject">Criar Nova Questão</Link>
              </li>
              <li className={styles.item}>
                {/* Onde ele vê as questões que ele fez */}
                <Link to="/projects">Minhas Questões</Link>
              </li>
            </>
          )}

          {/* ====================================================
              ÁREA DO PROFESSOR
              Foco: Montar provas e gerenciar banco
             ==================================================== */}
          {signed && isProfessor && (
            <>
              <li className={styles.item}>
                {/* Ferramenta para selecionar questões e criar a prova */}
                <Link to="/montarProva">Montar Prova</Link>
              </li>
              <li className={styles.item}>
                {/* Lista das provas já fechadas/criadas */}
                <Link to="/Prova">Banco de Provas</Link>
              </li>
              <li className={styles.item}>
                {/* Professor também precisa ver o banco de questões para selecionar */}
                <Link to="/projects">Revisar Questões</Link>
              </li>
            </>
          )}

          {/* ====================================================
              ÁREA DO REVISOR (NOVO)
              Foco: Conferir qualidade das questões e provas
             ==================================================== */}
          {signed && isRevisor && (
            <>
              <li className={styles.item}>
                {/* Acesso ao banco de questões para validação */}
                <Link to="/projects">Revisar Questões</Link>
              </li>
              <li className={styles.item}>
                {/* Acesso ao banco de provas para validação */}
                <Link to="/Prova">Revisar Provas</Link>
              </li>
            </>
          )}
            {signed && isAdmin && (
              <li className={styles.item}>
                <Link to="/admin/users" style={{ color: 'red' }}>Usuários</Link>
              </li>
            )}
          {/* ====================================================
              LOGIN / PERFIL
             ==================================================== */}
          
          {/* Se NÃO estiver logado */}
          {!signed && (
            <li className={styles.item}>
              <Link to="/login">Entrar</Link>
            </li>
          )}

          {/* Se ESTIVER logado */}
          {signed && (
            <li className={styles.item_avatar}>
              <Link
                to="/usuario"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
                title="Meu Perfil"
              >
                <img
                  src={profilePic}
                  alt="Perfil"
                  className={styles.avatar}
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </Link>
            </li>
          )}
                   
        </ul>
      </Container>
    </nav>
  );
}

export default Navbar;