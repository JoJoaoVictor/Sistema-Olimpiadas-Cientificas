import { useState, useEffect } from 'react';
import Select from 'react-select';
import SearchBar from '../form/SearchBar';
import styles from './MontarProva.module.css';
import ModalAddBNCC from './modal/ModalAddBNCC';

// Helpers da BNCC
import { 
  getTemasByGrauId, 
  getObjetosByTema, 
  getHabilidadesByObjeto 
} from '../../data/bnccHelper';

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

function QuestoesFilter({ filtros, setFiltros, setMostrarQuestoes }) {
  // Opções dinâmicas para a Cascata
  const [modalBNCCAberto, setModalBNCCAberto] = useState(false);
  const [temasDisponiveis, setTemasDisponiveis] = useState([]);
  const [objetosDisponiveis, setObjetosDisponiveis] = useState([]);
  const [habilidadesDisponiveis, setHabilidadesDisponiveis] = useState([]);

  // Atualiza um filtro específico e exibe os resultados
  const updateFiltro = (chave, valor) => {
    setFiltros(prev => ({ ...prev, [chave]: valor }));
    setMostrarQuestoes(true);
  };

  // 1. Cascata: Atualizar Temas com base nos Anos
  useEffect(() => {
    const todosTemas = new Set();
    const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
      ? filtros.anosSelecionadosFiltro 
      : opcoesAnoFiltro;

    anosParaBuscar.forEach(ano => {
      const temasDoAno = getTemasByGrauId(Number(ano.value)) || [];
      temasDoAno.forEach(t => todosTemas.add(t));
    });

    setTemasDisponiveis(Array.from(todosTemas).sort());
    
    // Resetar filhos
    setFiltros(prev => ({ ...prev, temaSelecionado: '', objetoConhecimento: '', habilidade: '' }));
  }, [filtros.anosSelecionadosFiltro, setFiltros]);

  // 2. Cascata: Atualizar Objetos com base nos Anos + Tema Selecionado
  useEffect(() => {
    if (filtros.temaSelecionado) {
      const todosObjetos = new Set();
      const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
        ? filtros.anosSelecionadosFiltro 
        : opcoesAnoFiltro;

      anosParaBuscar.forEach(ano => {
        // CORREÇÃO: Passamos o ID numérico primeiro, e depois o tema!
        const objetosDoAno = getObjetosByTema(Number(ano.value), filtros.temaSelecionado) || [];
        objetosDoAno.forEach(o => todosObjetos.add(o));
      });

      setObjetosDisponiveis(Array.from(todosObjetos).sort());
    } else {
      setObjetosDisponiveis([]);
    }
    // Resetar filhos
    setFiltros(prev => ({ ...prev, objetoConhecimento: '', habilidade: '' }));
  }, [filtros.temaSelecionado, filtros.anosSelecionadosFiltro, setFiltros]);

  // 3. Cascata: Atualizar Habilidades com base nos Anos + Tema + Objeto
  useEffect(() => {
    if (filtros.objetoConhecimento) {
      const todasHabilidades = new Map(); // Usamos Map para não duplicar códigos de habilidade iguais
      const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
        ? filtros.anosSelecionadosFiltro 
        : opcoesAnoFiltro;

      anosParaBuscar.forEach(ano => {
        // CORREÇÃO: Passamos o ID numérico, depois o tema, e depois o objeto!
        const habilidadesDoAno = getHabilidadesByObjeto(Number(ano.value), filtros.temaSelecionado, filtros.objetoConhecimento) || [];
        habilidadesDoAno.forEach(h => {
          const code = typeof h === 'object' ? h.codigo : h;
          todasHabilidades.set(code, h);
        });
      });

      setHabilidadesDisponiveis(Array.from(todasHabilidades.values()));
    } else {
      setHabilidadesDisponiveis([]);
    }
    setFiltros(prev => ({ ...prev, habilidade: '' }));
  }, [filtros.objetoConhecimento, filtros.temaSelecionado, filtros.anosSelecionadosFiltro, setFiltros]);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.searchContainer}>
        <SearchBar
          onChange={(e) => updateFiltro('searchTerm', e.target.value)}
          value={filtros.searchTerm}
          onDebouncedChange={(val) => updateFiltro('searchTerm', val)}
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
        value={filtros.anosSelecionadosFiltro}
        onChange={(selected) => updateFiltro('anosSelecionadosFiltro', selected || [])}
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
          menu: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />

      <select
        className={styles.filterSelect}
        value={filtros.temaSelecionado}
        onChange={(e) => updateFiltro('temaSelecionado', e.target.value)}
        disabled={temasDisponiveis.length === 0}
      >
        <option value="">Unidade Temática</option>
        {temasDisponiveis.map((tema, idx) => (
          <option key={idx} value={tema}>{tema}</option>
        ))}
      </select>

      <select 
        className={styles.filterSelect}
        value={filtros.objetoConhecimento}
        onChange={(e) => updateFiltro('objetoConhecimento', e.target.value)}
        disabled={!filtros.temaSelecionado || objetosDisponiveis.length === 0}
      >
        <option value="">Objetos de Conhecimento</option>
        {objetosDisponiveis.map((obj, idx) => (
          <option key={idx} value={obj}>{obj}</option>
        ))}
      </select>

      <select
        className={styles.filterSelect}
        value={filtros.habilidade}
        onChange={(e) => updateFiltro('habilidade', e.target.value)}
        disabled={!filtros.objetoConhecimento || habilidadesDisponiveis.length === 0}
      >
        <option value="">Habilidade (Cód.)</option>
        {habilidadesDisponiveis.map((hab, idx) => {
          const codigo = typeof hab === 'object' ? hab.codigo : hab;
          return <option key={idx} value={codigo}>{codigo}</option>
        })}
      </select>

      <select
        className={styles.filterSelect}
        value={filtros.dificuldade}
        onChange={(e) => updateFiltro('dificuldade', e.target.value)}
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
        placeholder="Nível de Categoria"
        value={filtros.phaseLevel}
        onChange={(e) => updateFiltro('phaseLevel', e.target.value)}
      />
      <button 
          onClick={() => setModalBNCCAberto(true)} 
          style={{ padding: '0 15px', marginLeft: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Nova BNCC
        </button>
      
      {/* RENDERIZA O MODAL */}
      <ModalAddBNCC 
        isOpen={modalBNCCAberto} 
        onClose={() => setModalBNCCAberto(false)} 
      />
      <div className="filtro-grupo">
        <label>Status da Questão:</label>
        <select 
            className={styles.filterSelect}
            value={filtros.statusUso} 
            onChange={(e) => setFiltros({ ...filtros, statusUso: e.target.value })}
        >
            <option value="todas">Todas as Questões</option>
            <option value="ineditas">Aprovadas</option>
            <option value="aplicadas">Aplicadas </option>
        </select>
      </div>
    </div>
  );
}

export default QuestoesFilter;