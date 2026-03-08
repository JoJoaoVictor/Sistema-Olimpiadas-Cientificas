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

function Project() {
    // === ESTADOS ===
    const [projects, setProjects] = useState([]);
    const [graus, setGraus] = useState([]);          // Lista de graus (para filtros)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros e Controle
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('recentes'); 
    const [dificuldade, setDificuldade] = useState(''); 
    const [anosSelecionados, setAnosSelecionados] = useState([]);
    const [tipoQuestao, setTipoQuestao] = useState('aprovadas'); 
    const [viewMode, setViewMode] = useState('list');
    
    // Filtros Específicos
    const [habilidade, setHabilidade] = useState('');
    const [phaseLevel, setPhaseLevel] = useState('');
    
    // Estado para Unidade Temática
    const [bnccTheme, setBnccTheme] = useState('');
    
    // Estado para o filtro de Data
    const [dateFilter, setDateFilter] = useState('all'); 

    // === CARREGAR GRAUS (para filtros) ===
    useEffect(() => {
        async function fetchGraus() {
            try {
                const grausRes = await api.get('/api/v1/graus/');
                const grausArray = grausRes.data?.data?.graus || [];
                setGraus(grausArray);
            } catch (err) {
                console.error('Erro ao carregar graus:', err);
            }
        }
        fetchGraus();
    }, []);

    // === BUSCA DE QUESTÕES via API ===
    useEffect(() => {
        async function fetchProjects() {
            setLoading(true);
            try {
                const categoryId = tipoQuestao === 'aprovadas' ? 2 : 1;
                const response = await api.get('/api/v1/questions/', {
                    params: {
                        category_id: categoryId,
                        per_page: 100, // máximo permitido
                    }
                });

                const backendQuestions = response.data?.data?.questions || [];

                // Converte os campos de snake_case para camelCase
                const convertedQuestions = backendQuestions.map(q => ({
                    id: q.id,
                    name: q.name,
                    professorName: q.professor_name,
                    phaseLevel: q.phase_level,
                    serieAno: q.grau?.name || q.serie_ano, // nome do grau vindo do relacionamento
                    grauId: q.grau_id,
                    difficultyLevel: q.difficulty_level,
                    knowledgeObjects: q.knowledge_objects,
                    bnccTheme: q.bncc_theme,
                    abilityCode: q.ability_code,
                    abilityDescription: q.ability_description,
                    questionStatement: q.question_statement,
                    alternatives: q.alternatives,
                    correctAlternative: q.correct_alternative,
                    detailedResolution: q.detailed_resolution,
                    categoryId: q.category_id,
                    categoryName: q.category?.name || 'Sem categoria', // nome da categoria vindo do relacionamento
                    reviewerComments: q.reviewer_comments,
                    images: q.images || [],
                    createdAt: q.created_at,
                    updatedAt: q.updated_at,
                }));

                setProjects(convertedQuestions);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar questões:', err);
                const errorMsg = authService._handleError(err);
                setError(errorMsg || 'Erro ao carregar questões.');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [tipoQuestao]); // dependência apenas do tipo, pois não precisa mais de graus/categories

    // === AÇÃO DE REMOVER (DELETE) ===
    async function removeProject(id) {
        if (!window.confirm('Tem certeza que deseja excluir esta questão?')) return;
        try {
            setLoading(true);
            await api.delete(`/api/v1/questions/${id}`);
            setProjects(prev => prev.filter(p => p.id !== id));
            alert('Questão removida com sucesso!');
        } catch (err) {
            console.error('Erro ao remover:', err);
            const errorMsg = authService._handleError(err);
            alert('Erro ao remover: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    }

    // === LÓGICA DE FILTRAGEM AVANÇADA ===
    const filteredProjects = projects
        .filter((p) => dificuldade === '' || String(p.difficultyLevel) === dificuldade)
        .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((p) => {
            if (anosSelecionados.length === 0) return true;
            // Extrai o número do nome do grau (ex: "4º Fundamental" -> "4")
            const numeroAno = p.serieAno.match(/\d+/)?.[0] || '';
            return anosSelecionados.some(opcao => opcao.value === numeroAno);
        })
        .filter((p) => phaseLevel === '' || String(p.phaseLevel) === String(phaseLevel))
        .filter((p) => habilidade === '' || p.abilityCode?.toLowerCase().includes(habilidade.toLowerCase()))
        .filter((p) => bnccTheme === '' || p.bnccTheme?.toLowerCase().includes(bnccTheme.toLowerCase()))
        .filter((p) => {
            if (dateFilter === 'all') return true;
            const dataCriacao = p.createdAt ? new Date(p.createdAt).getTime() : 0;
            const dataEdicao = p.updatedAt ? new Date(p.updatedAt).getTime() : 0;
            const ultimaAtividadeTimestamp = Math.max(dataCriacao, dataEdicao);
            if (ultimaAtividadeTimestamp === 0) return true;
            const dataProjeto = new Date(ultimaAtividadeTimestamp);
            const hoje = new Date();
            const inicioHoje = new Date(hoje.setHours(0,0,0,0));
            const diaProjeto = new Date(new Date(ultimaAtividadeTimestamp).setHours(0,0,0,0));

            if (dateFilter === 'today') return diaProjeto.getTime() === inicioHoje.getTime();
            if (dateFilter === '7days') {
                const seteDiasAtras = new Date(hoje);
                seteDiasAtras.setDate(hoje.getDate() - 7);
                return dataProjeto >= seteDiasAtras;
            }
            if (dateFilter === '30days') {
                const trintaDiasAtras = new Date(hoje);
                trintaDiasAtras.setDate(hoje.getDate() - 30);
                return dataProjeto >= trintaDiasAtras;
            }
            if (dateFilter === 'year') return dataProjeto.getFullYear() === new Date().getFullYear();
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(sortOrder === 'recentes' ? (a.createdAt || 0) : (a.updatedAt || a.createdAt || 0));
            const dateB = new Date(sortOrder === 'recentes' ? (b.createdAt || 0) : (b.updatedAt || b.createdAt || 0));
            return dateB - dateA;
        });

    const opcoesAno = [
        { value: '2', label: '2º Ano' }, { value: '3', label: '3º Ano' },
        { value: '4', label: '4º Ano' }, { value: '5', label: '5º Ano' },
        { value: '6', label: '6º Ano' }, { value: '7', label: '7º Ano' },
        { value: '8', label: '8º Ano' }, { value: '9', label: '9º Ano' },
        { value: '1', label: '1º Médio' }, { value: '2', label: '2º Médio' }, { value: '3', label: '3º Médio' },
    ];

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

            <div className={styles.toolbar}>
                
                <div className={styles.search_wrapper}>
                    <SearchBar 
                        value={searchTerm} 
                        onDebouncedChange={setSearchTerm} 
                        placeholder="Buscar por nome..." 
                    />
                </div>

                <div className={styles.filters_wrapper}>
                    
                    <div className={styles.date_filter_container}>
                        <LuCalendarDays className={styles.calendar_icon} />
                        <span className={styles.filter_label}>Modificado:</span>
                        <select 
                            className={styles.transparent_select}
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <option value="all">Qualquer data</option>
                            <option value="today">Hoje</option>
                            <option value="7days">Últimos 7 dias</option>
                            <option value="30days">Últimos 30 dias</option>
                            <option value="year">Este ano ({new Date().getFullYear()})</option>
                        </select>
                    </div>

                    <Select 
                        className={styles.react_select}
                        isSearchable
                        options={opcoesAno}
                        isMulti
                        placeholder="Ano"
                        value={anosSelecionados}
                        onChange={(selected) => setAnosSelecionados(selected || [])}
                        closeMenuOnSelect={false}
                        isClearable
                        styles={{
                            control: (base, state) => ({ 
                                ...base,
                                height: '42px',
                                borderColor: state.isFocused ? '#1967d2' : '#ccc',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#1967d2' },
                            }),
                            valueContainer: (base) => ({ ...base, height: '40px', padding: '0 0.5em', overflow: 'auto' }),
                            input: (base) => ({ ...base, margin: 0, padding:0 }),
                            indicatorsContainer: (base) => ({ ...base }),
                            multiValue: (base) => ({ ...base, backgroundColor: '#e0e0e0' }),
                            multiValueLabel: (base) => ({ ...base, color: '#797979' }),
                            placeholder: (base) => ({ ...base, color: '#797979' }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                    />

                    <select 
                        className={styles.native_select}
                        value={dificuldade}
                        onChange={(e) => setDificuldade(e.target.value)}
                    >
                        <option value="">Grau de Dificuldade</option>
                        <option value="1">Nível 1</option>
                        <option value="2">Nível 2</option>
                        <option value="3">Nível 3</option>
                        <option value="4">Nível 4</option>
                        <option value="5">Nível 5</option>
                    </select>
                     
                    <select 
                        className={styles.native_select}
                        value={phaseLevel}
                        onChange={(e) => setPhaseLevel(e.target.value)}
                    >
                        <option value="">Nível / Categoria</option>
                        <option value="1">Fase 1</option>
                        <option value="2">Fase 2</option>
                        <option value="3">Fase 3</option>
                        <option value="4">Fase 4</option>
                    </select>

                    <input 
                        type="text" 
                        className={styles.native_select} 
                        placeholder="Cód. Habilidade" 
                        value={habilidade}
                        onChange={(e) => setHabilidade(e.target.value)}
                    />
                    
                    <select 
                        className={styles.native_select}
                        value={bnccTheme}
                        onChange={(e) => setBnccTheme(e.target.value)}
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

            <div className={styles.content_area}>
                {loading ? (
                    <div className={styles.loading_wrapper}><Loading /></div>
                ) : error ? (
                    <div className={styles.error_msg}>{error}</div>
                ) : filteredProjects.length === 0 ? (
                    <div className={styles.empty_state}>
                        <FaSadTear size={40} color="#ccc" />
                        <p>Nenhuma questão encontrada.</p>
                        <button 
                            className={styles.clear_filters} 
                            onClick={() => {
                                setSearchTerm('');
                                setDateFilter('all');
                                setDificuldade('');
                                setAnosSelecionados([]);
                                setPhaseLevel('');
                                setHabilidade('');
                                setBnccTheme('');
                            }}
                        >
                            Limpar Filtros
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? styles.grid_layout : styles.list_layout}>
                        {filteredProjects.map((project) => (
                            viewMode === 'grid' ? (
                                <ProjectsCard
                                    key={project.id}
                                    {...project}
                                    grauName={project.serieAno} // passa o nome do grau
                                    handleRemove={removeProject}
                                />
                            ) : (
                                <ProjectList
                                    key={project.id}
                                    {...project}
                                    handleRemove={removeProject}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Project;