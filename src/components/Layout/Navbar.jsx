import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Container from './Container';
import styles from './Navbar.module.css';
import logo from './../../img/logov.png';

function Navbar() {
  // Estado para armazenar a imagem de perfil do usuário
  const [profilePic, setProfilePic] = useState(null);

  // Estado para verificar se o usuário está logado
  const [isLogged, setIsLogged] = useState(false);

  // Verifica o localStorage para saber se há um usuário logado
  useEffect(() => {
    const stored = localStorage.getItem("user_token");

    if (stored) {
      const user = JSON.parse(stored);

      // Usa a imagem de perfil armazenada no localStorage
      setProfilePic(user.picture);

      // Marca o usuário como logado
      setIsLogged(true);
    } else {
      // Se não houver token, usuário não está logado
      setIsLogged(false);
    }
  }, []);

  return (
    <nav className={styles.navbar}>
      <Container>
        {/* Logo do sistema com link para Home */}
        <Link to="/">
          <img
            src={logo}
            alt="S.G.O.M"
            style={{ padding: '0.2em', marginLeft: '5vw', width: '5vw' }}
          />
        </Link>

        {/* Menu de navegação */}
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link to="/">Home</Link>
          </li>
           <li className={styles.item}>
            <Link to="/prova">Provas</Link>
          </li>
           <li className={styles.item}>
            <Link to="/montarProva">Nova Prova</Link>
          </li>
          <li className={styles.item}>
            <Link to="/projects">Questões</Link>
          </li>
          <li className={styles.item}>
            <Link to="/newproject">Nova Questão</Link>
          </li>
         
          {/* Se o usuário NÃO estiver logado, exibe botão "Login" */}
          {!isLogged && (
            <li className={styles.item}>
              <Link to="/usuario">Login</Link>
            </li>
          )}

          {/* Se estiver logado, mostra imagem do perfil e link para área do usuário */}
          {isLogged && profilePic && (
            <li className={styles.item_avatar}>
              <Link to="/usuario" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={profilePic}
                  alt="Perfil"
                  className={styles.avatar}
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
