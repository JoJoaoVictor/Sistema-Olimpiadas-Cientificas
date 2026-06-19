// src/components/ConfProvas/MontarProva.jsx
import { useState, useEffect } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import styles from './MontarProva.module.css';
import tema from '../../img/calculator.png';

// Modais
import ModalSalvarProva from './modal/ModalSalvarProva';
import ModalInfoQuestao from './modal/ModalInfoQuestao';

// Componentes
import QuestoesFilter from './QuestoesFilter';
import QuestoesList from './QuestoesList'; // novo componente

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
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0); // gatilho para resetar página

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

  // Carregar prova existente (mantido igual)
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
              serieAno: q.ano || q.grau?.name || q.serie_ano || q.serieAno,
              bncc_theme: q.unidadeTematica || q.bncc_theme || q.bnccTheme || q.tema_bncc || q.tema || '',
              knowledge_objects: q.objetosDeConhecimento || q.knowledge_objects || q.knowledgeObjects || q.knowledge_object || q.knowledgeObject || q.objetivo_conhecimento || '',
              ability_code: q.habilidade?.habilidade || (typeof q.habilidade === 'string' ? q.habilidade : '') || q.ability_code || q.abilityCode || '',
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

  // Sincroniza BNCCs customizadas (mantido)
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

  // Dispara busca e reseta paginação
  const handleFilterSearch = () => {
    setMostrarQuestoes(true);
    setSearchTrigger(prev => prev + 1);
  };

  // Funções de manipulação da lista de selecionadas
  const handleSelecionarQuestao = (questao) => {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  };

  const handleAdicionarTodas = (questoes) => {
    const novas = questoes.filter(q => !questoesSelecionadas.some(s => s.id === q.id));
    if (novas.length === 0) {
      alert('Todas as questões já estão selecionadas!');
      return;
    }
    setQuestoesSelecionadas([...questoesSelecionadas, ...novas]);
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

  const limparTodasQuestoes = () => {
    if (window.confirm(`Remover todas as ${questoesSelecionadas.length} questões?`)) {
      setQuestoesSelecionadas([]);
    }
  };

  // Salvar / PDF
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.page_title}>Elaboração de Provas</h1>
            <p className={styles.subtitle}>Gerencie e crie provas com questões cadastradas</p>
          </div>
          <div className={styles.icon_wrapper_exams}>
            <div className={styles.bg_circle_exams}></div>
            <img
              src={tema}
              alt="Ícone Biblioteca de Livros"
              className={styles.exams_icon_img}
            />
          </div>
        </header>
      </div>

      {/* FILTROS */}
      <div className={styles.filtersWrapper}>
        <h2 className={styles.sectionTitle} style={{ margin: '15px' }}>Filtrar Questões</h2>
        <QuestoesFilter
          filtros={filtros}
          setFiltros={setFiltros}
          setMostrarQuestoes={handleFilterSearch} // agora dispara busca + trigger
        />
      </div>

      {/* PAINÉIS DUPLOS */}
      <div className={styles.dualPanel}>
        {/* PAINEL ESQUERDO: RESULTADOS (agora componente separado) */}
        <div className={styles.panel}>
          <QuestoesList
            filtros={filtros}
            mostrar={mostrarQuestoes}
            searchTrigger={searchTrigger}
            onAddQuestao={handleSelecionarQuestao}
            onAddQuestoes={handleAdicionarTodas}
            onInfoClick={(questao) => {
              setQuestaoSelecionada(questao);
              setModalInfoAberto(true);
            }}
            questoesSelecionadas={questoesSelecionadas}
          />
        </div>

        {/* PAINEL DIREITO: SELECIONADAS (inalterado) */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Questões Selecionadas</h2>
            <div className={styles.panelControls}>
              <span className={`${styles.countBadge} ${styles.selectedBadge}`}>
                {questoesSelecionadas.length} questões
              </span>
              {questoesSelecionadas.length > 0 && (
                <button
                  className={`${styles.btn} ${styles.btnClearAll}`}
                  onClick={limparTodasQuestoes}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className={styles.scrollableList}>
            <ul className={styles.questoesList}>
              {questoesSelecionadas.map((questao, index) => (
                <li className={styles.questionCard} key={questao.id}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <span className={styles.indexBadge}>#{index + 1}</span>
                      <strong className={styles.cardTitle}>{questao.name}</strong>
                      <button
                        className={`${styles.btn} ${styles.btnInfo}`}
                        onClick={() => { setQuestaoSelecionada(questao); setModalInfoAberto(true); }}
                      >
                        <BsFillInfoCircleFill />
                      </button>
                      {questao.is_applied ? (
                        <span className={styles.tag} style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
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
                    <div className={styles.moveButtons}>
                      <button className={styles.btnMove} onClick={() => moverQuestao(index, 'cima')}>⬆</button>
                      <button className={styles.btnMove} onClick={() => moverQuestao(index, 'baixo')}>⬇</button>
                    </div>
                    <button
                      className={`${styles.btn} ${styles.btnRemove}`}
                      onClick={() => handleRemoverQuestao(questao.id)}
                    >
                      <BsFillTrashFill /> Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* BARRA DE AÇÕES */}
      <div className={styles.bottomActions}>
        <button
          className={`${styles.btn} ${styles.btnSave}`}
          onClick={() => setModalSalvarAberto(true)}
          disabled={gerandoPDF || salvando}
        >
          Salvar
        </button>
        <button
          className={`${styles.btn} ${styles.btnPdf}`}
          onClick={gerarPDF}
          disabled={gerandoPDF || salvando}
        >
          Visualizar PDF
        </button>
      </div>

      {/* Overlay de loading */}
      {gerandoPDF && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <h3>Gerando PDF...</h3>
          <p>A organizar as suas questões, aguarde um momento.</p>
        </div>
      )}

      {/* Modais */}
      <ModalSalvarProva
        isOpen={modalSalvarAberto} onClose={() => setModalSalvarAberto(false)} onConfirm={salvarProva}
        nomeProva={nomeProva} setNomeProva={setNomeProva} fase={faseProva} setFase={setFaseProva}
        anosSelecionados={anosSelecionados} setAnosSelecionados={setAnosSelecionados} status={status} setStatus={setStatus}
      />
      {modalInfoAberto && questaoSelecionada && (
        <ModalInfoQuestao questao={questaoSelecionada} onClose={() => setModalInfoAberto(false)} />
      )}
    </div>
  );
}

export default MontarProva;