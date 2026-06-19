import { FaFacebook, FaInstagram, FaLinkedin, FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import styles from './Footer.module.css';
import Logo from './../pages/Home/Imgs/Logo_Programa_Olimpiadas-removebg-preview.png';
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Coluna 1: Identidade */}
        <div className={styles.column}>
          <h3 className={styles.logo}><img style={{width:'20%', backgroundColor:'white', borderRadius:'10%'}} src={Logo} alt="Logo" /></h3>
          <p className={styles.description}>
            Programa de Olimpíadas da UNEMAT. Incentivando o conhecimento e a
            excelência acadêmica.
          </p>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div className={styles.column}>
          <h4 className={styles.title}>Links Úteis</h4>
          <ul className={styles.linkList}>
            <li><a href="https://sites.google.com/unemat.br/olimpiada-de-matematica">Sobre o Programa</a></li>
            <li><a href="/calendario">Calendário</a></li>
            <li><a href="https://sites.google.com/unemat.br/olimpiada-de-matematica/inscri%C3%A7%C3%A3o?authuser=0">Inscrições</a></li>
            <li><a href="https://sites.google.com/unemat.br/olimpiada-de-matematica/classificados?authuser=0">Resultados</a></li>
          </ul>
        </div>

        {/* Coluna 3: Contato */}
        <div className={styles.column}>
          <h4 className={styles.title}>Contato</h4>
          <ul className={styles.contactList}>
            <li>
              <FaEnvelope className={styles.iconSmall} />
              <a href="mailto:suporteolimpiadas@gmail.com">suporteolimpiadas@gmail.com</a>
            </li>
           
          </ul>
        </div>

        {/* Coluna 4: Redes Sociais */}
        <div className={styles.column}>
          <h4 className={styles.title}>Redes Sociais</h4>
          <div className={styles.social_list}>
            <a href="https://www.facebook.com/profile.php?id=100054646710289&sk=directory_links" target="_blank" rel="noreferrer" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://www.instagram.com/omunemat/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

    
    </footer>
  );
}

export default Footer;