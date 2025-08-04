import styles from './Home.module.css'
import LinkButton from '../../Layout/LinkButton.jsx' 
import Swipe from './Swipe.jsx'
import Imagens from './Imgs/ferramentas.png'
import Imagens2 from './Imgs/t2.jpg'
import Imagens3 from './Imgs/t3.jpg'

function Home(){
    return (
        <section className={styles.home_container}>
            <Swipe/>

            <h1 >Bem-vindo ao <span>S.G.O.M</span>
            <p>Sistema de Gestão da Olimpíada de Matemática</p>
            </h1>
            <br/>
            <div style={{ display: 'flex', backgroundColor: '#fff',backgroundSize: '100%',minHeight: '100px',padding: '50px 40px 20px',borderRadius: '20px' }}>
                
              <div style={{ marginRight: '50px',  }}>
                    <h2 >Criação de Exames</h2>
                    <p>
                    As olimpíadas de Matemática desempenham um papel crucial na educação ao estimular o interesse pela disciplina, desenvolver habilidades cognitivas como raciocínio lógico e pensamento crítico, e promover o interesse pelas áreas das Ciências Exatas e Tecnológicas. <br /><br/>
                    O sistema online tem como principal objetivo organizar e gerenciar todas as etapas envolvidas na criação das provas para a Olimpíada de Matemática da UNEMAT.<br /><br/>
                    </p>
                <div style={{color: '#383838', padding: '0.5'}}><b>1</b>.Elaboração de questões, com suporte a LaTeX, categorização segundo BNCC, nível de dificuldade e tema.<br/>
                    <b>2</b>.Revisão, acessível apenas a professores cadastrados, para ajustes e aprovação preliminar.<br/>
                    <b>3</b>.Análise e aprovação final, exclusivo para administradores, antes da inclusão no banco de questões.<br/>
                    <b>4</b>.Banco de questões, com filtros avançados para buscas.<br/>
                    <b>5</b>.Montagem de provas, permitindo a personalização com filtros <br/>
                    <b>6</b>.Geração de arquivos prontos para impressão com cabeçalhos e logomarcas.<br/>
                    <b>7</b>.Historico de provas ja aplicadas e questões para uso<br/><br/>
                    <p>O sistema visa organizar e otimizar o fluxo de trabalho, garantindo padronização e eficiência.
                    </p>   
                </div>
                
            </div >
                <div>
                    <img style={{height:'600px', objectFit: 'cover'}} src={Imagens} alt="Img" />
                </div>     
            </div>

            <br/>
           
            
            <div style={{ display: 'flex', backgroundColor: '#1106',backgroundSize: '100%',minHeight: '100px',padding: '10px 20px 10px',borderRadius: '20px' }}>
                 <div style={{ objectFit: 'cover'}}> <img src={Imagens3} alt="Img" />
                    </div>

                <div style={{marginLeft:'50px', color: '#fff'}}> 
                    <h2 >Unemat</h2>
                    <p style={{color: '#fff'}}>A UNEMAT, por meio do seu Programa de Olimpíadas de Matemática, vem realizando essas competições em 18 cidades de Mato Grosso, localizadas nas regiões Norte e Sudoeste do estado. <br/><br/>O Programa envolve professores de vários campi que se envolvem em diversas atividades, sendo a montagem das provas da competição a atividade mais crítica, por necessitar atender uma série de critérios de qualidade das questões e por envolver diversos processos, como elaboração, revisão, correção e armazenamento de questões em um banco de dados.
                    </p> 
                </div>
            </div>
            <br/>
            <br/>
            <div style={{display: 'flex', alignItems: 'center', backgroundColor: '#fff',padding: '10px ',borderRadius: '20px' }}>
                <div  style={{marginRight:'20px',marginLeft: '10%'}}><p>Comece a gerenciar seu projeto agora!</p><br/>
                <div style={{marginLeft: '80px'}}><LinkButton to="/newproject" text="Criar Projeto"  /> </div>
                </div>
                
                <div >
                    <img style={{width: '400px',height: '200px',marginLeft: '50%', backgroundColor:'#fff'}} src={Imagens2} alt='img2'/>
                </div>
            </div>
           
            <br/>

            
            <br/>
            
            
        </section>
    )
    
}

export default Home
