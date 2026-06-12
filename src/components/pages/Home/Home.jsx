import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import LinkButton from '../../Layout/LinkButton.jsx';
import Swipe from './Swipe.jsx';

// Imagens Originais Restauradas
import Imagens from './Imgs/ferramentas.png';
import Imagens2 from './Imgs/t2.jpg';
import Imagens3 from './Imgs/t3.jpg';
import Imagens4 from './Imgs/Logo_Programa_Olimpiadas-removebg-preview.png';
import Imagens5 from './Imgs/logo_Unemat-removebg-preview.png';

// Ícones modernos
import { 
    FaSignInAlt, FaTasks, FaPlusCircle, FaUserGraduate, FaUserShield, 
    FaUserTie, FaUserCog, FaMapMarkerAlt, FaHistory, 
    FaGraduationCap, FaSchool, FaChalkboardTeacher, FaUniversity, FaLaptopCode
} from 'react-icons/fa';

import useAuth from '../.././../hooks/useAuth.jsx';
import TermsOverlay from './../Usuario/TermsOverlay.jsx'; 

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
                    <h1>Sistema <span>S.G.O.M</span></h1>
                    <p>Sistema de Gestão do Programa Olimpíada de Matemática da UNEMAT</p>
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
                        <div className={styles.role_card}>
                            <div className={`${styles.role_icon_badge} ${styles.student_badge}`}><FaUserGraduate /></div>
                            <h3>Elaborador de Questões</h3>
                            <p>Elaboração e sugestão de novas questões baseadas no LaTeX e BNCC.</p>
                        </div>
                        <div className={styles.role_card}>
                            <div className={`${styles.role_icon_badge} ${styles.revisor_badge}`}><FaUserShield /></div>
                            <h3>Revisor / Moderador</h3>
                            <p>Análise, correção e revisão técnica de questões e rascunhos de exames pendentes.</p>
                        </div>
                        <div className={styles.role_card}>
                            <div className={`${styles.role_icon_badge} ${styles.professor_badge}`}><FaUserTie /></div>
                            <h3>Professor Orientador</h3>
                            <p>Autonomia para criar novas questões e montar provas completas personalizadas.</p>
                        </div>
                      
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
                        <h2>Polos Ativos de Abrangência</h2>
                    </div>
                    <div className={styles.polos_grid}>
                        <div className={styles.polo_card}>
                            <div className={styles.polo_card_header}>
                                <h3><FaMapMarkerAlt /> Barra do Bugres (BBG)</h3>
                                <span className={styles.polo_count}>8 Projetos</span>
                            </div>
                            <div className={styles.cities_grid}>
                                {cidadesBBG.map((cidade, i) => <span key={i} className={styles.city_tag}>{cidade}</span>)}
                            </div>
                        </div>
                        <div className={styles.polo_card}>
                            <div className={styles.polo_card_header}>
                                <h3><FaMapMarkerAlt /> Polo Sinop (SNP)</h3>
                                <span className={styles.polo_count}>16 Projetos</span>
                            </div>
                            <div className={styles.cities_grid}>
                                {cidadesSNP.map((cidade, i) => <span key={i} className={styles.city_tag}>{cidade}</span>)}
                            </div>
                        </div>
                    </div>
                </section>

                {/* === INDICADORES DE IMPACTO === */}
                <section className={styles.stats_dashboard_section}>
                    <div className={styles.stats_banner}>
                        <div className={styles.stats_header}>
                            <h2><FaHistory /> Histórico de Impacto e Atuação</h2>
                            <p>Aplicando exames em três fases distribuídos por níveis de escolaridade continuamente desde 2015.</p>
                        </div>
                        <div className={styles.stats_row}>
                            <div className={styles.stat_box}>
                                <FaGraduationCap className={styles.stat_icon} />
                                <h4>+ 4.000</h4>
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
                        <h2>Corpo de Coordenação</h2>
                    </div>
                    <div className={styles.team_container}>
                        <div className={styles.coordinator_card}>
                            <h4>Coordenador Geral</h4>
                            <h5>Prof. Dr. Miguel Tadayuki Koga</h5>
                            <span>UNEMAT</span>
                        </div>
                        <div className={styles.members_panel} style={{}}>
                            <div>
                                <h4>Membros do Corpo Docente</h4>
                            <div className={styles.members_list}>
                                <div className={styles.member_item}>Prof. Dr. Alexandre Porto <small>(UNEMAT)</small></div>
                                <div className={styles.member_item}>Prof. Dr. Diego Piason <small>(UNEMAT)</small></div>
                                <div className={styles.member_item}>Prof. Dr. Inedio Arcari <small>(UNEMAT)</small></div>
                                
                            </div>
                            </div>
                                       
                            <img style={{width:"50%"}} src={Imagens5}/>
                        </div> 
                    </div>
                </section>
            {/* === SEÇÃO COM IMAGEM 3: CALL TO ACTION FINAL === */}
                <section className={styles.split_card_section}>
                    <div className={`${styles.split_card} ${styles.cta_special}`}>
                        <div className={styles.split_text}>
                            <h2>Pronto para começar?</h2>
                            {!signed ? (
                                <p>Faça login para acessar suas ferramentas de gerenciamento e elaboração.</p>
                            ) : isRevisor ? (
                                <p>Acesse o painel para moderar e revisar as questões pendentes.</p>
                            ) : (
                                <p>Inicie agora mesmo a elaboração de questões no sistema.</p>
                            )}

                            <div className={styles.cta_buttons}>
                                {!signed ? (
                                    <LinkButton to="/login" text={<><FaSignInAlt /> Acessar o Sistema</>} />
                                ) : isRevisor ? (
                                    <LinkButton to="/projects" text={<><FaTasks /> Revisar Questões</>} />
                                ) : podeCriar ? (
                                    <LinkButton to="/newproject" text={<><FaPlusCircle /> Criar Projeto</>} />
                                ) : null}
                            </div>
                        </div>
                        <div className={styles.split_image}>
                            <img src={Imagens4} alt="Estudantes" />
                        </div>
                    </div>
                </section>
                
            </div>
        </section>
    );
}

export default Home;