import styles from './Projetos.module.css';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react';

// Importação de Componentes
import ProjectForm from '../../Project_Forme/ProjectForme.jsx';
import LatexText from '../LatexText.jsx'; 

// Ícones
import { FaEdit, FaArrowLeft, FaCheckCircle, FaClock, FaTimes, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { BsBook, BsPersonBadge, BsCardText, BsLayers } from 'react-icons/bs';

// Serviços de API
import api from '../../../../../services/api.js';
import { authService } from '../../../../../services/authService.jsx';

function Projetos() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS PRINCIPAIS ---
  const [projeto, setProjeto] = useState({});
  const [showProjetoForm, setShowProjetoForm] = useState(false);
  const [tipoQuestao, setTipoQuestao] = useState('projects'); // 'projects' ou 'questõesAprovadas'
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
          setIsRevisor(['Revisor', 'revisor', 'admin', 'Admin'].includes(user.role));
        }
      } catch (error) {
        console.error("Erro ao ler permissões do usuário:", error);
      }
    }
  }, []);

  // =========================================================================
  // 2. LÓGICA DE BUSCA (API real)
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    async function buscarProjeto() {
      if (!id) return;
      setCarregando(true);
      try {
        const response = await api.get(`/api/v1/questions/${id}`);
        if (isMounted && response.data.success) {
          const q = response.data.data.question;
          // Mapeia os campos do backend (snake_case) para camelCase (usado no frontend)
          const projetoData = {
              id: q.id,
              name: q.name,
              professorName: q.professor_name,
              phaseLevel: q.phase_level,
              grauId: q.grau?.id,
              grauName: q.grau?.name,
              difficultyLevel: q.difficulty_level,
              knowledgeObjects: q.knowledge_objects,
              bnccTheme: q.bncc_theme,
              abilityCode: q.ability_code,
              abilityDescription: q.ability_description,
              questionStatement: q.question_statement,
              alternatives: q.alternatives,
              correctAlternative: q.correct_alternative,
              detailedResolution: q.detailed_resolution,
              categoryId: q.category_id,
              categoryName: q.category?.name,
              reviewerComments: q.reviewer_comments,
              imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
              imageRole: q.image_role,
              imageId: q.image?.id,
              createdAt: q.created_at,
              updatedAt: q.updated_at,
          };
          console.log('reviewer_comments vindo do backend:', q.reviewer_comments);
          console.log('projeto após setProjeto:', projetoData);
          setProjeto(projetoData);
          // Define tipoQuestao baseado no categoryId (2 = aprovada, 1 = pendente)
          setTipoQuestao(projetoData.categoryId === 2 ? 'questõesAprovadas' : 'projects');
        }
      } catch (err) {
        console.error("Erro ao buscar questão:", err);
      } finally {
        setCarregando(false);
      }
    }

    buscarProjeto();

    return () => { isMounted = false };
  }, [id]);

  // =========================================================================
  // 3. LÓGICA DE EDIÇÃO E SALVAMENTO
  // =========================================================================
  async function editPost(dadosDoFormulario) {
    // 1. Lógica de Negócio: se não for revisor e a questão estava com categoryId 3 (Correção Solicitada), volta para 1
    let categoryId = dadosDoFormulario.categoryId;
    if (!isRevisor && String(categoryId) === '3') {
      categoryId = 1;
      dadosDoFormulario.categoryName = "Revisão";
    }

    // 2. Monta payload no formato snake_case esperado pelo backend
    const payload = {
      name: dadosDoFormulario.name,
      professor_name: dadosDoFormulario.professorName,
      phase_level: dadosDoFormulario.phaseLevel,
      grau_id: dadosDoFormulario.grauId,
      difficulty_level: Number(dadosDoFormulario.difficultyLevel),
      knowledge_objects: dadosDoFormulario.knowledgeObjects,
      bncc_theme: dadosDoFormulario.bnccTheme,
      ability_code: dadosDoFormulario.abilityCode,
      ability_description: dadosDoFormulario.abilityDescription,
      question_statement: dadosDoFormulario.questionStatement,
      alternatives: dadosDoFormulario.alternatives, // já é string JSON
      correct_alternative: dadosDoFormulario.correctAlternative.toUpperCase(),
      detailed_resolution: dadosDoFormulario.detailedResolution,
      category_id: Number(categoryId) || null,
      reviewer_comments: dadosDoFormulario.reviewerComments || "",
      image_id: dadosDoFormulario.image?.id || null,
      image_role: dadosDoFormulario.image?.role || null,
    };

    try {
      // Usa o ID do projeto do estado (projeto.id) em vez de projectData
      const response = await api.patch(`/api/v1/questions/${projeto.id}`, payload);
     
      if (response.data.success) {
        const updated = response.data.data.question;
        // Atualiza o estado local com os novos dados
        const projetoAtualizado = {
            ...projeto,
            name: payload.name,
            professorName: payload.professor_name,
            phaseLevel: payload.phase_level,
            grauId: payload.grau_id,
            grauName: updated.grau?.name || projeto.grauName,
            difficultyLevel: payload.difficulty_level,
            knowledgeObjects: payload.knowledge_objects,
            bnccTheme: payload.bncc_theme,
            abilityCode: payload.ability_code,
            abilityDescription: payload.ability_description,
            questionStatement: payload.question_statement,
            alternatives: payload.alternatives,
            correctAlternative: payload.correct_alternative,
            detailedResolution: payload.detailed_resolution,
            categoryId: payload.category_id,
            categoryName: updated.category?.name || (payload.category_id === 2 ? 'Aprovado' : 'Revisão'),
            reviewerComments: payload.reviewer_comments,
            imageURL: updated.image?.url ? new URL(updated.image.url, api.defaults.baseURL).href : null,
            imageRole: payload.image_role,
            imageId: updated.image?.id,
            updatedAt: updated.updated_at,
        };
        setProjeto(projetoAtualizado);
        setTipoQuestao(payload.category_id === 2 ? 'questõesAprovadas' : 'projects');
        setShowProjetoForm(false);
        alert("Questão atualizada com sucesso!");
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMsg = authService._handleError(err);
      alert("Erro ao salvar as alterações: " + errorMsg);
    }
  }

  // Helper para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Helper para renderizar as alternativas (lida com string no formato "a) texto\nb) texto...")
  const renderAlternatives = (alternativesData) => {
    if (!alternativesData) return "Sem alternativas cadastradas.";
    // Tenta dividir por linhas e extrair letras
    const lines = alternativesData.split('\n');
    const altObj = {};
    lines.forEach(line => {
      const match = line.match(/^([a-e])\)\s*(.*)$/i);
      if (match) {
        altObj[match[1].toUpperCase()] = match[2].trim();
      }
    });
    if (Object.keys(altObj).length === 5) {
      const keys = ['A', 'B', 'C', 'D', 'E'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {keys.map((key) => (
            altObj[key] ? (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <strong style={{ marginRight: '8px', minWidth: '25px' }}>{key})</strong>
                <div><LatexText content={altObj[key]} /></div>
              </div>
            ) : null
          ))}
        </div>
      );
    } else {
      // Fallback: exibe como texto puro
      return <LatexText content={alternativesData} />;
    }
  };

  const isApproved = tipoQuestao === 'questõesAprovadas';
  const statusColor = isApproved ? styles.status_approved : styles.status_pending;

  // Prepara os dados para o formulário de edição
  const projectDataForForm = {
    ...projeto,
    serieAno: projeto.grauId, // o select do ProjectForme espera o ID
    image: projeto.imageURL ? { url: projeto.imageURL, role: projeto.imageRole, id: projeto.imageId } : null,
  };

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
                      <p>{projeto.grauName}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsLayers/> Nível/Categoria</span>
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

                    {/* Alternativas */}
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

                    {/* Comentários do Revisor */}
                    {projeto.reviewerComments && (
                        <div className={styles.latex_block}>
                            <span className={styles.latex_label}>Comentários:</span>
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
                    handleSubmit={editPost}
                    btnText="Salvar Alterações"
                    projectData={projectDataForForm}
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