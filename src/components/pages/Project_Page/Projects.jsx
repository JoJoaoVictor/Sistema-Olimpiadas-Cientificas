import styles from './Projects.module.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Componentes do Projeto
import Container from '../../Layout/Container';
import LinkButton from '../../Layout/LinkButton';
import ProjectsCard from './../Project_Page/Components_project/Project_Card/ProjectsCard';
import ProjectList from './../Project_Page/Components_project/Project_List/ProjectList';
import Loading from '../../Layout/Loading';
import SearchBar from '../../form/SearchBar';

// Dependências Externas
import Select from 'react-select';
import { LuLayoutGrid, LuLayoutList, LuPlus, LuCalendarDays } from "react-icons/lu";
import { FaInbox, FaCheckDouble, FaSadTear } from "react-icons/fa";

// Serviço de API
import api from '../../../services/api';
import { authService } from '../../../services/authService';

// ─── Opções de ano SEM valores duplicados ────────────────────────────────────
// O value deve ser único E deve bater com o campo serieAno que vem do backend
// (que é o nome do grau, ex: "4º Fundamental", "1º Médio")
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

function Project() {
    // === ESTADOS ===
    const [projects,         setProjects]         = useState([]);
    const [graus,            setGraus]            = useState([]);
    const [loading,          setLoading]          = useState(true);
    const [error,            setError]            = useState(null);

    // Filtros e Controle
    const [searchTerm,       setSearchTerm]       = useState('');
    const [sortOrder,        setSortOrder]        = useState('recentes');
    const [dificuldade,      setDificuldade]      = useState('');
    const [anosSelecionados, setAnosSelecionados] = useState([]);
    const [tipoQuestao,      setTipoQuestao]      = useState('aprovadas');
    const [viewMode,         setViewMode]         = useState('list');

    // Filtros Específicos BNCC
    const [habilidade,  setHabilidade]  = useState('');
    const [phaseLevel,  setPhaseLevel]  = useState('');
    const [bnccTheme,   setBnccTheme]   = useState('');

    // Filtro de Data
    const [dateFilter, setDateFilter] = useState('all');

    // === CARREGAR GRAUS ===
    useEffect(() => {
        async function fetchGraus() {
            try {
                const grausRes = await api.get('/api/v1/graus/');
                setGraus(grausRes.data?.data?.graus || []);
            } catch (err) {
                console.error('Erro ao carregar graus:', err);
            }
        }
        fetchGraus();
    }, []);

    // === BUSCA DE QUESTÕES ===
    useEffect(() => {
        async function fetchProjects() {
            setLoading(true);
            try {
                const categoryId = tipoQuestao === 'aprovadas' ? 2 : 1;
                const response = await api.get('/api/v1/questions/', {
                    params: { category_id: categoryId, per_page: 100 },
                });

                const backendQuestions = response.data?.data?.questions || [];

                const convertedQuestions = backendQuestions.map(q => ({
                    id:                 q.id,
                    name:               q.name,
                    professorName:      q.professor_name,
                    phaseLevel:         q.phase_level,
                    // serieAno = nome legível do grau (ex: "4º Fundamental")
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

    // === REMOVER QUESTÃO ===
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

    // === FILTRAGEM ===
    const filteredProjects = projects
        // Busca por nome
        .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))

        // Dificuldade
        .filter(p => dificuldade === '' || String(p.difficultyLevel) === dificuldade)

        // Anos escolares — compara o nome completo do grau (ex: "4º Fundamental")
        // O value de opcoesAno agora é o próprio nome, então a comparação é direta.
        .filter(p => {
            if (anosSelecionados.length === 0) return true;
            return anosSelecionados.some(opcao =>
                p.serieAno?.toLowerCase().trim() === opcao.value?.toLowerCase().trim()
            );
        })

        // Fase / Nível
        .filter(p => phaseLevel === '' || String(p.phaseLevel) === String(phaseLevel))

        // Habilidade BNCC (código)
        .filter(p => habilidade === '' || p.abilityCode?.toLowerCase().includes(habilidade.toLowerCase()))

        // Unidade Temática BNCC
        .filter(p => bnccTheme === '' || p.bnccTheme?.toLowerCase().includes(bnccTheme.toLowerCase()))

        // Filtro de data
        .filter(p => {
            if (dateFilter === 'all') return true;
            const ts = Math.max(
                p.createdAt ? new Date(p.createdAt).getTime() : 0,
                p.updatedAt ? new Date(p.updatedAt).getTime() : 0,
            );
            if (ts === 0) return true;
            const data    = new Date(ts);
            const hoje    = new Date();
            const inicioHoje = new Date(new Date().setHours(0, 0, 0, 0));
            const diaDoc     = new Date(new Date(ts).setHours(0, 0, 0, 0));

            if (dateFilter === 'today')   return diaDoc.getTime() === inicioHoje.getTime();
            if (dateFilter === '7days')   { const d = new Date(hoje); d.setDate(d.getDate() - 7);  return data >= d; }
            if (dateFilter === '30days')  { const d = new Date(hoje); d.setDate(d.getDate() - 30); return data >= d; }
            if (dateFilter === 'year')    return data.getFullYear() === new Date().getFullYear();
            return true;
        })

        // Ordenação
        .sort((a, b) => {
            const getTs = p => new Date(sortOrder === 'recentes' ? (p.createdAt || 0) : (p.updatedAt || p.createdAt || 0));
            return getTs(b) - getTs(a);
        });

    // === LIMPAR FILTROS ===
    function limparFiltros() {
        setSearchTerm('');
        setDateFilter('all');
        setDificuldade('');
        setAnosSelecionados([]);
        setPhaseLevel('');
        setHabilidade('');
        setBnccTheme('');
    }

    return (
        <div className={styles.page_container}>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.page_title}>Banco de Questões</h1>
                    <p className={styles.subtitle}>Gerencie e organize o conteúdo didático</p>
                </div>
                <Link to="/newproject" className={styles.create_btn}>
                    <LuPlus /> Nova Questão
                </Link>
            </header>

            {/* Abas Aprovadas / Pendentes */}
            <div className={styles.tabs_container}>
                <button
                    className={`${styles.tab} ${tipoQuestao === 'aprovadas' ? styles.active_tab : ''}`}
                    onClick={() => setTipoQuestao('aprovadas')}
                >
                    <FaCheckDouble /> Aprovadas
                </button>
                <button
                    className={`${styles.tab} ${tipoQuestao === 'pendentes' ? styles.active_tab : ''}`}
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

                    {/* Filtro de data */}
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

                    {/* Filtro de anos — envolvido em translate="no" para evitar crash
                        causado por extensões de browser (Google Translate, Grammarly etc.)
                        que modificam o DOM interno do react-select */}
                    <div className="notranslate" translate="no">
                        <Select
                            instanceId="filtro-anos"
                            className={styles.react_select}
                            isSearchable
                            options={opcoesAno}
                            isMulti
                            placeholder="Ano escolar"
                            value={anosSelecionados}
                            onChange={selected => setAnosSelecionados(selected || [])}
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
                                valueContainer: (base) => ({
                                    ...base,
                                    padding: '0 0.5em',
                                    flexWrap: 'wrap',
                                }),
                                input:           (base) => ({ ...base, margin: 0, padding: 0 }),
                                multiValue:      (base) => ({ ...base, backgroundColor: '#e0e0e0' }),
                                multiValueLabel: (base) => ({ ...base, color: '#555' }),
                                placeholder:     (base) => ({ ...base, color: '#797979' }),
                                menu:            (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>

                    {/* Grau de dificuldade */}
                    <select
                        className={styles.native_select}
                        value={dificuldade}
                        onChange={e => setDificuldade(e.target.value)}
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
                        value={phaseLevel}
                        onChange={e => setPhaseLevel(e.target.value)}
                    >
                        <option value="">Nível / Categoria</option>
                        <option value="1">Fase 1</option>
                        <option value="2">Fase 2</option>
                        <option value="3">Fase 3</option>
                        <option value="4">Fase 4</option>
                    </select>

                    {/* Código de habilidade BNCC */}
                    <input
                        type="text"
                        className={styles.native_select}
                        placeholder="Cód. Habilidade"
                        value={habilidade}
                        onChange={e => setHabilidade(e.target.value)}
                    />

                    {/* Unidade Temática BNCC */}
                    <select
                        className={styles.native_select}
                        value={bnccTheme}
                        onChange={e => setBnccTheme(e.target.value)}
                    >
                        <option value="">Unidade Temática</option>
                        <option value="Álgebra">Álgebra</option>
                        <option value="Geometria">Geometria</option>
                        <option value="Estatística">Estatística</option>
                        <option value="Álgebra/Geometria">Álgebra / Geometria</option>
                        <option value="Grandezas/Geometria">Grandezas / Geometria</option>
                        <option value="Grandezas/Medidas">Grandezas / Medidas</option>
                        <option value="Números">Números</option>
                        <option value="Números/Álgebra">Números e Álgebra</option>
                        <option value="Probabilidade">Probabilidade</option>
                        <option value="Probabilidade e Estatística">Probabilidade e Estatística</option>
                    </select>

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