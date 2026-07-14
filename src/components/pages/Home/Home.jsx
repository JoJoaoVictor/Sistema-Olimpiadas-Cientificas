import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import LinkButton from '../../Layout/LinkButton.jsx';
import Swipe from './Swipe.jsx';
import { Link } from 'react-router-dom'; 

// Imagens Originais Restauradas
import Imagens from './Imgs/ferramentas.png';
import Imagens2 from './Imgs/t2.jpg';
import Imagens3 from './Imgs/t3.jpg';
import Imagens4 from './../../../img/logov.png';
import Imagens5 from './Imgs/logo_Unemat-removebg-preview.png';
//
// Ícones modernos
import { 
    FaSignInAlt, FaTasks, FaPlusCircle, FaUserGraduate, FaUserShield, 
    FaUserTie, FaUserCog, FaMapMarkerAlt, FaHistory, 
    FaGraduationCap, FaSchool, FaChalkboardTeacher, FaUniversity, FaLaptopCode
} from 'react-icons/fa';

import useAuth from '../.././../hooks/useAuth.jsx';
import TermsOverlay from './../Usuario/TermsOverlay.jsx'; 

// ========================
// MAPEAMENTO DE LINKS EXTERNOS POR CIDADE
// Substitua os valores "#" pelos links reais (ex: site da prefeitura, página do projeto na cidade, etc.)
// ========================
const CIDADE_LINKS = {
    // Polo Barra do Bugres (BBG)
    "Alto Paraguai": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/alto-paraguai?authuser=0",
    "Barra do Bugres": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/barra-do-bugres?authuser=0",
    "Diamantino": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/diamantino?authuser=0",
    "Nortelândia": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/nortel%C3%A2ndia?authuser=0",
    "Nova Marilândia": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/nova-maril%C3%A2ndia?authuser=0",
    "Nova Olímpia": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/nova-ol%C3%ADmpia?authuser=0",
    "Porto Estrela": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/porto-estrela?authuser=0",
    "Tangará da Serra": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-barra-do-bugres/tangar%C3%A1-da-serra?authuser=0",

    // Polo Sinop (SNP)
    "Alta Floresta": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/alta-floresta?authuser=0",
    "Campo Novo do Parecis": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/campo-novo-do-parecis?authuser=0",
    "Carlinda": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/carlinda?authuser=0",
    "Itanhangá": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/itanhang%C3%A1?authuser=0",
    "Itaúba": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/ita%C3%BAba?authuser=0",
    "Lucas do Rio Verde": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/lucas-do-rio-verde?authuser=0",
    "Marcelândia": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/marcel%C3%A2ndia?authuser=0",
    "Nova Canaã do Norte": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/nova-cana%C3%A3-do-norte?authuser=0",
    "Nova Monte Verde": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/nova-monte-verde?authuser=0",
    "Nova Santa Helena": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/nova-santa-helena?authuser=0",
    "Paranaíta": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/parana%C3%ADta?authuser=0",
    "Porto dos Gaúchos": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/porto-dos-ga%C3%BAchos?authuser=0",
    "Sinop": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/sinop?authuser=0",
    "Tabaporã": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/tabapor%C3%A3?authuser=0",
    "Tapurah": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/tapurah?authuser=0",
    "Terra Nova do Norte": "https://sites.google.com/unemat.br/olimpiada-de-matematica/OM/polo-sinop/terra-nova-do-norte?authuser=0"
};

function Home() {
    const { user, signed, updateUser } = useAuth();
    const [showTerms, setShowTerms] = useState(false);

    useEffect(() => {
        if (signed && user && user.accepted_terms === false) {
            setShowTerms(true);
        }
    }, [user, signed]);

    const handleTermsAccepted = () => {
        setShowTerms(false);
        if (typeof updateUser === 'function') {
            updateUser({ accepted_terms: true });
        }
    };

    const isProfessor  = user?.role?.toUpperCase() === "PROFESSOR" || user?.role?.toUpperCase() === "ADMIN";
    const isEstagiario = user?.role?.toUpperCase() === "STUDENT";
    const isAdmin      = user?.role?.toUpperCase() === "ADMIN";
    const isRevisor    = user?.role?.toUpperCase() === "REVISOR";
    const podeCriar    = isProfessor || isEstagiario || isAdmin;

    const cidadesBBG = ["Alto Paraguai", "Barra do Bugres", "Diamantino", "Nortelândia", "Nova Marilândia", "Nova Olímpia", "Porto Estrela", "Tangará da Serra"];
    const cidadesSNP = ["Alta Floresta", "Campo Novo do Parecis", "Carlinda", "Itanhangá", "Itaúba", "Lucas do Rio Verde", "Marcelândia", "Nova Canaã do Norte", "Nova Monte Verde", "Nova Santa Helena", "Paranaíta", "Porto dos Gaúchos", "Sinop", "Tabaporã", "Tapurah", "Terra Nova do Norte"];

    return (
        <section className={styles.portal_wrapper}>
            
            {showTerms && <TermsOverlay user={user} onAcceptComplete={handleTermsAccepted} />}
            
            <div className={styles.carousel_container}>
                <Swipe />
            </div>

            <header className={styles.portal_header}>
                <div className={styles.header_content}>
                    <img style={{width:'15%'}} src={Imagens4} alt="Emblema" />
                    <h2>Sistema de Gestão de provas do Programa Olimpíada de Matemática da<span> UNEMAT</span></h2> 
                </div>
            </header>

            <div className={styles.portal_body}>
                
                {/* === NOVA SEÇÃO COM IMAGEM 1: FERRAMENTAS DO SISTEMA === */}
                <section className={styles.split_card_section}>
                    <div className={`${styles.split_card} ${styles.reverse_mobile}`}>
                        <div className={styles.split_text}>
                            <h2><FaLaptopCode /> Plataforma Integrada</h2>
                            <p>O S.G.O.M organiza e gerencia todas as etapas envolvidas na criação das provas para a Olimpíada de Matemática. O sistema garante a eficiência e a padronização das avaliações.</p>
                            <ul className={styles.feature_list}>
                                <li>Elaboração avançada com LaTeX e classificação BNCC.</li>
                                <li>Fila de moderação e revisão técnica.</li>
                                <li>Geração automática de provas em PDF.</li>
                            </ul>
                        </div>
                        <div className={styles.split_image}>
                            <img src={Imagens} alt="Ferramentas do Sistema" />
                        </div>
                    </div>
                </section>

                {/* === SEÇÃO: PERFIS E NÍVEIS DE ACESSO === */}
                <section className={styles.system_roles_section}>
                    <div className={styles.section_title}>
                        <h2>Níveis de Acesso e Perfis</h2>
                        <p>Descubra como cada tipo de conta colabora no fluxo de gerenciamento das avaliações.</p>
                    </div>

                    <div className={styles.roles_grid}>
                        {/* ELABORADOR → STUDENT */}
                        <Link
                            to="/register?role=STUDENT"
                            className={styles.role_card}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className={`${styles.role_icon_badge} ${styles.student_badge}`}>
                                <FaUserGraduate />
                            </div>
                            <h3>Elaborador de Questões</h3>
                            <p>Elaboração e sugestão de novas questões baseadas no LaTeX e BNCC.</p>
                        </Link>

                        {/* REVISOR */}
                        <Link
                            to="/register?role=REVISOR"
                            className={styles.role_card}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className={`${styles.role_icon_badge} ${styles.revisor_badge}`}>
                                <FaUserShield />
                            </div>
                            <h3>Revisor / Moderador</h3>
                            <p>Análise, correção e revisão técnica de questões e rascunhos de exames pendentes.</p>
                        </Link>

                        {/* PROFESSOR COORDENADOR */}
                        <Link
                            to="/register?role=PROFESSOR"
                            className={styles.role_card}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className={`${styles.role_icon_badge} ${styles.professor_badge}`}>
                                <FaUserTie />
                            </div>
                            <h3>Professor Coordenador</h3>
                            <p>Autonomia para criar novas questões e montar provas completas personalizadas.</p>
                        </Link>
                    </div>
                </section>

                {/* === SEÇÃO: IMAGEM 2: INSTITUCIONAL (CAMPUS) === */}
                <section className={styles.split_card_section}>
                    <div className={styles.split_card}>
                        <div className={styles.split_image}>
                            <img src={Imagens3} alt="Campus Unemat" />
                        </div>
                        <div className={styles.split_text}>
                            <h2><FaUniversity /> Sobre o Programa (UNEMAT)</h2>
                            <p>Criado em 2016, o Programa de Extensão unifica os projetos desenvolvidos nos Câmpus da instituição, envolvendo Professores da Universidade e da Educação Básica.</p>
                            <p>O objetivo é integrar os projetos municipais, premiar os melhores alunos da região e impulsionar o raciocínio lógico e o desenvolvimento científico em Mato Grosso.</p>
                        </div>
                    </div>
                </section>

                {/* === SEÇÃO: POLOS REGIONAIS E MUNICÍPIOS === */}
                <section className={styles.polos_section}>
                    <div className={styles.section_title}>
                        <h2>Polos Ativos e Municípios Participantes</h2>
                    </div>
                    <div className={styles.polos_grid}>
                        <div className={styles.polo_card}>
                            <div className={styles.polo_card_header}>
                                <h3><FaMapMarkerAlt /> Barra do Bugres (BBG)</h3>
                                <span className={styles.polo_count}>8 Projetos</span>
                            </div>
                            <div className={styles.cities_grid}>
                                {cidadesBBG.map((cidade, i) => (
                                    <a 
                                        key={i}
                                        href={CIDADE_LINKS[cidade] || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.city_tag}
                                        title={`Saiba mais sobre o projeto em ${cidade}`}
                                    >
                                        {cidade}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className={styles.polo_card}>
                            <div className={styles.polo_card_header}>
                                <h3><FaMapMarkerAlt /> Polo Sinop (SNP)</h3>
                                <span className={styles.polo_count}>16 Projetos</span>
                            </div>
                            <div className={styles.cities_grid}>
                                {cidadesSNP.map((cidade, i) => (
                                    <a 
                                        key={i}
                                        href={CIDADE_LINKS[cidade] || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.city_tag}
                                        title={`Saiba mais sobre o projeto em ${cidade}`}
                                    >
                                        {cidade}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* === INDICADORES DE IMPACTO === */}
                <section className={styles.stats_dashboard_section}>
                    <div className={styles.stats_banner}>
                        <div className={styles.stats_header}>
                            <h2><FaHistory /> Estatísticas do Projeto</h2>
                            <p>Aplicando exames em três fases distribuídos por níveis de escolaridade continuamente desde 2015.</p>
                        </div>
                        <div className={styles.stats_row}>
                            <div className={styles.stat_box}>
                                <FaGraduationCap className={styles.stat_icon} />
                                <h4>+ 2.000</h4>
                                <p>Alunos por Edição</p>
                            </div>
                            <div className={styles.stat_box}>
                                <FaSchool className={styles.stat_icon} />
                                <h4>+ 20</h4>
                                <p>Escolas Parceiras</p>
                            </div>
                            <div className={styles.stat_box}>
                                <FaChalkboardTeacher className={styles.stat_icon} />
                                <h4>+ 50</h4>
                                <p>Professores Envolvidos</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === EQUIPE DIRETIVA === */}
                <section className={styles.team_section}>
                    <div className={styles.section_title}>
                        <h2>Coordenação Geral do programa Olimpíadas</h2>
                    </div>
                    <div className={styles.team_container}>
                        <div className={styles.coordinator_card}>
                            <h4>Coordenador Geral do Programa </h4>
                            <h5>Prof. Dr. Miguel Tadayuki Koga</h5>
                            <span>UNEMAT</span>
                        </div>
                        <div className={styles.members_panel} style={{}}>
                            <div>
                                <h4>Membros do Programa </h4>
                            <div className={styles.members_list}>
                                <div className={styles.member_item}>Prof. Dr. Alexandre Porto <small>(UNEMAT)</small></div>
                                <div className={styles.member_item}>Prof. Dr. Diego Piason <small>(UNEMAT)</small></div>
                                <div className={styles.member_item}>Prof. Dr. Inedio Arcari <small>(UNEMAT)</small></div>
                                
                            </div>
                            </div>
                                       
                            <img style={{width:"50%"}} src={Imagens5} alt="Logo UNEMAT"/>
                        </div> 
                    </div>
                </section>
                
            </div>
        </section>
    );
}

export default Home;