// src/components/ConfProvas/MontarProva.jsx
import { useState, useEffect } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import styles from './MontarProva.module.css';
import SearchBar from '../form/SearchBar';
import tema from '../../img/tema.png';

// Modais
import ModalSalvarProva from './modal/ModalSalvarProva';
import ModalInfoQuestao from './modal/ModalInfoQuestao';

// Serviços de API
import api from '../../services/api';
import { authService } from '../../services/authService';

// Helper para extrair número do ano a partir do nome do grau
const extrairNumeroAno = (nomeAno) => {
  const match = String(nomeAno || '').match(/\d+/);
  return match ? match[0] : '';
};

function MontarProva() {
  const { id } = useParams(); // ID da prova (se for edição)

  // Estados
  const [questoes, setQuestoes] = useState([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false);

  // Filtros
  const [habilidade, setHabilidade] = useState('');
  const [phaseLevel, setPhaseLevel] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [anosSelecionadosFiltro, setAnosSelecionadosFiltro] = useState([]);

  // Dados da prova (para o modal)
  const [nomeProva, setNomeProva] = useState('');
  const [faseProva, setFaseProva] = useState('');
  const [anosSelecionados, setAnosSelecionados] = useState([]); // anos da prova
  const [status, setStatus] = useState('PENDENTE');

  // Modais
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false);
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);

  // Estados de carregamento
  const [loadingQuestoes, setLoadingQuestoes] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Opções de filtro (mesmas usadas no modal)
  const opcoesAnoFiltro = [
    { value: '2', label: '2º Fundamental' },
    { value: '3', label: '3º Fundamental' },
    { value: '4', label: '4º Fundamental' },
    { value: '5', label: '5º Fundamental' },
    { value: '6', label: '6º Fundamental' },
    { value: '7', label: '7º Fundamental' },
    { value: '8', label: '8º Fundamental' },
    { value: '9', label: '9º Fundamental' },
    { value: '1', label: '1º Médio' },
    { value: '2', label: '2º Médio' },
    { value: '3', label: '3º Médio' },
  ];

  // Carregar questões aprovadas do backend
  useEffect(() => {
    const fetchQuestoes = async () => {
      setLoadingQuestoes(true);
      try {
        const response = await api.get('/api/v1/questions/', {
          params: { category_id: 2, per_page: 100 }
        });
        const data = response.data?.data?.questions || [];
        // Mapeia para incluir serieAno a partir do grau e URL absoluta da imagem
        const mapped = data.map(q => ({
          ...q,
          serieAno: q.grau?.name || q.serie_ano,
          imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
        }));
        setQuestoes(mapped);
      } catch (err) {
        console.error('Erro ao carregar questões:', err);
      } finally {
        setLoadingQuestoes(false);
      }
    };
    fetchQuestoes();
  }, []);

  // Carregar prova existente (se estiver editando)
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
            // Converter anos para o formato do select
            const anosOptions = (data.anos || []).map(a => {
              const num = extrairNumeroAno(a);
              return { value: num, label: a };
            });
            setAnosSelecionados(anosOptions);
            // As questões já vêm completas no objeto – adicionar imageURL também
            const questoesComUrl = (data.questions || []).map(q => ({
              ...q,
              imageURL: q.image?.url ? new URL(q.image.url, api.defaults.baseURL).href : null,
            }));
            setQuestoesSelecionadas(questoesComUrl);
          }
        } catch (err) {
          console.error('Erro ao carregar prova:', err);
        }
      };
      fetchProva();
    }
  }, [id]);

  // Função de busca (acionada pelo SearchBar)
  const handleSearch = (term) => {
    setSearchTerm(term);
    setMostrarQuestoes(true);
  };

  // Funções de seleção/remoção de questões
  const handleSelecionarQuestao = (questao) => {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  };

  const handleRemoverQuestao = (idQuestao) => {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== idQuestao));
  };

  // Movimentação (reordenação) das questões selecionadas
  const moverQuestaoParaCima = (index) => {
    if (index > 0) {
      const novaLista = [...questoesSelecionadas];
      [novaLista[index - 1], novaLista[index]] = [novaLista[index], novaLista[index - 1]];
      setQuestoesSelecionadas(novaLista);
    }
  };

  const moverQuestaoParaBaixo = (index) => {
    if (index < questoesSelecionadas.length - 1) {
      const novaLista = [...questoesSelecionadas];
      [novaLista[index], novaLista[index + 1]] = [novaLista[index + 1], novaLista[index]];
      setQuestoesSelecionadas(novaLista);
    }
  };

  // Selecionar todas as questões filtradas
  const selecionarTodasQuestoes = () => {
    if (questoesFiltradas.length === 0) {
      alert('Não há questões para selecionar!');
      return;
    }
    const novasQuestoes = questoesFiltradas.filter(
      q => !questoesSelecionadas.some(s => s.id === q.id)
    );
    if (novasQuestoes.length === 0) {
      alert('Todas as questões já estão selecionadas!');
      return;
    }
    setQuestoesSelecionadas([...questoesSelecionadas, ...novasQuestoes]);
    alert(`${novasQuestoes.length} questão(ões) adicionada(s) à prova!`);
  };

  // Limpar todas as questões selecionadas
  const limparTodasQuestoes = () => {
    if (questoesSelecionadas.length === 0) return;
    if (window.confirm(`Remover todas as ${questoesSelecionadas.length} questões?`)) {
      setQuestoesSelecionadas([]);
    }
  };

  // Salvar prova (chamado pelo modal)
  const salvarProva = async () => {
    const question_ids = questoesSelecionadas.map(q => q.id);
    const anos = anosSelecionados.map(a => a.value);

    const payload = {
      name: nomeProva,
      fase: faseProva,
      anos,
      status,
      question_ids,
    };
    
    console.log('Iniciando salvamento, setSalvando(true)');
    setSalvando(true);
    
    try {
      if (id) {
        await api.patch(`/api/v1/exams/${id}`, {
          name: nomeProva,
          fase: faseProva,
          anos,
          status,
        });
        await api.patch(`/api/v1/exams/${id}/questions`, { question_ids });
      } else {
        await api.post('/api/v1/exams', payload);
      }
      alert('Prova salva com sucesso!');
      setModalSalvarAberto(false);
    } catch (err) {
      console.error('Erro completo:', err);
      let errorMsg = 'Erro ao salvar prova';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ');
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else {
        errorMsg = err.message;
      }
      alert('Erro ao salvar prova: ' + errorMsg);
    } finally {
      setSalvando(false); // ← ESSENCIAL: reseta o estado de carregamento
    }
};

  // Gerar PDF
  const gerarPDF = async (e) => {
    e?.preventDefault();
    if (questoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma questão.');
      return;
    }
    setGerandoPDF(true);
    try {
      const payload = {
        
        name: nomeProva || 'Prova Sem Título',
        fase: faseProva,
        anos: anosSelecionados.map(a => a.label),
        questoes: questoesSelecionadas.map(questao => ({
          ...questao,
          image: questao.imageURL,
          image_role: questao.image_role,
        })),
        
      };
      console.log('Payload:', payload);
      const response = await api.post('/api/v1/exams/generate_pdf', payload, {
        responseType: 'blob',
        timeout: 30000, // 30 segundos (primeira execução pode demorar mais)
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      const errorMsg = authService._handleError(err);
      alert('Erro ao gerar PDF: ' + errorMsg);
    } finally {
      setGerandoPDF(false);
    }
  };
  // Abrir modal de informações da questão
  const abrirModalInfo = (questao) => {
    setQuestaoSelecionada(questao);
    setModalInfoAberto(true);
  };

  // Filtragem das questões (baseada nos filtros atuais)
  const questoesFiltradas = mostrarQuestoes
    ? questoes.filter(q => {
        const nomeMatch = q.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const temaMatch = !temaSelecionado || q.bncc_theme?.toLowerCase().includes(temaSelecionado.toLowerCase());
        const habMatch = !habilidade || q.ability_code?.toLowerCase().includes(habilidade.toLowerCase());
        const phaseMatch = !phaseLevel || q.phase_level?.toLowerCase().includes(phaseLevel.toLowerCase());
        const difMatch = dificuldade === '' || String(q.difficulty_level) === dificuldade;
        const anoMatch =
          anosSelecionadosFiltro.length === 0 ||
          anosSelecionadosFiltro.some(a =>
            extrairNumeroAno(q.serieAno).includes(extrairNumeroAno(a.value))
          );
        return nomeMatch && temaMatch && habMatch && phaseMatch && difMatch && anoMatch;
      })
    : [];

  return (
    <div className={styles.container}>
      <img src={tema} alt="Tema" className={styles.tema} />
      <h2 className={styles.sectionTitle}>Buscar Questões</h2>

      {/* Barra de busca e filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <SearchBar
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            onDebouncedChange={handleSearch}
            delay={400}
            placeholder="Digite o nome da questão..."
          />
        </div>

        <Select
          className={styles.react_select}
          isSearchable
          options={opcoesAnoFiltro}
          isMulti
          placeholder="Ano"
          value={anosSelecionadosFiltro}
          onChange={(selected) => setAnosSelecionadosFiltro(selected || [])}
          closeMenuOnSelect={false}
          isClearable
          styles={{
            control: (base, state) => ({
              ...base,
              height: '45px',
              borderColor: state.isFocused ? '#007bff' : '#ccc',
              outline: 0,
            }),
            valueContainer: (base) => ({ ...base, height: '40px', padding: '0 0.5em', overflow: 'auto' }),
            input: (base) => ({ ...base, margin: 0, padding: 0 }),
            indicatorsContainer: (base) => ({ ...base }),
            multiValue: (base) => ({ ...base, backgroundColor: '#e0e0e0' }),
            multiValueLabel: (base) => ({ ...base, color: '#797979' }),
            placeholder: (base) => ({ ...base, color: '#797979' }),
            menu: (base) => ({ ...base, zIndex: 9999 }),
          }}
        />

        <select
          className={styles.filterSelect}
          value={temaSelecionado}
          onChange={(e) => {
            setTemaSelecionado(e.target.value);
            setMostrarQuestoes(true);
          }}
        >
          <option value="">Unidade Temática</option>
          <option value="Álgebra">Álgebra</option>
          <option value="Geometria">Geometria</option>
          <option value="Grandezas e Medidas">Grandezas e Medidas</option>
          <option value="Números">Números</option>
          <option value="Probabilidade e estatística">Probabilidade e estatística</option>
          <option value="Álgebra / Geometria">Álgebra / Geometria</option>
          <option value="Probabilidade">Probabilidade</option>
          <option value="Estatística">Estatística</option>
        </select>

        <select className={styles.filterSelect}>
          <option value="">Objetos de Conhecimento</option>
        </select>

        <select
          className={styles.filterSelect}
          value={dificuldade}
          onChange={(e) => {
            setDificuldade(e.target.value);
            setMostrarQuestoes(true);
          }}
        >
          <option value="">Grau de Dificuldade</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

        <input
          type="text"
          className={styles.filterInput}
          placeholder="Buscar por Habilidade (Cód.)"
          value={habilidade}
          onChange={(e) => {
            setHabilidade(e.target.value);
            setMostrarQuestoes(true);
          }}
        />

        <input
          type="text"
          className={styles.filterInput}
          placeholder="Nível de Categoria"
          value={phaseLevel}
          onChange={(e) => {
            setPhaseLevel(e.target.value);
            setMostrarQuestoes(true);
          }}
        />
      </div>

      {/* Lista de questões encontradas */}
      <div className={styles.resultsSection}>
        {mostrarQuestoes && (
          <>
            <div className={styles.resultsHeader}>
              <h2 className={styles.sectionTitle}>Resultados da busca</h2>
              <div className={styles.resultsHeaderControls}>
                <span className={styles.resultsCount}>
                  {questoesFiltradas.length} questões
                </span>
                {questoesFiltradas.length > 0 && (
                  <button
                    className={`${styles.btn} ${styles.btnSelectAll}`}
                    onClick={selecionarTodasQuestoes}
                    title="Adicionar todas as questões filtradas à prova"
                  >
                    Selecionar todas
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
                      <button
                        className={`${styles.btn} ${styles.btnInfo}`}
                        onClick={() => abrirModalInfo(questao)}
                        title="Ver detalhes"
                      >
                        <BsFillInfoCircleFill />
                      </button>
                    </div>
                    <div className={styles.tagsWrapper}>
                      <span className={`${styles.tag} ${styles.tagDifficulty}`}>
                        <strong>Grau. Dificuldade:</strong> {questao.difficulty_level}/5
                      </span>
                      <span className={`${styles.tag} ${styles.tagCode}`}>
                        <strong>Cód. Habilidade:</strong> {questao.ability_code}
                      </span>
                      <span className={styles.tag}>
                        <strong>Unidade Temática:</strong> {questao.bncc_theme}
                      </span>
                      <span className={styles.tag}>
                        <strong>Ano:</strong> {questao.serieAno}
                      </span>
                      <span className={styles.tag}>
                        <strong>Nível de Categoria:</strong> {questao.phase_level}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actionsGroup}>
                    <button
                      className={`${styles.btn} ${styles.btnAdd}`}
                      onClick={() => handleSelecionarQuestao(questao)}
                      title="Adicionar à prova"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {questoesFiltradas.length === 0 && (
              <p className={styles.emptyState}>Nenhuma questão encontrada com os filtros atuais.</p>
            )}
          </>
        )}
      </div>

      {/* Lista de questões selecionadas */}
      <div className={styles.selectedSection}>
        <div className={styles.selectedHeader}>
          <h2 className={styles.sectionTitle}>Questões Selecionadas</h2>
          <div className={styles.selectedHeaderControls}>
            <span className={styles.selectedCount}>
              {questoesSelecionadas.length} questões
            </span>
            {questoesSelecionadas.length > 0 && (
              <button
                className={`${styles.btn} ${styles.btnClearAll}`}
                onClick={limparTodasQuestoes}
                title="Remover todas as questões da prova"
              >
                Limpar questões
              </button>
            )}
          </div>
        </div>

        <ul className={styles.questoesList}>
          {questoesSelecionadas.length === 0 && (
            <p className={styles.emptyState}>Sua prova ainda está vazia. Adicione questões acima.</p>
          )}
          {questoesSelecionadas.map((questao, index) => (
            <li className={styles.questionCard} key={questao.id}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <span style={{ marginRight: '10px', fontWeight: 'bold', color: '#007bff' }}>
                    #{index + 1}
                  </span>
                  <strong className={styles.cardTitle}>{questao.name}</strong>
                  <button
                    className={`${styles.btn} ${styles.btnInfo}`}
                    onClick={() => abrirModalInfo(questao)}
                  >
                    <BsFillInfoCircleFill />
                  </button>
                </div>
                <div className={styles.tagsWrapper}>
                  <span className={`${styles.tag} ${styles.tagDifficulty}`}>
                    <strong>Grau. Dificuldade:</strong> {questao.difficulty_level}/5
                  </span>
                  <span className={`${styles.tag} ${styles.tagCode}`}>
                    <strong>Cód. Habilidade:</strong> {questao.ability_code}
                  </span>
                  <span className={styles.tag}>
                    <strong>Unidade Temática:</strong> {questao.bncc_theme}
                  </span>
                  <span className={styles.tag}>
                    <strong>Ano:</strong> {questao.serieAno}
                  </span>
                  <span className={styles.tag}>
                    <strong>Nível de Categoria:</strong> {questao.phase_level}
                  </span>
                </div>
              </div>
              <div className={styles.actionsGroup}>
                <div className={styles.moveButtons}>
                  <button
                    className={styles.btnMove}
                    onClick={() => moverQuestaoParaCima(index)}
                    title="Mover para cima"
                  >
                    ⬆
                  </button>
                  <button
                    className={styles.btnMove}
                    onClick={() => moverQuestaoParaBaixo(index)}
                    title="Mover para baixo"
                  >
                    ⬇
                  </button>
                </div>
                <button
                  className={`${styles.btn} ${styles.btnRemove}`}
                  onClick={() => handleRemoverQuestao(questao.id)}
                  title="Remover questão"
                >
                  <BsFillTrashFill /> Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Botões de ação */}
      <div className={styles.bottomActions}>
        <button
          className={`${styles.btn} ${styles.btnSave}`}
          onClick={() => setModalSalvarAberto(true)}
          disabled={gerandoPDF || salvando}
        >
          Salvar Prova
        </button>
        <button
          className={`${styles.btn} ${styles.btnPdf}`}
          onClick={gerarPDF}
          disabled={gerandoPDF || salvando}
        >
          Visualizar PDF
        </button>
        {(gerandoPDF || salvando) && (
          <div className={styles.loadingOverlay}>
            <h3>{gerandoPDF ? 'Gerando PDF...' : 'Salvando...'}</h3>
            <p>Aguarde, isso pode levar alguns segundos na primeira vez.</p>
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalSalvarProva
        isOpen={modalSalvarAberto}
        onClose={() => setModalSalvarAberto(false)}
        onConfirm={salvarProva}
        nomeProva={nomeProva}
        setNomeProva={setNomeProva}
        fase={faseProva}
        setFase={setFaseProva}
        anosSelecionados={anosSelecionados}
        setAnosSelecionados={setAnosSelecionados}
        status={status}
        setStatus={setStatus}
      />

      {modalInfoAberto && questaoSelecionada && (
        <ModalInfoQuestao questao={questaoSelecionada} onClose={() => setModalInfoAberto(false)} />
      )}
    </div>
  );
}

export default MontarProva;