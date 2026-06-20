// src/components/ConfProvas/QuestoesList.jsx
import { useState, useEffect } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import styles from './MontarProva.module.css'; 
import api from '../../services/api';

/* ---------- Funções auxiliares de filtro (mesmas do MontarProva) ---------- */
const safeString = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return String(val.value || val.label || val.habilidade || val.objetosDeConhecimento || val.unidadeTematica || '');
  }
  return String(val);
};

const isFilterActive = (val) => {
  if (!val) return false;
  const str = safeString(val).toLowerCase().trim();
  return (
    str !== '' &&
    str !== 'todos' &&
    str !== 'todas' &&
    str !== 'selecione' &&
    str !== 'selecionar' &&
    str !== 'all' &&
    str !== 'undefined' &&
    str !== 'null'
  );
};

const ITEMS_PER_PAGE = 20;

function QuestoesList({ 
  filtros, 
  mostrar, 
  searchTrigger, 
  onAddQuestao, 
  onAddQuestoes, 
  onInfoClick, 
  questoesSelecionadas 
}) {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Carrega as questões uma única vez aplicando a trava de segurança
  useEffect(() => {
    const fetchQuestoes = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/v1/questions', {
          params: { 
            page: 1, 
            per_page: 1000,              // Aumentado para garantir que traga todo o catálogo utilizável
            only_approved_applied: true  // 🌟 TRAVA EXTRA: OBRIGA o backend a ocultar as Pendentes nesta tela
          }
        });
        const data = response.data?.data?.questions || response.data?.questions || response.data || [];

        const mapeadas = data.map(q => {
          let foiAplicada = false;
          if (q.is_applied === true || String(q.is_applied) === "true" || q.is_applied === 1) {
            foiAplicada = true;
          }
          if (q.status && String(q.status).toUpperCase() === 'APLICADA') {
            foiAplicada = true;
          }

          return {
            ...q,
            is_applied: foiAplicada,
            serieAno: q.ano || q.grau?.name || q.serie_ano || q.serieAno || '',
            bncc_theme: q.unidadeTematica || q.bncc_theme || q.bnccTheme || q.tema_bncc || q.tema || '',
            knowledge_objects: q.objetosDeConhecimento || q.knowledge_objects || q.knowledgeObjects || q.knowledge_object || q.knowledgeObject || q.objetivo_conhecimento || '',
            ability_code: q.habilidade?.habilidade || (typeof q.habilidade === 'string' ? q.habilidade : '') || q.ability_code || q.abilityCode || '',
            phase_level: q.phase_level || q.phaseLevel || q.fase || '',
            difficulty_level: q.difficulty_level || q.difficultyLevel || q.dificuldade || 0,
            imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
          };
        });
        setAllQuestions(mapeadas);
      } catch (err) {
        console.error('Erro ao carregar questões:', err);
        setAllQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestoes();
  }, []);

  // Reseta a página quando um novo searchTrigger é disparado
  useEffect(() => {
    if (searchTrigger > 0) {
      setPaginaAtual(1);
    }
  }, [searchTrigger]);

  // ------------------------------------------------------------------
  //  LÓGICA DE FILTRAGEM (idêntica à original)
  // ------------------------------------------------------------------
  const questoesFiltradas = mostrar
    ? allQuestions.filter(q => {
        const f = filtros;

        // Status de uso (Como o backend só enviou Aprovadas e Aplicadas, 'ineditas' vira sinônimo de prontas/aprovadas)
        const isAplicada = q.is_applied === true;
        const passaFiltroUso =
          f.statusUso === 'todas' ? true :
          f.statusUso === 'aplicadas' ? isAplicada :
          f.statusUso === 'ineditas' ? !isAplicada : true;
        if (!passaFiltroUso) return false;

        const filterSearch = safeString(f.searchTerm || f.search || f.texto);
        const filterTema = safeString(f.temaSelecionado || f.tema || f.unidadeTematica);
        const filterObjeto = safeString(f.objetoConhecimento || f.objeto || f.objetosDeConhecimento || f.knowledge_objects);
        const filterHabilidade = safeString(f.habilidade || f.ability_code || f.abilityCode);
        const filterFase = safeString(f.phaseLevel || f.phase_level || f.fase);
        const filterDif = safeString(f.dificuldade || f.difficulty_level || f.difficulty);

        // Texto livre
        if (isFilterActive(filterSearch)) {
          const pool = String([
            q.name, q.enunciado, q.description, q.texto, q.body, q.question,
            q.knowledge_objects, q.ability_code, q.bncc_theme, q.serieAno
          ].filter(Boolean).join(' ')).toLowerCase();
          if (!pool.includes(filterSearch.toLowerCase().trim())) return false;
        }

        // Tema BNCC
        if (isFilterActive(filterTema)) {
          const qTema = String(q.bncc_theme).toLowerCase().trim();
          const fTema = filterTema.toLowerCase().trim();
          if (!qTema.includes(fTema) && !fTema.includes(qTema)) return false;
        }

        // Objeto de conhecimento
        if (isFilterActive(filterObjeto)) {
          const qObj = String(q.knowledge_objects).toLowerCase().trim();
          const fObj = filterObjeto.toLowerCase().trim();
          if (!qObj.includes(fObj) && !fObj.includes(qObj)) return false;
        }

        // Código da habilidade
        if (isFilterActive(filterHabilidade)) {
          const qHab = String(q.ability_code).toLowerCase().replace(/[()]/g, '').trim();
          const fHab = filterHabilidade.toLowerCase().replace(/[()]/g, '').trim();
          if (!qHab.includes(fHab) && !fHab.includes(qHab)) return false;
        }

        // Nível de fase
        if (isFilterActive(filterFase)) {
          const qFase = String(q.phase_level || '').toLowerCase().trim();
          const fFase = filterFase.toLowerCase().trim();
          if (!qFase.includes(fFase)) return false;
        }

        // Dificuldade
        if (isFilterActive(filterDif)) {
          if (String(q.difficulty_level) !== filterDif) return false;
        }

        // Anos selecionados
        if (f.anosSelecionadosFiltro && f.anosSelecionadosFiltro.length > 0) {
          const anosPossiveis = [];

          const matchTexto = safeString(q.serieAno || q.ano).match(/\d+/);
          if (matchTexto) {
            const n = parseInt(matchTexto[0], 10);
            anosPossiveis.push(n, n - 1, n + 1);
          }

          const matchBNCC = safeString(q.ability_code).toUpperCase().match(/EF(\d+)/);
          if (matchBNCC) {
            const nBNCC = parseInt(matchBNCC[1], 10);
            anosPossiveis.push(nBNCC, nBNCC - 1, nBNCC + 1);
          }

          const bateuAno = f.anosSelecionadosFiltro.some(a => {
            const digitosFiltro = [];
            if (a && typeof a === 'object') {
              const mLabel = safeString(a.label).match(/\d+/);
              if (mLabel) digitosFiltro.push(parseInt(mLabel[0], 10));
              const mVal = safeString(a.value).match(/\d+/);
              if (mVal) digitosFiltro.push(parseInt(mVal[0], 10));
            } else {
              const mSimples = safeString(a).match(/\d+/);
              if (mSimples) digitosFiltro.push(parseInt(mSimples[0], 10));
            }
            return digitosFiltro.some(fAno => anosPossiveis.includes(fAno));
          });

          if (!bateuAno) return false;
        }

        return true;
      })
    : [];

  // ------------------------------------------------------------------
  //  PAGINAÇÃO
  // ------------------------------------------------------------------
  const totalPaginas = Math.ceil(questoesFiltradas.length / ITEMS_PER_PAGE);
  const inicio = (paginaAtual - 1) * ITEMS_PER_PAGE;
  const questoesPagina = questoesFiltradas.slice(inicio, inicio + ITEMS_PER_PAGE);

  const handlePrevPage = () => setPaginaAtual(p => Math.max(1, p - 1));
  const handleNextPage = () => setPaginaAtual(p => Math.min(totalPaginas, p + 1));

  // ------------------------------------------------------------------
  //  RENDERIZAÇÃO
  // ------------------------------------------------------------------
  return (
    <>
      {/* CABEÇALHO */}
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Resultados da busca</h2>
        {mostrar && !loading && (
          <div className={styles.panelControls}>
            <span className={styles.countBadge}>
              {questoesFiltradas.length} questões
            </span>
            {questoesFiltradas.length > 0 && (
              <button
                className={`${styles.btn} ${styles.btnSelectAll}`}
                onClick={() => onAddQuestoes(questoesFiltradas)}
              >
                Selecionar todas
              </button>
            )}
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      {!mostrar ? (
        <div className={styles.emptyState}>
          Aplique os filtros e clique em "Buscar" para ver as questões.
        </div>
      ) : loading ? (
        <div className={styles.emptyState}>Carregando questões...</div>
      ) : (
        <div className={styles.scrollableList}>
          {questoesFiltradas.length === 0 ? (
            <p className={styles.emptyState}>Nenhuma questão corresponde aos filtros.</p>
          ) : (
            <>
              <ul className={styles.questoesList}>
                {questoesPagina.map((questao) => {
                  const isSelected = questoesSelecionadas.some(q => q.id === questao.id);
                  return (
                    <li
                      className={`${styles.questionCard} ${isSelected ? styles.selectedCard : ''}`}
                      key={questao.id}
                    >
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <strong className={styles.cardTitle}>{questao.name}</strong>
                          <button
                            className={`${styles.btn} ${styles.btnInfo}`}
                            onClick={() => onInfoClick(questao)}
                          >
                            <BsFillInfoCircleFill />
                          </button>
                          {questao.is_applied ? (
                            <span className={styles.tag} style={{ backgroundColor: '#d1ecf1', color: '#0e4c7e' }}>
                              <strong>Aplicada</strong>
                            </span>
                          ) : (
                            <span className={styles.tag} style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                              <strong>Aprovada</strong>
                            </span>
                          )}
                        </div>
                        <div className={styles.tagsWrapper}>
                          <span className={`${styles.tag} ${styles.tagDifficulty}`}>
                            <strong>Dif:</strong> {questao.difficulty_level}/5
                          </span>
                          <span className={`${styles.tag} ${styles.tagCode}`}>
                            <strong>Cód:</strong> {questao.ability_code}
                          </span>
                          <span className={styles.tag}><strong>Tema:</strong> {questao.bncc_theme}</span>
                          <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                        </div>
                      </div>
                      <div className={styles.actionsGroup}>
                        <button
                          className={`${styles.btn} ${styles.btnAdd}`}
                          onClick={() => onAddQuestao(questao)}
                          disabled={isSelected}
                          title={isSelected ? 'Questão já adicionada' : 'Adicionar questão'}
                        >
                          +
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* CONTROLES DE PAGINAÇÃO */}
              {totalPaginas > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.btnPage}
                    onClick={handlePrevPage}
                    disabled={paginaAtual === 1}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    className={styles.btnPage}
                    onClick={handleNextPage}
                    disabled={paginaAtual === totalPaginas}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

export default QuestoesList;