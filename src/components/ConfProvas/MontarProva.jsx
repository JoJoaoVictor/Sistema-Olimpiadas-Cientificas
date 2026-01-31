import { useState, useEffect, useRef } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import styles from './MontarProva.module.css'; 
import SearchBar from '../form/SearchBar';

// IMAGENS
import tema from '../../img/tema.png'; 

// MODAIS
import ModalSalvarProva from './modal/ModalSalvarProva'; 
import ModalInfoQuestao from './modal/ModalInfoQuestao';

// === HELPER: AUTENTICAÇÃO (BACKEND 8000) ===
const getAuthHeaders = () => {
  const tokenString = localStorage.getItem('user_token');
  if (tokenString) {
    try {
      const tokenObj = JSON.parse(tokenString);
      const token = tokenObj.access_token || tokenObj.token; 
      return { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    } catch (e) {
      console.error("Erro ao ler token", e);
    }
  }
  return { 'Content-Type': 'application/json' };
};

// === PARSER (MANTIDO PARA A BUSCA) ===
const safeParseAlternatives = (rawAlt) => {
  if (typeof rawAlt !== 'string') return rawAlt;
  try {
    return JSON.parse(rawAlt);
  } catch (e) {
    // Ignora
  }
  try {
    const fixed = rawAlt.replace(/\\\\/g, '\\');
    return JSON.parse(fixed);
  } catch (e) {}

  const alternatives = {};
  const regex = /([a-eA-E])\)\s*(.*?)(?=\s*[a-eA-E]\)|$)/g;
  let match;
  let found = false;
  
  while ((match = regex.exec(rawAlt)) !== null) {
    found = true;
    alternatives[match[1].toLowerCase()] = match[2].trim();
  }
  
  if (found) return alternatives;
  return { "Opções": rawAlt };
};

function MontarProva() {
  // === ESTADOS ===
  const [projeto, setProjeto] = useState({});
  const [questoes, setQuestoes] = useState([]); 
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]); 
  const { id } = useParams(); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // === FILTROS ===
  const [habilidade, setHabilidade] = useState('');
  const [phaseLevel, setPhaseLevel] = useState(''); 
  const [status, setStatus] = useState('Pendente'); 
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [dificuldade, setDificuldade] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false); 

  // Modais
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false); 
  const [modalInfoAberto, setModalInfoAberto] = useState(false);
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);

  // Dados da Prova
  const [nomeProva, setNomeProva] = useState('');
  const [faseProva, setFaseProva] = useState('');

  // Estados PDF
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // === SEARCH & EFFECT ===
  const handleSearch = (term) => {
    setSearchTerm(term);
    setMostrarQuestoes(true);
  };

  useEffect(() => {
    // 1. Carregar Prova Existente
    if (id) {
      fetch(`http://localhost:5000/provasMontadas/${id}`)
        .then(res => {
          if (!res.ok) throw new Error(`Prova com ID ${id} não encontrada`);
          return res.json();
        })
        .then(data => {
          setProjeto(data);
          setQuestoesSelecionadas(data.questoes || []);
          if (data.fase) setFaseProva(data.fase);
          if (data.name) setNomeProva(data.name);
        })
        .catch(err => console.log(err));
    }
    
    // 2. Carregar Banco de Questões
    fetch('http://localhost:5000/questõesAprovadas')
      .then(res => res.json())
      .then(response => {
        let listaValida = [];
        if (Array.isArray(response)) listaValida = response;
        else if (response.data && Array.isArray(response.data)) listaValida = response.data;
        else if (response.data?.questoes) listaValida = response.data.questoes;
        else if (response.data?.results) listaValida = response.data.results;
        else if (response.questoes) listaValida = response.questoes;

        if (Array.isArray(listaValida)) {
            setQuestoes(listaValida);
        } else {
            setQuestoes([]); 
        }
      })
      .catch(err => {
          console.error("Erro fetch questoes:", err);
          setQuestoes([]);
      });
  }, [id]);

  // === MOVIMENTAÇÃO ===
  const moverQuestaoParaCima = (index) => {
    if (index > 0) {
      const novaLista = [...questoesSelecionadas];
      const temp = novaLista[index - 1];
      novaLista[index - 1] = novaLista[index];
      novaLista[index] = temp;
      setQuestoesSelecionadas(novaLista);
    }
  };

  const moverQuestaoParaBaixo = (index) => {
    if (index < questoesSelecionadas.length - 1) {
      const novaLista = [...questoesSelecionadas];
      const temp = novaLista[index + 1];
      novaLista[index + 1] = novaLista[index];
      novaLista[index] = temp;
      setQuestoesSelecionadas(novaLista);
    }
  };

  // === FILTROS ===
  const opcoesAno = [
      { value: '2', label: '2º Fundamental' }, { value: '3', label: '3º Fundamental' },
      { value: '4', label: '4º Fundamental' }, { value: '5', label: '5º Fundamental' },
      { value: '6', label: '6º Fundamental' }, { value: '7', label: '7º Fundamental' },
      { value: '8', label: '8º Fundamental' }, { value: '9', label: '9º Fundamental' },
      { value: '1', label: '1º Médio' }, { value: '2', label: '2º Médio' }, { value: '3', label: '3º Médio' },
  ];

  const handleAnoSelecionado = (selected) => {
    setMostrarQuestoes(true);
    setAnosSelecionados(selected || []); 
  };

  const normalizarAno = (valor) =>
  String(valor || '').toLowerCase().replace(/º|°|ano|\s/g, '').trim();

  function handleSelecionarQuestao(questao) {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  }

  function handleRemoverQuestao(idQuestao) {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== idQuestao));
  }

  // === SALVAR PROVA (Porta 5000) ===
  function salvarProva() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });

    const novaProva = {
      ...projeto,
      id: projeto.id || Date.now(),
      name: nomeProva || `Prova ${Date.now()}`,
      fase: faseProva,
      questoes: questoesSelecionadas,
      createdAt: projeto.createdAt || dataFormatada,
      anos: anosSelecionados.map(a => a.value), 
      status
    };

    const method = projeto.id ? 'PUT' : 'POST';
    const endpoint = projeto.id
      ? `http://localhost:5000/provasMontadas/${projeto.id}`
      : `http://localhost:5000/provasMontadas`;

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaProva),
    })
      .then(resp => {
        if (!resp.ok) throw new Error('Erro ao salvar prova');
        return resp.json();
      })
      .then(() => {
        alert('Prova salva com sucesso!');
        setModalSalvarAberto(false);
      })
      .catch(err => console.error('Erro ao salvar prova:', err));
  }

  // === LÓGICA DE FILTRAGEM ===
  const questoesFiltradas = mostrarQuestoes && Array.isArray(questoes)
  ? questoes.filter(q =>
      q.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!temaSelecionado || q.bnccTheme?.toLowerCase().includes(temaSelecionado.toLowerCase())) &&
      (!habilidade || q.abilityCode?.toLowerCase().includes(habilidade.toLowerCase())) &&
      (!phaseLevel || q.phaseLevel?.toLowerCase().includes(phaseLevel.toLowerCase())) &&
      (dificuldade === '' || String(q.difficultyLevel) === dificuldade) &&
      (anosSelecionados.length === 0 || anosSelecionados.some(a => normalizarAno(q.serieAno).includes(normalizarAno(a.value)))) 
    )
  : [];

  // ==================================================================================
  // === GERAÇÃO DE PDF VIA BACKEND (PORTA 8000) ===
  // ==================================================================================
  
  async function gerarPDF(e) {
    if (e && e.preventDefault) e.preventDefault();

    if (questoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma questão.');
      return;
    }

    setGerandoPDF(true);

    try {
        const payload = {
            name: nomeProva || 'Prova Sem Título',
            fase: faseProva,
            anos: anosSelecionados.map(a => a.label).join(', '),
            questoes: questoesSelecionadas
        };

        const response = await fetch('http://127.0.0.1:8000/api/v1/exams/generate_pdf', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorText = response.statusText;
            try {
               const errJson = await response.json();
               if(errJson.detail) errorText = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
            } catch(e) {}
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (error) {
        console.error("Falha ao gerar PDF:", error);
        alert(`Não foi possível gerar o PDF.\nCertifique-se de que o backend Python está rodando na porta 8000.\n\nDetalhes: ${error.message}`);
    } finally {
        setGerandoPDF(false);
    }
  }

  const abrirModalInfo = (questao) => {
    setQuestaoSelecionada(questao);
    setModalInfoAberto(true);
  };

  const fecharModalInfo = () => {
    setModalInfoAberto(false);
    setQuestaoSelecionada(null);
  };

  return (
    <div className={styles.container}>
      <img src={tema} alt="Tema" className={styles.tema} />

      {/* Loading Simples */}
      {gerandoPDF && (
          <div style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              backgroundColor: 'rgba(0,0,0,0.7)', 
              zIndex: 9999,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff'
          }}>
              <h3>Gerando PDF no Servidor...</h3>
              <p>Aguarde...</p>
          </div>
      )}

      <h2 className={styles.sectionTitle}>Buscar Questões</h2>

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
              options={opcoesAno}
              isMulti
              placeholder="Ano"
              value={anosSelecionados}
              onChange={(selected) => {
              setAnosSelecionados(selected || []);
              }}
              closeMenuOnSelect={false}
              isClearable
              styles={{
              control: (base, state) => ({ 
                      ...base,
                      height: '45px',
                      borderColor: state.isFocused ? '#007bff' : '#ccc',
                      outline: 0,
                
                    }),
              valueContainer: (base) => ({
                      ...base,
                      height: '40px',
                      padding: '0 0.5em',
                      overflow: 'auto', // Permite scroll se tiver muitos itens selecionados
                    }),
              input: (base) => ({
                      ...base,
                      margin: 0,
                      padding:0,
                    }),
              indicatorsContainer: (base) => ({
                      ...base,
                    }),
              multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#e0e0e0',
                      
                    }),
              multiValueLabel: (base) => ({
                      ...base,
                      color: '#797979',
                    }),
              placeholder: (base) => ({
                      ...base,
                      color: '#797979',
                    }),
              menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
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
            <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
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
      
      <div className={styles.resultsSection}>
        {mostrarQuestoes && (
          <>
            <h2 className={styles.sectionTitle}>Resultados da busca</h2>
            <ul className={styles.questoesList}>
              {questoesFiltradas.map((questao) => (
                <li className={styles.questionCard} key={questao.id}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                        <strong className={styles.cardTitle}>{questao.name}</strong>
                        <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => abrirModalInfo(questao)} title="Ver detalhes">
                             <BsFillInfoCircleFill />
                        </button>
                    </div>
                    {/* Tags Visíveis na Busca */}
                    <div className={styles.tagsWrapper}>
                        <span className={`${styles.tag} ${styles.tagDifficulty}`}> <strong>Grau. Dificuldade:</strong> {questao.difficultyLevel}/5</span>
                        <span className={`${styles.tag} ${styles.tagCode}`}><strong>Cód. Habilidade:</strong> {questao.abilityCode}</span>
                        <span className={styles.tag}><strong>Unidade Temática:</strong> {questao.bnccTheme}</span>
                        <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                        <span className={styles.tag}><strong>Nivel de Categoria:</strong> {questao.phaseLevel}</span>
                    </div>
                  </div>
                  
                  <div className={styles.actionsGroup}>
                    <button className={`${styles.btn} ${styles.btnAdd}`} onClick={() => handleSelecionarQuestao(questao)} title="Adicionar à prova">
                          + 
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {questoesFiltradas.length === 0 && <p className={styles.emptyState}>Nenhuma questão encontrada com os filtros atuais.</p>}
          </>
        )}
      </div>

      <div className={styles.selectedSection}>
         <h2 className={styles.sectionTitle}>Questões Selecionadas</h2>
         <ul className={styles.questoesList}>
            {questoesSelecionadas.length === 0 && <p className={styles.emptyState}>Sua prova ainda está vazia. Adicione questões acima.</p>}
            
            {questoesSelecionadas.map((questao, index) => (
              <li className={styles.questionCard} key={questao.id}>
                  <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                          <span style={{marginRight: '10px', fontWeight: 'bold', color: '#007bff'}}>#{index + 1}</span>
                          <strong className={styles.cardTitle}>{questao.name}</strong>
                          <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => abrirModalInfo(questao)}>
                              <BsFillInfoCircleFill />
                          </button>
                      </div>
                      
                      {/* ALTERAÇÃO SOLICITADA: Tags inseridas aqui igual aos Resultados da Busca */}
                      <div className={styles.tagsWrapper}>
                        <span className={`${styles.tag} ${styles.tagDifficulty}`}> <strong>Grau. Dificuldade:</strong> {questao.difficultyLevel}/5</span>
                        <span className={`${styles.tag} ${styles.tagCode}`}><strong>Cód. Habilidade:</strong> {questao.abilityCode}</span>
                        <span className={styles.tag}><strong>Unidade Temática:</strong> {questao.bnccTheme}</span>
                        <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                        <span className={styles.tag}><strong>Nivel de Categoria:</strong> {questao.phaseLevel}</span>
                      </div>
                  </div>

                  <div className={styles.actionsGroup}>
                      <div className={styles.moveButtons}>
                          <button className={styles.btnMove} onClick={() => moverQuestaoParaCima(index)} title="Mover para cima">⬆</button>
                          <button className={styles.btnMove} onClick={() => moverQuestaoParaBaixo(index)} title="Mover para baixo">⬇</button>
                      </div>
                      <button className={`${styles.btn} ${styles.btnRemove}`} onClick={() => handleRemoverQuestao(questao.id)} title="Remover questão">
                           <BsFillTrashFill /> Remover
                      </button>
                  </div>
              </li>
            ))}
          </ul>
      </div>

      <div className={styles.bottomActions}>
         <button className={`${styles.btn} ${styles.btnSave}`} onClick={() => setModalSalvarAberto(true)} disabled={gerandoPDF}>
            Salvar Prova
        </button>
        <button className={`${styles.btn} ${styles.btnPdf}`} onClick={(e) => gerarPDF(e)} disabled={gerandoPDF}>
            Visualizar PDF
        </button>
      </div>
      
      {modalSalvarAberto && (
         <ModalSalvarProva 
           isOpen={modalSalvarAberto}
           onClose={() => setModalSalvarAberto(false)}
           onConfirm={salvarProva}
           nome={nomeProva} setNomeProva={setNomeProva}
           fase={faseProva} setFase={setFaseProva}
           setAnosSelecionados={setAnosSelecionados}
           setStatus={setStatus}
         />
      )}

      {modalInfoAberto && questaoSelecionada && (
         <ModalInfoQuestao 
           questao={questaoSelecionada} 
           onClose={fecharModalInfo} 
         />
      )}
    </div>
  );
}

export default MontarProva;