// src/components/pages/Project_Page/Components_project/Project_Modals/Projetos.jsx
//
// ── ALTERAÇÃO 9 ────────────────────────────────────────────────────────────
// Antes: um useEffect lia localStorage para setar isRevisor. Isso causava
// dois bugs:
//   1. Ao trocar de conta, o componente ainda usava o role da sessão anterior
//      até ser desmontado/remontado — fazendo campos sumirem ou aparecerem errado.
//   2. Se o usuário sem permissão tentasse acessar a rota, o 403 do backend
//      era silenciado e a tela ficava em branco sem feedback.
//
// Agora:
//   - isRevisor vem do usePermission() (reativo ao AuthContext).
//   - O erro 403 é tratado explicitamente com mensagem clara na tela.

import styles from './Projetos.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiMapPin } from 'react-icons/fi';

import ProjectForm from '../../Project_Forme/ProjectForme.jsx';
import LatexText from '../LatexText.jsx';

import { FaEdit, FaArrowLeft, FaCheckCircle, FaClock, FaTimes, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { BsBook, BsPersonBadge, BsCardText, BsLayers } from 'react-icons/bs';

import api from '../../../../../services/api.js';
import { authService } from '../../../../../services/authService.jsx';
import { usePermission } from '../../../../../hooks/usePermission.jsx';

function Projetos() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // ── Substituição do useEffect de role ──────────────────────────────────
  // Antes: useEffect com localStorage → agora uma linha reativa
  const { isRevisor } = usePermission();

  const [projeto,         setProjeto]         = useState({});
  const [showProjetoForm, setShowProjetoForm] = useState(false);
  const [tipoQuestao,     setTipoQuestao]     = useState('projects');
  const [carregando,      setCarregando]      = useState(true);
  const [erroAcesso,      setErroAcesso]      = useState(false);

  // =========================================================================
  // BUSCAR DADOS
  // =========================================================================
  useEffect(() => {
    let isMounted = true;

    async function buscarProjeto() {
      if (!id) return;
      setCarregando(true);
      setErroAcesso(false);
      try {
        const response = await api.get(`/api/v1/questions/${id}`);
        if (isMounted && response.data.success) {
          const q = response.data.data.question;
          const projetoData = {
            id:                 q.id,
            name:               q.name,
            professorName:      q.professor_name,
            authorName:         q.author?.name || q.professor_name || 'Desconhecido',
            authorEmail:        q.author?.email || 'Não informado',
            authorPolo:         q.author?.profile?.campus || q.author?.profile?.cidade || 'Não informado',
            phaseLevel:         q.phase_level,
            grauId:             q.grau?.id,
            grauName:           q.grau?.name,
            difficultyLevel:    q.difficulty_level,
            knowledgeObjects:   q.knowledge_objects,
            bnccTheme:          q.bncc_theme,
            abilityCode:        q.ability_code,
            abilityDescription: q.ability_description,
            questionStatement:  q.question_statement,
            alternatives:       q.alternatives,
            correctAlternative: q.correct_alternative,
            detailedResolution: q.detailed_resolution,
            categoryId:         q.category_id,
            categoryName:       q.category?.name,
            reviewerComments:   q.reviewer_comments,
            imageURL:           q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
            imageRole:          q.image_role,
            imageId:            q.image?.id,
            createdAt:          q.created_at,
            updatedAt:          q.updated_at,
          };
          setProjeto(projetoData);
          setTipoQuestao(projetoData.categoryId === 2 ? 'questõesAprovadas' : 'projects');
        }
      } catch (err) {
        if (!isMounted) return;
        // ── Tratamento explícito do 403 ──────────────────────────────────
        // Antes: o erro era apenas logado no console e a tela ficava em branco.
        // Agora: seta erroAcesso=true e exibe mensagem clara ao usuário.
        if (err.response?.status === 403) {
          setErroAcesso(true);
        } else {
          console.error("Erro ao buscar questão:", err);
        }
      } finally {
        if (isMounted) setCarregando(false);
      }
    }

    buscarProjeto();
    return () => { isMounted = false; };
  }, [id]);

  // =========================================================================
  // SALVAR EDIÇÃO
  // =========================================================================
  async function editPost(dadosDoFormulario) {
    let categoryId = dadosDoFormulario.categoryId;
    if (!isRevisor && String(categoryId) === '3') {
      categoryId = 1;
      dadosDoFormulario.categoryName = "Revisão";
    }

    const payload = {
      name:                dadosDoFormulario.name,
      professor_name:      dadosDoFormulario.professorName,
      phase_level:         dadosDoFormulario.phaseLevel,
      grau_id:             dadosDoFormulario.grauId,
      difficulty_level:    Number(dadosDoFormulario.difficultyLevel),
      knowledge_objects:   dadosDoFormulario.knowledgeObjects,
      bncc_theme:          dadosDoFormulario.bnccTheme,
      ability_code:        dadosDoFormulario.abilityCode,
      ability_description: dadosDoFormulario.abilityDescription,
      question_statement:  dadosDoFormulario.questionStatement,
      alternatives:        dadosDoFormulario.alternatives,
      correct_alternative: dadosDoFormulario.correctAlternative.toUpperCase(),
      detailed_resolution: dadosDoFormulario.detailedResolution,
      category_id:         Number(categoryId) || null,
      reviewer_comments:   dadosDoFormulario.reviewerComments || "",
      image_id:            dadosDoFormulario.image?.id || null,
      image_role:          dadosDoFormulario.image?.role || null,
    };

    try {
      const response = await api.patch(`/api/v1/questions/${projeto.id}`, payload);
      if (response.data.success) {
        const updated = response.data.data.question;
        const projetoAtualizado = {
          ...projeto,
          name:               payload.name,
          professorName:      payload.professor_name,
          phaseLevel:         payload.phase_level,
          grauId:             payload.grau_id,
          grauName:           updated.grau?.name || projeto.grauName,
          difficultyLevel:    payload.difficulty_level,
          knowledgeObjects:   payload.knowledge_objects,
          bnccTheme:          payload.bncc_theme,
          abilityCode:        payload.ability_code,
          abilityDescription: payload.ability_description,
          questionStatement:  payload.question_statement,
          alternatives:       payload.alternatives,
          correctAlternative: payload.correct_alternative,
          detailedResolution: payload.detailed_resolution,
          categoryId:         payload.category_id,
          categoryName:       updated.category?.name || (payload.category_id === 2 ? 'Aprovado' : 'Revisão'),
          reviewerComments:   payload.reviewer_comments,
          imageURL:           updated.image?.url ? new URL(updated.image.url, api.defaults.baseURL).href : null,
          imageRole:          payload.image_role,
          imageId:            updated.image?.id,
          updatedAt:          updated.updated_at,
        };
        setProjeto(projetoAtualizado);
        setTipoQuestao(payload.category_id === 2 ? 'questõesAprovadas' : 'projects');
        setShowProjetoForm(false);
        alert("Questão atualizada com sucesso!");
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert("Erro ao salvar as alterações: " + authService._handleError(err));
    }
  }

  // =========================================================================
  // HELPERS
  // =========================================================================
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const renderAlternatives = (alternativesData) => {
    if (!alternativesData) return "Sem alternativas cadastradas.";
    const lines = alternativesData.split('\n');
    const altObj = {};
    lines.forEach(line => {
      const match = line.match(/^([a-e])\)\s*(.*)$/i);
      if (match) altObj[match[1].toUpperCase()] = match[2].trim();
    });
    if (Object.keys(altObj).length === 5) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {['A', 'B', 'C', 'D', 'E'].map(key =>
            altObj[key] ? (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <strong style={{ marginRight: '8px', minWidth: '25px' }}>{key})</strong>
                <div><LatexText content={altObj[key]} /></div>
              </div>
            ) : null
          )}
        </div>
      );
    }
    return <LatexText content={alternativesData} />;
  };

  const isApproved  = tipoQuestao === 'questõesAprovadas';
  const statusColor = isApproved ? styles.status_approved : styles.status_pending;

  const projectDataForForm = {
    ...projeto,
    serieAno: projeto.grauId,
    image: projeto.imageURL
      ? { url: projeto.imageURL, role: projeto.imageRole, id: projeto.imageId }
      : null,
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  // Tela de acesso negado — substitui o branco silencioso do 403
  if (erroAcesso) {
    return (
      <div className={styles.page_wrapper}>
        <button onClick={() => navigate(-1)} className={styles.back_btn} translate="no">
          <FaArrowLeft /> Voltar
        </button>
        <div className={styles.card_container}>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <FaExclamationTriangle size={40} color="#e74c3c" style={{ marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Acesso não permitido</h3>
            <p style={{ color: '#666' }}>
              Você não tem permissão para visualizar esta questão.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page_wrapper}>

      <button onClick={() => navigate(-1)} className={styles.back_btn} translate="no">
        <FaArrowLeft /> Voltar
      </button>

      <div className={styles.card_container}>
        {carregando ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Carregando dados...</p>
          </div>
        ) : (
          <>
            <header className={styles.card_header} translate="no">
              <div className={styles.header_content}>
                <div className={`${styles.badge} ${statusColor}`}>
                  {isApproved ? <FaCheckCircle /> : <FaClock />}
                  <span>{projeto.categoryName ? projeto.categoryName.toUpperCase() : 'STATUS'}</span>
                </div>
                <h1 className={styles.title}>{projeto.name}</h1>
                <p className={styles.dates_info}>
                  <FaCalendarAlt />
                  <span> Criado: {formatDate(projeto.createdAt)}</span>
                  <span className={styles.separator}>|</span>
                  <span> Atualizado: <strong>{formatDate(projeto.updatedAt)}</strong></span>
                </p>
                <p className={styles.dates_info} style={{ marginTop: '8px' }}>
                  <FiUser />
                  <span> <strong>{projeto.authorName}</strong></span>
                  <span className={styles.separator}>|</span>
                  <FiMail />
                  <span> <strong>{projeto.authorEmail}</strong></span>
                  <span className={styles.separator}>|</span>
                  <FiMapPin />
                  <span> <strong>{projeto.authorPolo}</strong></span>
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
                <div className={styles.view_mode}>
                  {String(projeto.categoryId) === '3' && projeto.reviewerComments && (
                    <div className={styles.alert_box}>
                      <h4><FaExclamationTriangle /> Atenção: Correção Solicitada</h4>
                      <p>"{projeto.reviewerComments}"</p>
                    </div>
                  )}
                  <section className={styles.info_grid}>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsPersonBadge /> Professor</span>
                      <p>{projeto.professorName}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}>Série/Ano</span>
                      <p>{projeto.grauName}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsLayers /> Nível/Categoria</span>
                      <p>{projeto.phaseLevel}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}>Grau de Dificuldade</span>
                      <p className={styles.difficulty_badge}>Nível {projeto.difficultyLevel}</p>
                    </div>
                    <div className={styles.info_box}>
                      <span className={styles.label}><BsBook /> Tema BNCC</span>
                      <p>{projeto.bnccTheme}</p>
                    </div>
                  </section>
                  <hr className={styles.divider} />
                  <section className={styles.latex_section}>
                    <h3><BsCardText /> Conteúdo da Questão</h3>
                    <div className={styles.latex_block}>
                      <span className={styles.latex_label}>Enunciado:</span>
                      <div className={styles.latex_content}>
                        <LatexText content={projeto.questionStatement || "Sem enunciado"} />
                      </div>
                    </div>
                    {projeto.imageURL && (
                      <div className={styles.image_block}>
                        <img src={projeto.imageURL} alt="Imagem de suporte" />
                      </div>
                    )}
                    <div className={styles.latex_block}>
                      <span className={styles.latex_label}>Alternativas:</span>
                      <div className={styles.latex_content}>
                        {renderAlternatives(projeto.alternatives)}
                      </div>
                    </div>
                    <div className={`${styles.latex_block} ${styles.correct_block}`}>
                      <span className={styles.latex_label}>Resposta Correta:</span>
                      <strong>{projeto.correctAlternative}</strong>
                    </div>
                    <div className={styles.latex_block}>
                      <span className={styles.latex_label}>Resolução Detalhada:</span>
                      <div className={styles.latex_content}>
                        <LatexText content={projeto.detailedResolution || "Sem resolução"} />
                      </div>
                    </div>
                    {projeto.reviewerComments && (
                      <div className={styles.latex_block}>
                        <span className={styles.latex_label}>Comentários:</span>
                        <div className={styles.latex_content} style={{ fontStyle: 'italic', color: '#666' }}>
                          <LatexText content={projeto.reviewerComments} />
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              ) : (
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