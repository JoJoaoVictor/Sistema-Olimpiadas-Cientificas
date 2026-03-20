import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Prova.module.css';
import { FiSearch, FiCalendar, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { BsPencil, BsBook } from 'react-icons/bs';
import Select from 'react-select';

// Serviços de API
import api from '../../../services/api';
import { authService } from '../../../services/authService';

function Prova() {
  const navigate = useNavigate();

  const [provas, setProvas] = useState([]);
  const [provasFiltradas, setProvasFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // Estados dos filtros
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [faseSelecionada, setFaseSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');

  // Carrega todas as provas do backend
  useEffect(() => {
    const fetchProvas = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/v1/exams', {
          params: { per_page: 100 } // ou usar paginação se necessário
        });
        const data = response.data?.data?.exams || [];
        setProvas(data);
      } catch (err) {
        console.error('Erro ao carregar provas:', err);
        alert('Erro ao carregar provas. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchProvas();
  }, []);

  // Aplica todos os filtros localmente
  useEffect(() => {
    let filtradas = [...provas];

    // ── Nome ─────────────────────────────────────────────────────────────────
    if (searchName.trim()) {
      filtradas = filtradas.filter(p =>
        p.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // ── Data ─────────────────────────────────────────────────────────────────
    // Compara apenas YYYY-MM-DD para evitar problemas de timezone.
    // searchDate já vem como "YYYY-MM-DD" do input type="date".
    // created_at vem como ISO string "2024-03-18T..." — pega só os 10 primeiros chars.
    if (searchDate) {
      filtradas = filtradas.filter(p => {
        if (!p.created_at) return false;
        const dataProva = p.created_at.slice(0, 10); // "YYYY-MM-DD"
        return dataProva === searchDate;
      });
    }

    // ── Anos ──────────────────────────────────────────────────────────────────
    if (anosSelecionados.length > 0) {
      filtradas = filtradas.filter(p => {
        const anosDaProva = p.anos || [];
        return anosSelecionados.some(opt =>
          anosDaProva.some(a => a.includes(opt.label) || opt.label.includes(a))
        );
      });
    }

    // ── Fase ──────────────────────────────────────────────────────────────────
    // O banco pode guardar "1", "2", "3", "Final" ou "1ª FASE" etc.
    // O select usa value "1","2","Final" — comparamos de forma flexível.
    if (faseSelecionada) {
      filtradas = filtradas.filter(p => {
        const fase = String(p.fase || '').trim();
        // Comparação exata primeiro
        if (fase === faseSelecionada) return true;
        // Comparação pelo número inicial: "1ª FASE" contém "1"
        if (fase.startsWith(faseSelecionada)) return true;
        // "Final" case-insensitive
        if (faseSelecionada.toLowerCase() === 'final' && fase.toLowerCase().includes('final')) return true;
        return false;
      });
    }

    // ── Status ────────────────────────────────────────────────────────────────
    if (statusSelecionado) {
      filtradas = filtradas.filter(p =>
        p.status?.toUpperCase() === statusSelecionado.toUpperCase()
      );
    }

    setProvasFiltradas(filtradas);
  }, [searchName, searchDate, anosSelecionados, faseSelecionada, statusSelecionado, provas]);

  // Geração de PDF via backend
    async function visualizarPDF(prova) {
    if (gerandoPDF) return;
    setGerandoPDF(true);
    try {
      const response = await api.get(`/api/v1/exams/${prova.id}/pdf`, {
        responseType: 'blob',
        params: { include_answers: true } // ou false
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      const errorMsg = authService._handleError(error);
      alert(`Erro ao gerar PDF: ${errorMsg}`);
    } finally {
      setGerandoPDF(false);
    }
  }

  // Listas fixas para filtros
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
    { value: 'Final', label: 'Final' }
  ];

  const listaStatus = ['APROVADA', 'PENDENTE', 'APLICADA']; // ajuste conforme o backend

  // Estilos personalizados para o React Select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '45px',
      height: '45px',
      border: state.isFocused ? '1px solid #1967d2' : '1px solid #ced4da',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px #1967d2' : 'none',
      '&:hover': { border: '1px solid #1967d2' },
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    valueContainer: (base) => ({ ...base, height: '45px', padding: '0 8px', overflow: 'auto' }),
    indicatorsContainer: (base) => ({ ...base, height: '45px' }),
    multiValue: (base) => ({ ...base, backgroundColor: '#e9ecef', borderRadius: '4px' }),
    multiValueLabel: (base) => ({ ...base, color: '#495057' }),
  };

  return (
    <div className={styles.container}>
      <h2>Provas Salvas</h2>

      {/* Overlay de loading da geração de PDF */}
      {gerandoPDF && (
        <div className={styles.loadingOverlay}>
          <h3>Gerando PDF...</h3>
          <p>Aguarde, isso pode levar alguns segundos na primeira vez.</p>
        </div>
      )}

      {/* Área de Filtros */}
      <div className={styles.filters_wrapper}>
        <div className={styles.search_container}>
          <FiSearch className={styles.icon} />
          <input
            type="text"
            placeholder="Buscar prova pelo nome..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </div>

        <div className={`${styles.filters_grid} notranslate`} translate="no">
          <Select
            menuPortalTarget={document.body}
            isSearchable
            options={opcoesAno}
            isMulti
            placeholder="Selecionar Anos"
            value={anosSelecionados}
            onChange={selected => setAnosSelecionados(selected || [])}
            closeMenuOnSelect={false}
            isClearable
            styles={customSelectStyles}
          />

          <Select
            options={listaFases}
            placeholder="Selecionar Fase"
            value={listaFases.find(f => f.value === faseSelecionada) || null}
            onChange={selected => setFaseSelecionada(selected?.value || '')}
            isClearable
            styles={customSelectStyles}
          />

          <select
            className={styles.native_select}
            value={statusSelecionado}
            onChange={e => setStatusSelecionado(e.target.value)}
          >
            <option value="">Todos os status</option>
            {listaStatus.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <input
            className={styles.native_input}
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Provas */}
      <div className={styles.provas_container}>
        <div className={styles.section_title}>
          {loading ? 'Carregando...' : `${provasFiltradas.length} ${provasFiltradas.length === 1 ? 'prova encontrada' : 'provas encontradas'}`}
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando...</div>
        ) : provasFiltradas.length === 0 ? (
          <div className={styles.empty_state}>
            Nenhuma prova encontrada com os filtros atuais.
          </div>
        ) : (
          provasFiltradas.map(prova => (
            <div key={prova.id} className={styles.prova_card}>
              <div className={styles.card_content}>
                <div className={styles.card_header}>
                  <h3>{prova.name}</h3>
                  <span className={styles.card_date}>
                    Criado em: {prova.created_at ? new Date(prova.created_at).toLocaleDateString('pt-BR') : 'Data desconhecida'}
                  </span>
                </div>

                <div className={styles.card_tags}>
                  <div className={styles.tag} title="Anos Escolares">
                    <BsBook style={{ marginRight: '6px' }} />
                    {(prova.anos || []).join(', ') || 'Sem ano'}
                  </div>
                  <div className={styles.tag} title="Fase da Prova">
                    <FiLayers style={{ marginRight: '6px' }} />
                    {prova.fase ? `Fase ${prova.fase}` : 'Sem fase'}
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
          ))
        )}
      </div>
    </div>
  );
}

export default Prova;