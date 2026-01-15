import styles from './Home.module.css';
import LinkButton from '../../Layout/LinkButton.jsx';
import Swipe from './Swipe.jsx';
import Imagens from './Imgs/ferramentas.png';
import Imagens2 from './Imgs/t2.jpg';
import Imagens3 from './Imgs/t3.jpg';
import { FaCheckCircle } from 'react-icons/fa'; // Opcional: Para ícones na lista (instale react-icons se não tiver)

function Home() {
    return (
        <section className={styles.home_wrapper}>
            
            {/* === CAROUSEL === */}
            <div className={styles.carousel_area}>
                <Swipe />
            </div>

            {/* === TÍTULO PRINCIPAL === */}
            <div className={styles.hero_header}>
                <h1>Bem-vindo ao <span>S.G.O.M</span></h1>
                <p>Sistema de Gestão da Olimpíada de Matemática</p>
            </div>

            {/* === SEÇÃO 1: CRIAÇÃO DE EXAMES (Fundo Branco) === */}
            <div className={`${styles.content_card} ${styles.bg_white}`}>
                <div className={styles.text_column}>
                    <h2>Criação de Exames</h2>
                    <p>
                        As olimpíadas de Matemática desempenham um papel crucial na educação ao estimular 
                        o interesse pela disciplina, desenvolver habilidades cognitivas como raciocínio 
                        lógico e pensamento crítico.
                    </p>
                    <p>
                        O sistema online tem como principal objetivo organizar e gerenciar todas as etapas 
                        envolvidas na criação das provas para a Olimpíada de Matemática da UNEMAT.
                    </p>

                    {/* Lista de Funcionalidades */}
                    <ul className={styles.feature_list}>
                        <li><span>1</span> Elaboração de questões (LaTeX, BNCC, dificuldade).</li>
                        <li><span>2</span> Revisão restrita a professores para aprovação preliminar.</li>
                        <li><span>3</span> Análise final e aprovação por administradores.</li>
                        <li><span>4</span> Banco de questões com filtros avançados.</li>
                        <li><span>5</span> Montagem de provas personalizada.</li>
                        <li><span>6</span> Geração de PDF pronto para impressão.</li>
                        <li><span>7</span> Histórico completo de provas aplicadas.</li>
                    </ul>

                    <p className={styles.highlight_text}>
                        O sistema visa organizar e otimizar o fluxo de trabalho, garantindo padronização e eficiência.
                    </p>
                </div>

                <div className={styles.image_column}>
                    <img src={Imagens} alt="Ferramentas do Sistema" />
                </div>
            </div>

            {/* === SEÇÃO 2: UNEMAT (Fundo Escuro/Translucido) === */}
            <div className={`${styles.content_card} ${styles.bg_dark}`}>
                <div className={styles.image_column}>
                    <img src={Imagens3} alt="Campus Unemat" />
                </div>
                
                <div className={styles.text_column}>
                    <h2>Sobre a UNEMAT</h2>
                    <p>
                        A UNEMAT, por meio do seu Programa de Olimpíadas de Matemática, vem realizando 
                        essas competições em 18 cidades de Mato Grosso, localizadas nas regiões Norte 
                        e Sudoeste do estado.
                    </p>
                    <p>
                        O Programa envolve professores de vários campi que se dedicam a diversas atividades, 
                        sendo a montagem das provas a atividade mais crítica. Ela necessita atender uma série 
                        de critérios de qualidade, envolvendo processos complexos como elaboração, revisão, 
                        correção e armazenamento seguro.
                    </p>
                </div>
            </div>

            {/* === SEÇÃO 3: CALL TO ACTION (CTA) === */}
            <div className={`${styles.cta_card} ${styles.bg_white}`}>
                <div className={styles.cta_text}>
                    <h3>Pronto para começar?</h3>
                    <p>Inicie agora mesmo o gerenciamento do seu projeto ou banco de questões.</p>
                    <div className={styles.cta_button_wrapper}>
                         <LinkButton to="/newproject" text="Criar Projeto" />
                    </div>
                </div>
                
                <div className={styles.cta_image}>
                    <img src={Imagens2} alt="Estudantes" />
                </div>
            </div>

        </section>
    );
}

export default Home;