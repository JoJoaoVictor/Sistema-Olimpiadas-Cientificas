import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import styles from './Footer.module.css';

function Footer() {
    // Pegar o ano atual dinamicamente é uma boa prática
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <ul className={styles.social_list}>
                <li>
                    <FaFacebook />
                </li>
                <li>
                    <a href="https://www.instagram.com/omunemat/" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <FaInstagram />
                    </a>
                </li>
                <li>
                    <FaLinkedin />
                </li>
            </ul>
            <p className={styles.copy_right}>
                <span>S.G.O.M</span> &copy; {currentYear} • Programa de Olimpíadas UNEMAT
            </p>
        </footer>
    );
}

export default Footer;