// src/components/ConfProvas/MontarProva.jsx
import { useState, useEffect } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import styles from './MontarProva.module.css';
import tema from '../../img/tema.png';

// Modais
import ModalSalvarProva from './modal/ModalSalvarProva';
import ModalInfoQuestao from './modal/ModalInfoQuestao';

// Componente de Filtro Isolado
import QuestoesFilter from './QuestoesFilter';

// Serviços de API
import api from '../../services/api';
import { authService } from '../../services/authService';

const extrairNumeroAno = (nomeAno) => {
  const match = String(nomeAno || '').match(/\d+/);
  return match ? match[0] : '';
};

function MontarProva() {
  const { id } = useParams();

  // Estados Globais
  const [questoes, setQuestoes] = useState([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false);

  // Estado Unificado dos Filtros
  const [filtros, setFiltros] = useState({
    searchTerm: '',
    anosSelecionadosFiltro: [],
    temaSelecionado: '',
    objetoConhecimento: '',
    habilidade: '',
    dificuldade: '',
    phaseLevel: '',
    statusUso: 'todas'
  });

  // Dados da Prova
  const [nomeProva, setNomeProva] = useState('');
  const [faseProva, setFaseProva] = useState('');
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [status, setStatus] = useState('PENDENTE');

  // Controle de Modais e Loading
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false);
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Carregar questões aprovadas
  useEffect(() => {
    const fetchQuestoes = async () => {
      try {
        const response = await api.get('/api/v1/questions', {
          params: { page: 1, per_page: 100 }
        });
        
        const data = response.data?.data?.questions || response.data?.questions || response.data || [];
        
        setQuestoes(data.map(q => {
          // NOVA REGRA: Confia APENAS no campo oficial is_applied que o banco mandou, 
          // ou no campo status textual (se houver). Remove as deduções com arrays.
          let foiAplicada = false;
          if (q.is_applied === true || String(q.is_applied) === "true" || q.is_applied === 1) {
             foiAplicada = true;
          }
          // Caso o backend use a string "status":
          if (q.status && String(q.status).toUpperCase() === 'APLICADA') {
             foiAplicada = true;
          }
          
          return {
            ...q,
            is_applied: foiAplicada,
            serieAno: q.grau?.name || q.serie_ano || q.serieAno || '',
            bncc_theme: q.bncc_theme || q.bnccTheme || '',
            knowledge_objects: q.knowledge_objects || q.knowledgeObjects || '',
            ability_code: q.ability_code || q.abilityCode || '',
            phase_level: q.phase_level || q.phaseLevel || '',
            difficulty_level: q.difficulty_level || q.difficultyLevel || 0,
            imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
          };
        }));
      } catch (err) {
        console.error('Erro ao carregar questões para montagem de prova:', err);
      }
    };
    fetchQuestoes();
  }, []);

  // Carregar prova existente
  useEffect(() => {
    if (id) {
      const fetchProva = async () => {
        try {
          const response = await api.get(`/api/v1/exams/${id}`);
          const data = response.data?.data?.exam;
          if (data) {
            setNomeProva(data.name || '');
            setFaseProva(data.fase || '');
            setStatus(data.status || 'PENDENTE');
            setAnosSelecionados((data.anos || []).map(a => ({ value: extrairNumeroAno(a), label: a })));
            setQuestoesSelecionadas((data.questions || []).map(q => ({
              ...q,
              is_applied: true, 
              serieAno: q.grau?.name || q.serie_ano || q.serieAno,
              imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
            })));
          }
        } catch (err) {
          console.error('Erro ao carregar prova:', err);
        }
      };
      fetchProva();
    }
  }, [id]);

  // Sincroniza as BNCCs customizadas
  useEffect(() => {
    const carregarBNCCsCustomizadas = async () => {
      try {
        const response = await api.get('/api/v1/bncc-custom'); 
        if (response.data && Array.isArray(response.data)) {
          localStorage.setItem('customBNCC', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Erro ao sincronizar BNCCs customizadas:", error);
      }
    };
    carregarBNCCsCustomizadas();
  }, []);

  // Funções da Tabela
  const handleSelecionarQuestao = (questao) => {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  };

  const handleRemoverQuestao = (idQuestao) => {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== idQuestao));
  };

  const moverQuestao = (index, direcao) => {
    const novaLista = [...questoesSelecionadas];
    const target = direcao === 'cima' ? index - 1 : index + 1;
    if (target >= 0 && target < novaLista.length) {
      [novaLista[index], novaLista[target]] = [novaLista[target], novaLista[index]];
      setQuestoesSelecionadas(novaLista);
    }
  };

  const selecionarTodasQuestoes = () => {
    const novas = questoesFiltradas.filter(q => !questoesSelecionadas.some(s => s.id === q.id));
    if (novas.length === 0) return alert('Todas já estão selecionadas!');
    setQuestoesSelecionadas([...questoesSelecionadas, ...novas]);
  }; 

  const limparTodasQuestoes = () => {
    if (window.confirm(`Remover todas as ${questoesSelecionadas.length} questões?`)) {
      setQuestoesSelecionadas([]);
    }
  };

  const salvarProva = async () => {
    const payload = {
      name: nomeProva, fase: faseProva, status,
      anos: anosSelecionados.map(a => a.value),
      question_ids: questoesSelecionadas.map(q => q.id),
    };
    setSalvando(true);
    try {
      if (id) {
        await api.patch(`/api/v1/exams/${id}`, { name: payload.name, fase: payload.fase, anos: payload.anos, status });
        await api.patch(`/api/v1/exams/${id}/questions`, { question_ids: payload.question_ids });
      } else {
        await api.post('/api/v1/exams', payload);
      }
      alert('Prova salva com sucesso!');
      setModalSalvarAberto(false);
    } catch (err) {
      alert('Erro ao salvar prova.');
    } finally {
      setSalvando(false);
    }
  };

  const gerarPDF = async () => {
    if (questoesSelecionadas.length === 0) return alert('Selecione pelo menos uma questão.');
    setGerandoPDF(true);
    try {
      const payload = {
        name: nomeProva || 'Prova Sem Título', fase: faseProva,
        anos: anosSelecionados.map(a => a.label),
        questoes: questoesSelecionadas.map(q => ({ ...q, image: q.imageURL })),
      };
      const response = await api.post('/api/v1/exams/generate_pdf', payload, { responseType: 'blob' });
      const url = window.URL.createObjectURL(response.data);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert('Erro ao gerar PDF: ' + authService._handleError(err));
    } finally {
      setGerandoPDF(false);
    }
  };

  // Aplicação dos Filtros na Lista Otimizada
  const questoesFiltradas = mostrarQuestoes ? questoes.filter(q => {
    const f = filtros;
    const isAplicada = q.is_applied === true;
    
    const passaFiltroUso = 
        f.statusUso === 'todas' ? true :
        f.statusUso === 'aplicadas' ? isAplicada :
        f.statusUso === 'ineditas' ? !isAplicada : true;

    return passaFiltroUso && 
           (!f.searchTerm || q.name?.toLowerCase().includes(f.searchTerm.toLowerCase())) &&
           (!f.temaSelecionado || q.bncc_theme?.toLowerCase().includes(f.temaSelecionado.toLowerCase())) &&
           (!f.objetoConhecimento || q.knowledge_objects?.toLowerCase().includes(f.objetoConhecimento.toLowerCase())) &&
           (!f.habilidade || q.ability_code?.toLowerCase().includes(f.habilidade.toLowerCase())) &&
           (!f.phaseLevel || q.phase_level?.toLowerCase().includes(f.phaseLevel.toLowerCase())) &&
           (!f.dificuldade || String(q.difficulty_level) === f.dificuldade) &&
           (f.anosSelecionadosFiltro.length === 0 || f.anosSelecionadosFiltro.some(a => 
             extrairNumeroAno(q.serieAno).includes(extrairNumeroAno(a.value))
           ));
  }) : [];

  return (
    <div className={styles.container}>
      <img src={tema} alt="Tema" className={styles.tema} />
      <h2 className={styles.sectionTitle}>Buscar Questões</h2>

      <QuestoesFilter 
        filtros={filtros} 
        setFiltros={setFiltros} 
        setMostrarQuestoes={setMostrarQuestoes} 
      />

      <div className={styles.resultsSection}>
        {mostrarQuestoes && (
          <>
            <div className={styles.resultsHeader}>
              <h2 className={styles.sectionTitle}>Resultados da busca</h2>
              <div className={styles.resultsHeaderControls}>
                <span className={styles.resultsCount}>{questoesFiltradas.length} questões</span>
                {questoesFiltradas.length > 0 && (
                  <button className={`${styles.btn} ${styles.btnSelectAll}`} onClick={selecionarTodasQuestoes}>
                    Selecione todas
                  </button>
                )}
              </div>
            </div>

            <ul className={styles.questoesList}>
              {questoesFiltradas.map((questao) => (
                <li className={styles.questionCard} key={questao.id}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <strong className={styles.cardTitle}>{questao.name}</strong>
                      <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => { setQuestaoSelecionada(questao); setModalInfoAberto(true); }}>
                        <BsFillInfoCircleFill />
                      </button>
                        {questao.is_applied ? (
                          <span className={styles.tag} style={{ backgroundColor: '#d1ecf1', color: '#0e4c7e', border: '1px solid #ffeeba' }}>
                            <strong>Aplicada</strong>
                          </span>
                        ) : (
                          <span className={styles.tag} style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
                            <strong>Aprovada</strong>
                          </span>
                        )}
                    </div>
                    <div className={styles.tagsWrapper}>
                      <span className={`${styles.tag} ${styles.tagDifficulty}`}><strong>Dif:</strong> {questao.difficulty_level}/5</span>
                      <span className={`${styles.tag} ${styles.tagCode}`}><strong>Cód:</strong> {questao.ability_code}</span>
                      <span className={styles.tag}><strong>Tema:</strong> {questao.bncc_theme}</span>
                      <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                    </div>
                  </div>
                  <div className={styles.actionsGroup}>
                    <button className={`${styles.btn} ${styles.btnAdd}`} onClick={() => handleSelecionarQuestao(questao)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={styles.selectedSection}>
        <div className={styles.selectedHeader}>
          <h2 className={styles.sectionTitle}>Questões Selecionadas</h2>
          <div className={styles.selectedHeaderControls}>
            <span className={styles.selectedCount}>{questoesSelecionadas.length} questões</span>
            {questoesSelecionadas.length > 0 && (
              <button className={`${styles.btn} ${styles.btnClearAll}`} onClick={limparTodasQuestoes}>Limpar</button>
            )}
          </div>
        </div>

        <ul className={styles.questoesList}>
          {questoesSelecionadas.map((questao, index) => (
            <li className={styles.questionCard} key={questao.id}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span style={{ marginRight: '10px', fontWeight: 'bold', color: '#007bff' }}>#{index + 1}</span>
                  <strong className={styles.cardTitle}>{questao.name}</strong>
                  <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => { setQuestaoSelecionada(questao); setModalInfoAberto(true); }}>
                        <BsFillInfoCircleFill />
                      </button>
                        {questao.is_applied ? (
                          <span className={styles.tag} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>
                            <strong>Aplicada</strong>
                          </span>
                        ) : (
                          <span className={styles.tag} style={{ backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
                            <strong>Aprovada</strong>
                          </span>
                        )}
                </div>
                <div className={styles.tagsWrapper}>
                      <span className={`${styles.tag} ${styles.tagDifficulty}`}><strong>Dif:</strong> {questao.difficulty_level}/5</span>
                      <span className={`${styles.tag} ${styles.tagCode}`}><strong>Cód:</strong> {questao.ability_code}</span>
                      <span className={styles.tag}><strong>Tema:</strong> {questao.bncc_theme}</span>
                      <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                    </div>
              </div>
              <div className={styles.actionsGroup}>
                <div className={styles.moveButtons}>
                  <button className={styles.btnMove} onClick={() => moverQuestao(index, 'cima')}>⬆</button>
                  <button className={styles.btnMove} onClick={() => moverQuestao(index, 'baixo')}>⬇</button>
                </div>
                <button className={`${styles.btn} ${styles.btnRemove}`} onClick={() => handleRemoverQuestao(questao.id)}>
                  <BsFillTrashFill /> Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.bottomActions}>
        <button className={`${styles.btn} ${styles.btnSave}`} onClick={() => setModalSalvarAberto(true)} disabled={gerandoPDF || salvando}>Salvar</button>
        <button className={`${styles.btn} ${styles.btnPdf}`} onClick={gerarPDF} disabled={gerandoPDF || salvando}>Visualizar PDF</button>
      </div>

      {gerandoPDF && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', zIndex: 9999, color: 'white'
        }}>
            <div style={{
                border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid #fff',
                borderRadius: '50%', width: '50px', height: '50px',
                animation: 'spin 1s linear infinite', marginBottom: '20px'
            }}></div>
            <h3>Gerando PDF...</h3>
            <p>A organizar as suas questões, aguarde um momento.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <ModalSalvarProva
        isOpen={modalSalvarAberto} onClose={() => setModalSalvarAberto(false)} onConfirm={salvarProva}
        nomeProva={nomeProva} setNomeProva={setNomeProva} fase={faseProva} setFase={setFaseProva}
        anosSelecionados={anosSelecionados} setAnosSelecionados={setAnosSelecionados} status={status} setStatus={setStatus}
      />
      {modalInfoAberto && questaoSelecionada && <ModalInfoQuestao questao={questaoSelecionada} onClose={() => setModalInfoAberto(false)} />}
    </div>
  );
}

export default MontarProva;