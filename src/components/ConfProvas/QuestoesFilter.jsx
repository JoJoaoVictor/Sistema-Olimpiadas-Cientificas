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

// RESOLVIDO: Valores únicos para evitar que o react-select duplique chaves (ex: 2º Fund vs 2º Médio)
const opcoesAnoFiltro = [
  { value: 'fundamental_2', label: '2º Fundamental' },
  { value: 'fundamental_3', label: '3º Fundamental' },
  { value: 'fundamental_4', label: '4º Fundamental' },
  { value: 'fundamental_5', label: '5º Fundamental' },
  { value: 'fundamental_6', label: '6º Fundamental' },
  { value: 'fundamental_7', label: '7º Fundamental' },
  { value: 'fundamental_8', label: '8º Fundamental' },
  { value: 'fundamental_9', label: '9º Fundamental' },
  { value: 'medio_1', label: '1º Médio' }, 
  { value: 'medio_2', label: '2º Médio' },
  { value: 'medio_3', label: '3º Médio' },
];

// FUNÇÃO ISOLADA QUE TRADUZ O ANO SELECIONADO PARA O ID REAL QUE O SEU HELPER/BANCO ESPERE
const obterGrauIdBNCC = (ano) => {
  if (!ano) return 0;
  const label = String(ano.label || '');
  const value = String(ano.value || '');
  
  // Extrai o número contido no texto (ex: 'fundamental_6' ou '6º Fundamental' vira 6)
  const match = value.match(/\d+/) || label.match(/\d+/);
  if (!match) return 0;
  const numeroAno = parseInt(match[0], 10);

  // CORREÇÃO DO BUG DE OFFSET DO FUNDAMENTAL:
  // Se for Fundamental, o banco espera (Ano - 1). Ex: 6º Ano = ID 5.
  if (label.includes('Fundamental') || value.includes('fundamental')) {
    return numeroAno - 1;
  }
  
  // CORREÇÃO DO ENSINO MÉDIO:
  // No padrão sequencial da BNCC, após o 9º ano (ID 8), o 1º Médio costuma ser ID 9, 2º Médio ID 10 e 3º Médio ID 11.
  if (label.includes('Médio') || value.includes('medio')) {
    if (numeroAno === 1) return 9;
    if (numeroAno === 2) return 10;
    if (numeroAno === 3) return 11;
  }

  return numeroAno;
};

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

  /// 1. Cascata: Atualizar Temas com base nos Anos (Com ID Corrigido)
  useEffect(() => {
    const todosTemas = new Set();
    const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
      ? filtros.anosSelecionadosFiltro 
      : opcoesAnoFiltro;

    anosParaBuscar.forEach(ano => {
      const grauIdCorrigido = obterGrauIdBNCC(ano);
      const temasDoAno = getTemasByGrauId(grauIdCorrigido) || [];
      
      temasDoAno.forEach(t => {
          const nomeTema = typeof t === 'object' ? t.unidadeTematica : t;
          if (nomeTema) todosTemas.add(nomeTema);
      });
    });

    setTemasDisponiveis(Array.from(todosTemas).sort());
    
    // Resetar filhos
    setFiltros(prev => ({ ...prev, temaSelecionado: '', objetoConhecimento: '', habilidade: '' }));
  }, [filtros.anosSelecionadosFiltro, setFiltros]);

  // 2. Cascata: Atualizar Objetos com base nos Anos + Tema Selecionado (Com ID Corrigido)
  useEffect(() => {
    if (filtros.temaSelecionado) {
      const todosObjetos = new Set();
      const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
        ? filtros.anosSelecionadosFiltro 
        : opcoesAnoFiltro;

      anosParaBuscar.forEach(ano => {
        const grauIdCorrigido = obterGrauIdBNCC(ano);
        const objetosDoAno = getObjetosByTema(grauIdCorrigido, filtros.temaSelecionado) || [];
        
        objetosDoAno.forEach(o => {
          const nomeObjeto = typeof o === 'object' ? o.objetosDeConhecimento : o;
          if (nomeObjeto) {
             todosObjetos.add(String(nomeObjeto).trim());
          }
        });
      });

      setObjetosDisponiveis(Array.from(todosObjetos).sort());
    } else {
      setObjetosDisponiveis([]);
    }
    // Resetar filhos
    setFiltros(prev => ({ ...prev, objetoConhecimento: '', habilidade: '' }));
  }, [filtros.temaSelecionado, filtros.anosSelecionadosFiltro, setFiltros]);

  // 3. Cascata: Atualizar Habilidades com base nos Anos + Tema + Objeto (Com ID Corrigido)
  useEffect(() => {
    if (filtros.objetoConhecimento) {
      const todasHabilidades = new Map();
      const anosParaBuscar = filtros.anosSelecionadosFiltro.length > 0 
        ? filtros.anosSelecionadosFiltro 
        : opcoesAnoFiltro;

      anosParaBuscar.forEach(ano => {
        const grauIdCorrigido = obterGrauIdBNCC(ano);
        const habilidadesDoAno = getHabilidadesByObjeto(grauIdCorrigido, filtros.temaSelecionado, filtros.objetoConhecimento) || [];
        
        habilidadesDoAno.forEach(h => {
          const code = typeof h === 'object' ? (h.codigo || h.habilidade) : h;
          if (code) todasHabilidades.set(code, h);
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