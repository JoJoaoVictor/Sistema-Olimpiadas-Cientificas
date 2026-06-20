import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Prova.module.css';
import { FiSearch, FiUser } from 'react-icons/fi';
import { BsPencil, BsBook } from 'react-icons/bs';
import { FaInbox, FaCheckDouble, FaPlay } from 'react-icons/fa';
import { LuCalendarDays, LuLayers } from 'react-icons/lu';
import Select from 'react-select';
import BooksIcon from '../../../img/books_library_study_icon.png' 

// Serviços de API
import api from '../../../services/api';
import { authService } from '../../../services/authService';
import useAuth from '../../../hooks/useAuth';

// Opções de filtro
const opcoesAno = [
  { value: '4', label: '4º' },
  { value: '5', label: '5º' },
  { value: '6', label: '6º' },
  { value: '7', label: '7º' },
  { value: '8', label: '8º' },
  { value: '9', label: '9º' },
  { value: '1', label: '1º Médio' },
  { value: '2', label: '2º Médio' },
  { value: '3', label: '3º Médio' },
];

const listaFases = [
  { value: '1', label: 'Fase 1' },
  { value: '2', label: 'Fase 2' },
  { value: 'Final', label: 'Final' },
];

// Tabs: cada item define label, ícone e qual status filtrar
const TABS = [
  { key: 'aprovadas', label: 'Aprovadas', icon: <FaCheckDouble />, status: 'APROVADA' },
  { key: 'aplicadas', label: 'Aplicadas', icon: <FaPlay />,        status: 'APLICADA' },
  { key: 'pendentes', label: 'Pendentes', icon: <FaInbox />,       status: 'PENDENTE' },
];

function Prova() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const isRevisor = user?.role?.toUpperCase() === 'REVISOR'
  const [provas,          setProvas]          = useState([]);
  const [provasFiltradas, setProvasFiltradas] = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [gerandoPDF,      setGerandoPDF]      = useState(false);

  // Tab ativa (controla o filtro de status)
  const [tabAtiva, setTabAtiva] = useState('aprovadas');

  // Filtros da toolbar
  const [searchTerm,        setSearchTerm]        = useState(''); 
  const [searchDate,        setSearchDate]        = useState('');   // YYYY-MM-DD exato
  const [anosSelecionados,  setAnosSelecionados]  = useState([]);
  const [faseSelecionada,   setFaseSelecionada]   = useState('');
  const [dateFilter,        setDateFilter]        = useState('all'); // período relativo

  // ── Carrega provas ao trocar de tab ────────────────────────────────────────
  useEffect(() => {
    const fetchProvas = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/v1/exams', {
          params: { per_page: 100 },
        });
        setProvas(response.data?.data?.exams || []);
      } catch (err) {
        console.error('Erro ao carregar provas:', err);
        alert('Erro ao carregar provas. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchProvas();
  }, []);

  // ── Filtragem local ────────────────────────────────────────────────────────
  useEffect(() => {
    const statusDaTab = TABS.find(t => t.key === tabAtiva)?.status || '';

    let filtradas = provas.filter(p =>
      p.status?.toUpperCase() === statusDaTab
    );

    // 🌟 BUSCA UNIFICADA ADAPTADA DE PROJECTS.JSX:
    if (searchTerm.trim()) {
      const textToSearch = searchTerm.toLowerCase();
      filtradas = filtradas.filter(p => {
        const matchName = p.name?.toLowerCase().includes(textToSearch);
        
        // Mapeamentos de autoria idênticos ao Projects.jsx
        const authorName = (p.author?.name || p.author_name || p.professor_name || '').toLowerCase();
        const authorEmail = (p.author?.email || '').toLowerCase();
        const professorName = (p.professor_name || '').toLowerCase();

        const matchAuthor = authorName.includes(textToSearch);
        const matchEmail = authorEmail.includes(textToSearch);
        const matchProfessor = professorName.includes(textToSearch);
        
        return matchName || matchAuthor || matchEmail || matchProfessor;
      });
    }

    // Data exata (YYYY-MM-DD)
    if (searchDate) {
      filtradas = filtradas.filter(p =>
        p.created_at ? p.created_at.slice(0, 10) === searchDate : false
      );
    }

    // Anos
    if (anosSelecionados.length > 0) {
      filtradas = filtradas.filter(p => {
        const anosDaProva = p.anos || [];
        return anosSelecionados.some(opt =>
          anosDaProva.some(a => a.includes(opt.label) || opt.label.includes(a))
        );
      });
    }

    // Fase
    if (faseSelecionada) {
      filtradas = filtradas.filter(p => {
        const fase = String(p.fase || '').trim();
        if (fase === faseSelecionada) return true;
        if (fase.startsWith(faseSelecionada)) return true;
        if (faseSelecionada.toLowerCase() === 'final' && fase.toLowerCase().includes('final')) return true;
        return false;
      });
    }

    // Data de criação
    if (dateFilter !== 'all') {
      filtradas = filtradas.filter(p => {
        if (!p.created_at) return true;
        const ts   = new Date(p.created_at).getTime();
        const data = new Date(ts);
        const hoje = new Date();
        const inicioHoje = new Date(new Date().setHours(0, 0, 0, 0));
        const diaDoc     = new Date(new Date(ts).setHours(0, 0, 0, 0));

        if (dateFilter === 'today')  return diaDoc.getTime() === inicioHoje.getTime();
        if (dateFilter === '7days')  { const d = new Date(hoje); d.setDate(d.getDate() - 7);  return data >= d; }
        if (dateFilter === '30days') { const d = new Date(hoje); d.setDate(d.getDate() - 30); return data >= d; }
        if (dateFilter === 'year')   return data.getFullYear() === new Date().getFullYear();
        return true;
      });
    }

    setProvasFiltradas(filtradas);
  }, [searchTerm, searchDate, anosSelecionados, faseSelecionada, dateFilter, tabAtiva, provas]);

  // ── Limpar filtros ─────────────────────────────────────────────────────────
  function limparFiltros() {
    setSearchTerm('');
    setSearchDate('');
    setAnosSelecionados([]);
    setFaseSelecionada('');
    setDateFilter('all');
  }

  // ── Geração de PDF ─────────────────────────────────────────────────────────
  async function visualizarPDF(prova) {
    if (gerandoPDF) return;
    setGerandoPDF(true);
    try {
      const response = await api.get(`/api/v1/exams/${prova.id}/pdf`, {
        responseType: 'blob',
        params: { include_answers: true },
      });
      const url = window.URL.createObjectURL(response.data);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar PDF: ${authService._handleError(error)}`);
    } finally {
      setGerandoPDF(false);
    }
  }

  // ── Estilos do React Select ────────────────────────────────────────────────
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      height: '42px',
      border: state.isFocused ? '1px solid #1967d2' : '1px solid #ccc',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px #1967d2' : 'none',
      '&:hover': { borderColor: '#1967d2' },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    valueContainer: (base) => ({ ...base, height: '42px', padding: '0 8px', overflow: 'auto', flexWrap: 'wrap' }),
    indicatorsContainer: (base) => ({ ...base, height: '42px' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#e0e0e0', borderRadius: '4px' }),
    multiValueLabel: (base) => ({ ...base, color: '#555' }),
    placeholder: (base) => ({ ...base, color: '#797979' }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className={styles.page_container}>

      {/* ── Overlay PDF ──────────────────────────────────────────────────────── */}
      {gerandoPDF && (
        <div className={styles.loadingOverlay}>
          <h3>Gerando PDF...</h3>
          <p>Aguarde, isso pode levar alguns segundos na primeira vez.</p>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
                <div>
                    <h1 className={styles.page_title}>Banco de Provas</h1>
                    <p className={styles.subtitle}>Gerencie e aplique as provas cadastras</p>
                </div>

                <div className={styles.icon_wrapper_exams}>
                    <div className={styles.bg_circle_exams}></div>
                    <img 
                        src={BooksIcon} 
                        alt="Ícone Biblioteca de Livros" 
                        className={styles.exams_icon_img} 
                    />
                </div>
      </header>
      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
        <div className={styles.tabs_container}>
          {TABS
            .filter(tab => !(isRevisor && tab.key === 'aplicadas'))
            .map(tab => (
            <button
              key={tab.key}
              className={`
                ${styles.tab} 
                ${tabAtiva === tab.key ? styles.active_tab : ''} 
                ${tabAtiva === tab.key ? styles[`active_${tab.key}`] : ''}
              `}
              onClick={() => setTabAtiva(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>

        {/* Único buscador global */}
        <div className={styles.search_wrapper}>
          <div className={styles.search_container}>
            <FiSearch className={styles.search_icon} />
            <input
              type="text"
              placeholder="Buscar por prova, autor ou e-mail..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filtros à direita */}
        <div className={styles.filters_wrapper}>

          {/* Filtro de data */}
          <div className={styles.date_filter_container}>
            <LuCalendarDays className={styles.calendar_icon} />
            <span className={styles.filter_label}>Criado:</span>
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

          {/* Filtro de Ano Escolar */}
          <div className="notranslate" translate="no">
            <Select
              instanceId="filtro-anos-prova"
              className={styles.react_select}
              isSearchable
              options={opcoesAno}
              isMulti
              placeholder="Ano escolar"
              value={anosSelecionados}
              onChange={selected => setAnosSelecionados(selected || [])}
              closeMenuOnSelect={false}
              isClearable
              styles={customSelectStyles}
            />
          </div>

          {/* Filtro de Fase */}
          <select
            className={styles.native_select}
            value={faseSelecionada}
            onChange={e => setFaseSelecionada(e.target.value)}
          >
            <option value="">Todas as fases</option>
            {listaFases.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Data exata de criação */}
          <input
            className={styles.native_select}
            type="date"
            title="Filtrar por data exata de criação"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────────── */}
      <div className={styles.content_area}>
        <div className={styles.section_title}>
          {loading
            ? 'Carregando...'
            : `${provasFiltradas.length} ${provasFiltradas.length === 1 ? 'prova encontrada' : 'provas encontradas'}`}
        </div>

        {loading ? (
          <div className={styles.loading_wrapper}>
            <div className={styles.spinner} />
          </div>
        ) : provasFiltradas.length === 0 ? (
          <div className={styles.empty_state}>
            <p>Nenhuma prova encontrada com os filtros atuais.</p>
            <button className={styles.clear_filters} onClick={limparFiltros}>
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className={styles.list_layout}>
            {provasFiltradas.map(prova => (
              <div key={prova.id} className={styles.prova_card}>
                <div className={styles.card_content}>
                  <div className={styles.card_header}>
                    <h3>{prova.name}</h3>
                    <span className={styles.card_date}>
                      Criado em:{' '}
                      {prova.created_at
                        ? new Date(prova.created_at).toLocaleDateString('pt-BR')
                        : 'Data desconhecida'}
                    </span>
                  </div>

                  <div className={styles.card_tags}>
                    <div className={styles.tag} title="Anos Escolares">
                      <BsBook style={{ marginRight: '6px' }} />
                      {(prova.anos || []).join(', ') || 'Sem ano'}
                    </div>
                    
                    <div className={styles.tag} title="Fase da Prova">
                      <LuLayers style={{ marginRight: '6px' }} />
                      {prova.fase ? `Fase ${prova.fase}` : 'Sem fase'}
                    </div>

                    <div className={styles.tag} title={`Autor: ${prova.author?.name || prova.author_name || 'Não informado'}`}>
                      <FiUser style={{ marginRight: '6px' }} />
                      {prova.author?.name || prova.author_name || 'Autor Desconhecido'}
                    </div>

                    <div className={`${styles.status_pill} ${styles[prova.status?.toLowerCase()] || ''}`}>
                      {prova.status || 'Pendente'}
                    </div>
                  </div>
                </div>

                <div className={styles.card_actions}>
                  <button
                    className={`${styles.action_btn} ${styles.edit_btn}`}
                    onClick={() => navigate(`/provas/${prova.id}`)}
                    title="Editar Prova"
                    disabled={gerandoPDF}
                  >
                    <BsPencil />
                  </button>
                  <button
                    className={`${styles.action_btn} ${styles.view_btn}`}
                    onClick={() => visualizarPDF(prova)}
                    title="Visualizar PDF"
                    disabled={gerandoPDF}
                  >
                    <FiSearch />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Prova;