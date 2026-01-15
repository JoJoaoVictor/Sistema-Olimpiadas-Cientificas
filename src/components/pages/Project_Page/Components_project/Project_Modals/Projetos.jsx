import styles from './Projetos.module.css';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';

// Importação de Componentes
// Certifique-se que o caminho está correto para o seu ProjectForme atualizado
import ProjectForm from '../../Project_Forme/ProjectForme.jsx';
import LatexText from '../LatexText.jsx'; 

// Ícones
import { FaEdit, FaArrowLeft, FaCheckCircle, FaClock, FaTimes, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { BsBook, BsPersonBadge, BsCardText, BsLayers } from 'react-icons/bs';

function Projetos() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS PRINCIPAIS ---
  const [projeto, setProjeto] = useState({});
  const [showProjetoForm, setShowProjetoForm] = useState(false); // Alterna entre Visualizar e Editar
  const [tipoQuestao, setTipoQuestao] = useState('projects'); // Controla a origem ('projects' ou 'questõesAprovadas')
  const [carregando, setCarregando] = useState(true);

  // --- ESTADO DE PERMISSÃO ---
  const [isRevisor, setIsRevisor] = useState(false); 

  // =========================================================================
  // 1. VERIFICAR PERMISSÃO (Lógica do Perfil)
  // =========================================================================
  useEffect(() => {
    const storedData = localStorage.getItem("user_token");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        
        if (parsedData.user) {
           const user = parsedData.user;
           // Verifica se a role é Revisor ou Admin para lógicas específicas desta tela
           if (['Revisor', 'revisor', 'admin', 'Admin'].includes(user.role)) {
               setIsRevisor(true);
           } else {
               setIsRevisor(false);
           }
        }
      } catch (error) {
        console.error("Erro ao ler permissões do usuário:", error);
      }
    }
  }, []);

  // =========================================================================
  // 2. LÓGICA DE BUSCA (Procura em todas as tabelas)
  // =========================================================================
  useEffect(() => {
    let isMounted = true; 

    async function buscarProjeto() {
      setCarregando(true);
      // Lista de endpoints onde a questão pode estar
      const fontes = ['projects', 'questõesAprovadas'];
      let encontrou = false;

      // Itera sobre os endpoints para achar a questão
      for (const endpoint of fontes) {
        try {
          const res = await fetch(`http://localhost:5000/${endpoint}/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) {
              setProjeto(data);
              setTipoQuestao(endpoint); // Salva de onde veio para saber onde salvar depois
              setCarregando(false);
              encontrou = true;
            }
            return;
          }
        } catch (error) {
          // Continua silenciosamente para o próximo endpoint se falhar
        }
      }

      if (!encontrou && isMounted) {
        setCarregando(false);
        console.error("Projeto não encontrado.");
      }
    }

    buscarProjeto();

    return () => { isMounted = false };
  }, [id]);

  // =========================================================================
  // 3. LÓGICA DE EDIÇÃO E SALVAMENTO
  // Esta função é passada como prop 'handleSubmit' para o componente filho
  // =========================================================================
  async function editPost(dadosDoFormulario) {
    
    // 1. Força a data atualizada
    const dataAgora = new Date().toISOString();
    
    // 2. Lógica de Negócio: Professor vs Revisor
    // Se NÃO for revisor (é professor) e estiver editando uma questão que estava com "Correção Solicitada" (ID 3),
    // ela deve voltar automaticamente para "Em Revisão" (ID 1)
    if (!isRevisor && String(dadosDoFormulario.categoryId) === '3') {
        dadosDoFormulario.categoryId = 1;
        dadosDoFormulario.categoryName = "Revisão";
        // Opcional: Limpar comentários antigos ao reenviar
        // dadosDoFormulario.reviewerComments = ""; 
    }

    // 3. Define destino (Se virou 'Aprovado', muda de tabela)
    let novoEndpoint = (dadosDoFormulario.categoryName === 'Aprovado') ? 'questõesAprovadas' : 'projects';

    // 4. Monta o objeto final preservando ID
    const updatedProject = { 
        ...dadosDoFormulario, 
        id: projeto.id, 
        updatedAt: dataAgora 
    };

    try {
      // Cenário A: Mudou de Tabela (Ex: Revisão -> Aprovado)
      if (novoEndpoint !== tipoQuestao) {
        
        // Cria na nova tabela
        await fetch(`http://localhost:5000/${novoEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProject)
        });

        // Deleta da tabela antiga para não duplicar
        await fetch(`http://localhost:5000/${tipoQuestao}/${projeto.id}`, {
          method: 'DELETE'
        });

        setTipoQuestao(novoEndpoint);
      } else {
        // Cenário B: Atualiza na mesma tabela (PUT)
        await fetch(`http://localhost:5000/${tipoQuestao}/${projeto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProject)
        });
      }

      // Atualiza a tela com os novos dados
      setProjeto(updatedProject);
      setShowProjetoForm(false);
      alert("Questão atualizada com sucesso!");
      
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert("Erro ao salvar as alterações.");
    }
  }

  // Helper para formatar data para o padrão BR
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Helper para renderizar as Alternativas (Lida com JSON ou String legada)
  const renderAlternatives = (alternativesData) => {
    if (!alternativesData) return "Sem alternativas cadastradas.";

    try {
        // Tenta fazer o parse do JSON (formato novo: {"A": "...", "B": "..."})
        const altsObj = JSON.parse(alternativesData);
        const keys = ['A', 'B', 'C', 'D', 'E'];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {keys.map((key) => (
                    altsObj[key] ? (
                        <div key={key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <strong style={{ marginRight: '8px', minWidth: '25px' }}>{key})</strong>
                            <div><LatexText content={altsObj[key]} /></div>
                        </div>
                    ) : null
                ))}
            </div>
        );
    } catch (e) {
        // Se der erro no JSON.parse, assume que é o formato antigo (texto puro)
        return <LatexText content={alternativesData} />;
    }
  };

  const isApproved = tipoQuestao === 'questõesAprovadas';
  const statusColor = isApproved ? styles.status_approved : styles.status_pending;

  // =========================================================================
  // 4. RENDERIZAÇÃO
  // =========================================================================
  return (
    <div className={styles.page_wrapper}>
      
      <button onClick={() => navigate(-1)} className={styles.back_btn}>
        <FaArrowLeft /> Voltar
      </button>

      <div className={styles.card_container}>
        {carregando ? (
          <div className={styles.loading}>
             <div className={styles.spinner}></div>
             <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* --- HEADER DO CARD --- */}
            <header className={styles.card_header}>
              <div className={styles.header_content}>
                <div className={`${styles.badge} ${statusColor}`}>
                   {isApproved ? <FaCheckCircle /> : <FaClock />}
                   <span>{projeto.categoryName ? projeto.categoryName.toUpperCase() : 'STATUS'}</span>
                </div>
                <h1 className={styles.title}>{projeto.name}</h1>
                 
                 <p className={styles.dates_info}>
                    <FaCalendarAlt/> 
                    <span> Criado: {formatDate(projeto.createdAt)}</span>
                    <span className={styles.separator}>|</span>
                    <span> Atualizado: <strong>{formatDate(projeto.updatedAt)}</strong></span>
                 </p>
              </div>

              <button 
                className={`${styles.action_btn} ${showProjetoForm ? styles.btn_cancel : styles.btn_edit}`} 
                onClick={() => setShowProjetoForm(!showProjetoForm)}
              >
                {showProjetoForm ? <><FaTimes /> Cancelar</> : <><FaEdit /> Editar Questão</>}
              </button>
            </header>

            <div className={styles.card_body}>
              
              {!showProjetoForm ? (
                // =========================================================
                // MODO VISUALIZAÇÃO (LEITURA)
                // =========================================================
                <div className={styles.view_mode}>

                  {/* ALERTA DE CORREÇÃO SOLICITADA */}
                  {String(projeto.categoryId) === '3' && projeto.reviewerComments && (
                      <div className={styles.alert_box}>
                          <h4><FaExclamationTriangle /> Atenção: Correção Solicitada</h4>
                          <p>"{projeto.reviewerComments}"</p>
                      </div>
                  )}

                  {/* GRID DE INFORMAÇÕES BÁSICAS */}
                  <section className={styles.info_grid}>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsPersonBadge/> Professor</span>
                      <p>{projeto.professorName}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}>Série/Ano</span>
                      <p>{projeto.serieAno}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsLayers/> Nivel/Categoria</span>
                      <p>{projeto.phaseLevel}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}>Grau de Dificuldade</span>
                      <p className={styles.difficulty_badge}>Nível {projeto.difficultyLevel}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsBook/> Tema BNCC</span>
                      <p>{projeto.bnccTheme}</p>
                    </div>
                  </section>

                  <hr className={styles.divider} />

                  {/* SEÇÃO DE CONTEÚDO (ENUNCIADO, ALTERNATIVAS, RESPOSTA) */}
                  <section className={styles.latex_section}>
                    <h3><BsCardText/> Conteúdo da Questão</h3>
                    
                    {/* Enunciado */}
                    <div className={styles.latex_block}>
                        <span className={styles.latex_label}>Enunciado:</span>
                        <div className={styles.latex_content}>
                            <LatexText content={projeto.questionStatement || "Sem enunciado"} />
                        </div>
                    </div>

                    {/* Imagem (Se houver) */}
                    {projeto.imageURL && (
                        <div className={styles.image_block}>
                           <img src={projeto.imageURL} alt="Imagem de suporte" />
                        </div>
                    )}

                    {/* Alternativas (RENDERIZADAS DO JSON) */}
                    <div className={styles.latex_block}>
                        <span className={styles.latex_label}>Alternativas:</span>
                        <div className={styles.latex_content}>
                            {renderAlternatives(projeto.alternatives)}
                        </div>
                    </div>

                    {/* Resposta Correta */}
                    <div className={`${styles.latex_block} ${styles.correct_block}`}>
                        <span className={styles.latex_label}>Resposta Correta:</span>
                        <strong>{projeto.correctAlternative}</strong>
                    </div>

                    {/* Resolução Detalhada */}
                    <div className={styles.latex_block}>
                        <span className={styles.latex_label}>Resolução Detalhada:</span>
                        <div className={styles.latex_content}>
                            <LatexText content={projeto.detailedResolution || "Sem resolução"} />
                        </div>
                    </div>

                    {/* Comentários do Revisor (Visualização Geral) */}
                    {projeto.reviewerComments && (
                        <div className={styles.latex_block}>
                            <span className={styles.latex_label}>Histórico de Comentários:</span>
                            <div className={styles.latex_content} style={{fontStyle: 'italic', color: '#666'}}>
                                <LatexText content={projeto.reviewerComments} />
                            </div>
                        </div>
                    )}
                  </section>
                </div>
              ) : (
                // =========================================================
                // MODO EDIÇÃO (CHAMA O COMPONENTE ProjectForme)
                // =========================================================
                <div className={styles.edit_mode}>
                  <ProjectForm
                    handleSubmit={editPost} // Passa a função de salvar
                    btnText="Salvar Alterações"
                    projectData={projeto}   // Passa os dados atuais para preencher os campos
                    // Nota: O ProjectForme já calcula permissões internamente, 
                    // então passamos apenas os dados necessários.
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Projetos;