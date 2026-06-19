// src/components/Projects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import styles from './Projects.module.css';

// Componentes do Projeto
import Loading from '../../Layout/Loading';
import SearchBar from '../../form/SearchBar';
import ProjectsCard from './../Project_Page/Components_project/Project_Card/ProjectsCard';
import ProjectList from './../Project_Page/Components_project/Project_List/ProjectList';

// Dependências Externas
import { LuLayoutGrid, LuLayoutList, LuPlus, LuCalendarDays } from "react-icons/lu";
import { FaInbox, FaCheckDouble, FaSadTear } from "react-icons/fa";
import useAuth from '../../../hooks/useAuth';
import CalculatorIcon from '../../../img/logov2-fotor.png';

// Serviço de API e helpers BNCC
import api from '../../../services/api';
import { authService } from '../../../services/authService';
import { 
  getTemasByGrauId, 
  getObjetosByTema, 
  getHabilidadesByObjeto 
} from '../../../data/bnccHelper';

// Opções de ano (mesmo formato usado no componente original)
const opcoesAno = [
  { value: '2º Fundamental', label: '2º Fundamental' },
  { value: '3º Fundamental', label: '3º Fundamental' },
  { value: '4º Fundamental', label: '4º Fundamental' },
  { value: '5º Fundamental', label: '5º Fundamental' },
  { value: '6º Fundamental', label: '6º Fundamental' },
  { value: '7º Fundamental', label: '7º Fundamental' },
  { value: '8º Fundamental', label: '8º Fundamental' },
  { value: '9º Fundamental', label: '9º Fundamental' },
  { value: '1º Médio',       label: '1º Médio'       },
  { value: '2º Médio',       label: '2º Médio'       },
  { value: '3º Médio',       label: '3º Médio'       },
];

// Função que converte o ano selecionado (objeto {value,label}) para o ID usado pelos helpers BNCC
const obterGrauIdBNCC = (ano) => {
  if (!ano) return 0;
  const label = String(ano.label || '');
  const value = String(ano.value || '');
  
  const match = value.match(/\d+/) || label.match(/\d+/);
  if (!match) return 0;
  const numeroAno = parseInt(match[0], 10);

  // Fundamental: ID = ano - 1 (ex: 6º ano → ID 5)
  if (label.includes('Fundamental') || value.includes('Fundamental')) {
    return numeroAno - 1;
  }
  // Médio: 1º → 9, 2º → 10, 3º → 11
  if (label.includes('Médio') || value.includes('Médio')) {
    if (numeroAno === 1) return 9;
    if (numeroAno === 2) return 10;
    if (numeroAno === 3) return 11;
  }
  return numeroAno;
};

function Project() {
  // === AUTENTICAÇÃO ===
  const { user } = useAuth();
  const isProfessor = user?.role?.toUpperCase() === "PROFESSOR" || user?.role?.toUpperCase() === "ADMIN";
  const isEstagiario = user?.role?.toUpperCase() === "STUDENT";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const meuCampusAtual = user?.profile?.campus || '';

  // === ESTADOS GERAIS ===
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros principais
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('recentes');
  const [tipoQuestao, setTipoQuestao] = useState('aprovadas');
  const [viewMode, setViewMode] = useState('list');

  // Filtros de data e campus
  const [dateFilter, setDateFilter] = useState('all');
  const [searchDate, setSearchDate] = useState('');
  const [filtrarMeuCampus, setFiltrarMeuCampus] = useState(false);

  // Estado unificado para filtros cascata BNCC
  const [filtrosBNCC, setFiltrosBNCC] = useState({
    anosSelecionadosFiltro: [],
    temaSelecionado: '',
    objetoConhecimento: '',
    habilidade: '',
    dificuldade: '',
    phaseLevel: '',
  });

  // Opções dinâmicas para cascata
  const [temasDisponiveis, setTemasDisponiveis] = useState([]);
  const [objetosDisponiveis, setObjetosDisponiveis] = useState([]);
  const [habilidadesDisponiveis, setHabilidadesDisponiveis] = useState([]);

  // Helper para atualizar um campo do filtrosBNCC
  const updateFiltroBNCC = (chave, valor) => {
    setFiltrosBNCC(prev => ({ ...prev, [chave]: valor }));
  };

  // ============== EFEITOS DA CASCATA (mesma lógica do QuestoesFilter) ==============
  // 1. Temas baseados nos anos selecionados
  useEffect(() => {
    const todosTemas = new Set();
    const anosParaBuscar = filtrosBNCC.anosSelecionadosFiltro.length > 0 
      ? filtrosBNCC.anosSelecionadosFiltro 
      : opcoesAno; // se nenhum ano selecionado, mostra todos

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
    updateFiltroBNCC('temaSelecionado', '');
    updateFiltroBNCC('objetoConhecimento', '');
    updateFiltroBNCC('habilidade', '');
  }, [filtrosBNCC.anosSelecionadosFiltro]);

  // 2. Objetos baseados no tema selecionado + anos
  useEffect(() => {
    if (filtrosBNCC.temaSelecionado) {
      const todosObjetos = new Set();
      const anosParaBuscar = filtrosBNCC.anosSelecionadosFiltro.length > 0 
        ? filtrosBNCC.anosSelecionadosFiltro 
        : opcoesAno;

      anosParaBuscar.forEach(ano => {
        const grauIdCorrigido = obterGrauIdBNCC(ano);
        const objetosDoAno = getObjetosByTema(grauIdCorrigido, filtrosBNCC.temaSelecionado) || [];
        objetosDoAno.forEach(o => {
          const nomeObjeto = typeof o === 'object' ? o.objetosDeConhecimento : o;
          if (nomeObjeto) todosObjetos.add(String(nomeObjeto).trim());
        });
      });

      setObjetosDisponiveis(Array.from(todosObjetos).sort());
    } else {
      setObjetosDisponiveis([]);
    }
    updateFiltroBNCC('objetoConhecimento', '');
    updateFiltroBNCC('habilidade', '');
  }, [filtrosBNCC.temaSelecionado, filtrosBNCC.anosSelecionadosFiltro]);

  // 3. Habilidades baseadas no objeto + tema + anos
  useEffect(() => {
    if (filtrosBNCC.objetoConhecimento) {
      const todasHabilidades = new Map();
      const anosParaBuscar = filtrosBNCC.anosSelecionadosFiltro.length > 0 
        ? filtrosBNCC.anosSelecionadosFiltro 
        : opcoesAno;

      anosParaBuscar.forEach(ano => {
        const grauIdCorrigido = obterGrauIdBNCC(ano);
        const habilidadesDoAno = getHabilidadesByObjeto(
          grauIdCorrigido, 
          filtrosBNCC.temaSelecionado, 
          filtrosBNCC.objetoConhecimento
        ) || [];
        habilidadesDoAno.forEach(h => {
          const code = typeof h === 'object' ? (h.codigo || h.habilidade) : h;
          if (code) todasHabilidades.set(code, h);
        });
      });

      setHabilidadesDisponiveis(Array.from(todasHabilidades.values()));
    } else {
      setHabilidadesDisponiveis([]);
    }
    updateFiltroBNCC('habilidade', '');
  }, [filtrosBNCC.objetoConhecimento, filtrosBNCC.temaSelecionado, filtrosBNCC.anosSelecionadosFiltro]);

  // ============== CARREGAMENTO DE QUESTÕES ==============
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        let categoryId = 2; // aprovadas
        if (tipoQuestao === 'pendentes') categoryId = 1;
        else if (tipoQuestao === 'aplicadas') categoryId = 3;

        const response = await api.get('/api/v1/questions/', {
          params: { category_id: categoryId, per_page: 100 },
        });

        const backendQuestions = response.data?.data?.questions || [];
        const convertedQuestions = backendQuestions.map(q => ({
          id:                 q.id,
          name:               q.name,
          professorName:      q.professor_name,
          phaseLevel:         q.phase_level,
          serieAno:           q.grau?.name || q.serie_ano || '',
          grauId:             q.grau_id,
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
          categoryName:       q.category?.name || 'Sem categoria',
          reviewerComments:   q.reviewer_comments,
          images:             q.images || [],
          createdAt:          q.created_at,
          updatedAt:          q.updated_at,
          authorName:         q.professor_name || q.author?.name || 'Desconhecido',
          authorEmail:        q.author?.email || 'Não informado',
          authorPolo:         q.author_campus || q.author?.profile?.campus || q.author_cidade || q.author?.profile?.cidade || 'Não informado'
        }));

        setProjects(convertedQuestions);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar questões:', err);
        setError(authService._handleError(err) || 'Erro ao carregar questões.');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [tipoQuestao]);

  // ============== REMOVER QUESTÃO ==============
  async function removeProject(id) {
    if (!window.confirm('Tem certeza que deseja excluir esta questão?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/v1/questions/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
      alert('Questão removida com sucesso!');
    } catch (err) {
      console.error('Erro ao remover:', err);
      alert('Erro ao remover: ' + authService._handleError(err));
    } finally {
      setLoading(false);
    }
  }

  // ============== FILTRAGEM ==============
  const filteredProjects = projects
    .filter(p => {
      if (filtrarMeuCampus && meuCampusAtual) {
        return p.authorPolo === meuCampusAtual;
      }
      return true;
    })
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    // Filtro de ano exato usando os selecionados
    .filter(p => {
      if (filtrosBNCC.anosSelecionadosFiltro.length === 0) return true;
      return filtrosBNCC.anosSelecionadosFiltro.some(opcao => {
        const anoQuestao = p.serieAno?.toLowerCase().trim();
        const anoFiltro = opcao.value?.toLowerCase().trim();
        return anoQuestao === anoFiltro;
      });
    })
    // Filtro de dificuldade
    .filter(p => filtrosBNCC.dificuldade === '' || String(p.difficultyLevel) === filtrosBNCC.dificuldade)
    // Filtro de phaseLevel
    .filter(p => filtrosBNCC.phaseLevel === '' || String(p.phaseLevel) === String(filtrosBNCC.phaseLevel))
    // Filtro de tema BNCC (texto contido)
    .filter(p => !filtrosBNCC.temaSelecionado || p.bnccTheme?.toLowerCase().includes(filtrosBNCC.temaSelecionado.toLowerCase()))
    // Filtro de objeto de conhecimento (texto contido)
    .filter(p => !filtrosBNCC.objetoConhecimento || p.knowledgeObjects?.toLowerCase().includes(filtrosBNCC.objetoConhecimento.toLowerCase()))
    // Filtro de habilidade (código)
    .filter(p => {
      if (!filtrosBNCC.habilidade) return true;
      const codigoHabilidade = typeof filtrosBNCC.habilidade === 'object' 
        ? (filtrosBNCC.habilidade.codigo || filtrosBNCC.habilidade.habilidade) 
        : filtrosBNCC.habilidade;
      return p.abilityCode?.toLowerCase().includes(String(codigoHabilidade).toLowerCase());
    })
    // Filtros de data (mantidos originais)
    .filter(p => {
      if (dateFilter === 'all') return true;
      const ts = Math.max(
        p.createdAt ? new Date(p.createdAt).getTime() : 0,
        p.updatedAt ? new Date(p.updatedAt).getTime() : 0,
      );
      if (ts === 0) return true;
      const data = new Date(ts);
      const hoje = new Date();
      const inicioHoje = new Date(new Date().setHours(0, 0, 0, 0));
      const diaDoc = new Date(new Date(ts).setHours(0, 0, 0, 0));
      if (dateFilter === 'today') return diaDoc.getTime() === inicioHoje.getTime();
      if (dateFilter === '7days') { const d = new Date(hoje); d.setDate(d.getDate() - 7); return data >= d; }
      if (dateFilter === '30days') { const d = new Date(hoje); d.setDate(d.getDate() - 30); return data >= d; }
      if (dateFilter === 'year') return data.getFullYear() === new Date().getFullYear();
      return true;
    })
    .filter(p => {
      if (!searchDate) return true;
      const iso = p.createdAt || '';
      return iso.slice(0, 10) === searchDate;
    })
    .sort((a, b) => {
      const getTs = p => new Date(sortOrder === 'recentes' ? (p.createdAt || 0) : (p.updatedAt || p.createdAt || 0));
      return getTs(b) - getTs(a);
    });

  function limparFiltros() {
    setSearchTerm('');
    setDateFilter('all');
    setSearchDate('');
    setFiltrosBNCC({
      anosSelecionadosFiltro: [],
      temaSelecionado: '',
      objetoConhecimento: '',
      habilidade: '',
      dificuldade: '',
      phaseLevel: '',
    });
    setFiltrarMeuCampus(false);
  }

  // ============== RENDER ==============
  return (
    <div className={styles.page_container}>
      {/* Cabeçalho */}
      <header className={styles.header}>
        <div className={styles.header_left_side}>
          <div>
            <h1 className={styles.page_title}>Banco de Questões</h1>
            <p className={styles.subtitle}>Gerencie e organize o conteúdo didático</p>
          </div>
          <div className={styles.icon_wrapper_questions}>
            <div className={styles.bg_circle_questions}></div>
            <img src={CalculatorIcon} alt="Ícone Calculadora" className={styles.questions_icon_img} />
          </div>
        </div>
        {(isProfessor || isEstagiario || isAdmin) && (
          <Link to="/newproject" className={styles.create_btn}>
            <LuPlus /> Nova Questão
          </Link>
        )}
      </header>

      {/* Abas de categoria */}
      <div className={styles.tabs_container}>
        <button
          className={`${styles.tab} ${tipoQuestao === 'aprovadas' ? `${styles.active_tab} ${styles.active_aprovadas}` : ''}`}
          onClick={() => setTipoQuestao('aprovadas')}
        >
          <FaCheckDouble /> Aprovadas
        </button>
        {isProfessor && (
          <button 
            className={`${styles.tab} ${tipoQuestao === 'aplicadas' ? `${styles.active_tab} ${styles.active_aplicadas}` : ''}`}
            onClick={() => setTipoQuestao('aplicadas')}
          >
            <LuCalendarDays /> Aplicadas em Prova
          </button>
        )}
        <button
          className={`${styles.tab} ${tipoQuestao === 'pendentes' ? `${styles.active_tab} ${styles.active_pendentes}` : ''}`}
          onClick={() => setTipoQuestao('pendentes')}
        >
          <FaInbox /> Pendentes
        </button>
      </div>

      {/* Barra de ferramentas / filtros */}
      <div className={styles.toolbar}>
        <div className={styles.search_wrapper}>
          <SearchBar
            value={searchTerm}
            onDebouncedChange={setSearchTerm}
            placeholder="Buscar por nome..."
          />
        </div>

        <div className={styles.filters_wrapper}>
          {/* Data */}
          <div className={styles.date_filter_container}>
            <LuCalendarDays className={styles.calendar_icon} />
            <span className={styles.filter_label}>Modificado:</span>
            <select
              className={styles.transparent_select}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              <option value="all">Qualquer data</option>
              <option value="today">Hoje</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="year">Este ano ({new Date().getFullYear()})</option>
            </select>
          </div>

          {/* Anos (react-select) */}
          <div className="notranslate" translate="no">
            <Select
              instanceId="filtro-anos"
              className={styles.react_select}
              isSearchable
              options={opcoesAno}
              isMulti
              placeholder="Ano escolar"
              value={filtrosBNCC.anosSelecionadosFiltro}
              onChange={selected => updateFiltroBNCC('anosSelecionadosFiltro', selected || [])}
              closeMenuOnSelect={false}
              isClearable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '42px',
                  borderColor: state.isFocused ? '#1967d2' : '#ccc',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#1967d2' },
                }),
                valueContainer: (base) => ({ ...base, padding: '0 0.5em', flexWrap: 'wrap' }),
                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                multiValue: (base) => ({ ...base, backgroundColor: '#e0e0e0' }),
                multiValueLabel: (base) => ({ ...base, color: '#555' }),
                placeholder: (base) => ({ ...base, color: '#797979' }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>

          {/* Unidade Temática (cascata) */}
          <select
            className={styles.native_select}
            value={filtrosBNCC.temaSelecionado}
            onChange={e => updateFiltroBNCC('temaSelecionado', e.target.value)}
            disabled={temasDisponiveis.length === 0}
          >
            <option value="">Unidade Temática</option>
            {temasDisponiveis.map((tema, idx) => (
              <option key={idx} value={tema}>{tema}</option>
            ))}
          </select>

          {/* Objetos de Conhecimento */}
          <select 
            className={styles.native_select}
            value={filtrosBNCC.objetoConhecimento}
            onChange={e => updateFiltroBNCC('objetoConhecimento', e.target.value)}
            disabled={!filtrosBNCC.temaSelecionado || objetosDisponiveis.length === 0}
          >
            <option value="">Objetos de Conhecimento</option>
            {objetosDisponiveis.map((obj, idx) => (
              <option key={idx} value={obj}>{obj}</option>
            ))}
          </select>

          {/* Habilidade (código) */}
          <select
            className={styles.native_select}
            value={typeof filtrosBNCC.habilidade === 'object' ? filtrosBNCC.habilidade.codigo || filtrosBNCC.habilidade.habilidade : filtrosBNCC.habilidade}
            onChange={e => updateFiltroBNCC('habilidade', e.target.value)}
            disabled={!filtrosBNCC.objetoConhecimento || habilidadesDisponiveis.length === 0}
          >
            <option value="">Habilidade (Cód.)</option>
            {habilidadesDisponiveis.map((hab, idx) => {
              const codigo = typeof hab === 'object' ? (hab.codigo || hab.habilidade) : hab;
              return <option key={idx} value={codigo}>{codigo}</option>;
            })}
          </select>

          {/* Dificuldade */}
          <select
            className={styles.native_select}
            value={filtrosBNCC.dificuldade}
            onChange={e => updateFiltroBNCC('dificuldade', e.target.value)}
          >
            <option value="">Grau de Dificuldade</option>
            <option value="1">Nível 1</option>
            <option value="2">Nível 2</option>
            <option value="3">Nível 3</option>
            <option value="4">Nível 4</option>
            <option value="5">Nível 5</option>
          </select>

          {/* Fase / Nível */}
          <select
            className={styles.native_select}
            value={filtrosBNCC.phaseLevel}
            onChange={e => updateFiltroBNCC('phaseLevel', e.target.value)}
          >
            <option value="">Nível / Categoria</option>
            <option value="1">Fase 1</option>
            <option value="2">Fase 2</option>
            <option value="3">Fase 3</option>
            <option value="4">Fase 4</option>
          </select>

          {/* Data exata de criação */}
          <input
            type="date"
            className={styles.native_select}
            title="Filtrar por data exata de criação"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
          />

          {/* Botão Meu Campus */}
          {meuCampusAtual && !isEstagiario && (
            <button
              type="button"
              className={styles.native_select} 
              onClick={() => setFiltrarMeuCampus(!filtrarMeuCampus)}
              style={{
                backgroundColor: filtrarMeuCampus ? '#1967d2' : 'transparent',
                color: filtrarMeuCampus ? '#fff' : 'inherit',
                border: '1px solid #ccc',
                cursor: 'pointer',
                fontWeight: filtrarMeuCampus ? 'bold' : 'normal'
              }}
              title={`Mostrar apenas questões de ${meuCampusAtual}`}
            >
              {filtrarMeuCampus ? '✓ Meu Campus' : 'Meu Campus'}
            </button>
          )}

          {/* Alternar visualização */}
          <div className={styles.view_toggles}>
            <button
              className={`${styles.toggle_btn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              title="Lista"
            >
              <LuLayoutList />
            </button>
            <button
              className={`${styles.toggle_btn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grade"
            >
              <LuLayoutGrid />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className={styles.content_area}>
        {loading ? (
          <div className={styles.loading_wrapper}><Loading /></div>
        ) : error ? (
          <div className={styles.error_msg}>{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className={styles.empty_state}>
            <FaSadTear size={40} color="#ccc" />
            <p>Nenhuma questão encontrada.</p>
            <button className={styles.clear_filters} onClick={limparFiltros}>
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? styles.grid_layout : styles.list_layout}>
            {filteredProjects.map(project =>
              viewMode === 'grid' ? (
                <ProjectsCard
                  key={project.id}
                  {...project}
                  grauName={project.serieAno}
                  handleRemove={removeProject}
                />
              ) : (
                <ProjectList
                  key={project.id}
                  {...project}
                  handleRemove={removeProject}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Project;