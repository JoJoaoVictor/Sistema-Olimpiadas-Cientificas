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

function Project() {
    // === ESTADOS ===
    const [projects, setProjects] = useState([]);
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
    
    // === NOVO: Estado para Unidade Temática ===
    const [bnccTheme, setBnccTheme] = useState('');
    
    // Estado para o filtro de Data
    const [dateFilter, setDateFilter] = useState('all'); 

    // === BUSCA DE DADOS ===
    useEffect(() => {
        async function fetchProjects() {
            const endpoint = tipoQuestao === 'aprovadas' 
                ? 'http://localhost:5000/questõesAprovadas' 
                : 'http://localhost:5000/projects';

            setLoading(true);
            try {
                const res = await fetch(endpoint);
                if (!res.ok) throw new Error('Erro de conexão com o servidor');
                const data = await res.json();
                setProjects(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [tipoQuestao]);

    // === AÇÃO DE REMOVER ===
    async function removeProject(id) {
        if (!window.confirm('Tem certeza que deseja excluir esta questão?')) return;
        try {
            setLoading(true);
            const endpoint = tipoQuestao === 'aprovadas' 
                ? `http://localhost:5000/questõesAprovadas/${id}`
                : `http://localhost:5000/projects/${id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Falha ao remover');
            setProjects(prev => prev.filter(p => p.id !== id));
            alert('Questão removida com sucesso!');
        } catch (err) {
            alert('Erro ao remover: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    // === LÓGICA DE FILTRAGEM AVANÇADA ===
    const filteredProjects = projects
        // 1. Filtro de Dificuldade
        .filter((p) => dificuldade === '' || String(p.difficultyLevel) === difficultyStringCheck(dificuldade))
        
        // 2. Filtro de Texto (Nome)
        .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        
        // 3. Filtro de Anos
        .filter((p) => {
            if (anosSelecionados.length === 0) return true;
            const serieItem = String(p.serieAno).replace(/[^0-9]/g, ''); 
            return anosSelecionados.some(opcao => opcao.value === serieItem);
        })

        // 4. Filtro por Nível da Fase
        .filter((p) => {
             if (phaseLevel === '') return true;
             return String(p.phaseLevel) === String(phaseLevel);
        })

        // 5. Filtro por Código de Habilidade
        .filter((p) => {
             if (habilidade === '') return true;
             return p.abilityCode?.toLowerCase().includes(habilidade.toLowerCase());
        })

        // === NOVO: Filtro por Unidade Temática ===
        // Verifica se o tema selecionado está contido no tema do projeto
        .filter((p) => {
            if (bnccTheme === '') return true;
            // Usa includes para ser flexível ou === para exato. Includes é mais seguro se houver espaços extras.
            return p.bnccTheme?.toLowerCase().includes(bnccTheme.toLowerCase());
        })

        // 6. Filtro de Data (Periodo)
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

        // 7. Ordenação (Sort)
        .sort((a, b) => {
            const dateA = new Date(
                sortOrder === 'recentes' 
                ? (a.createdAt || 0) 
                : (a.updatedAt || a.createdAt || 0) 
            );
            const dateB = new Date(
                sortOrder === 'recentes' 
                ? (b.createdAt || 0) 
                : (b.updatedAt || b.createdAt || 0)
            );
            return dateB - dateA; 
        });

    function difficultyStringCheck(diffState) {
        return diffState;
    }

    const opcoesAno = [
        { value: '2', label: '2º Ano' }, { value: '3', label: '3º Ano' },
        { value: '4', label: '4º Ano' }, { value: '5', label: '5º Ano' },
        { value: '6', label: '6º Ano' }, { value: '7', label: '7º Ano' },
        { value: '8', label: '8º Ano' }, { value: '9', label: '9º Ano' },
        { value: '1', label: '1º Médio' }, { value: '2', label: '2º Médio' }, { value: '3', label: '3º Médio' },
    ];

    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            height: '42px',
            minHeight: '42px',
            borderRadius: '6px',
            borderColor: state.isFocused ? '#2c3e50' : '#ddd',
            boxShadow: 'none',
            fontSize: '0.9rem',
            backgroundColor: 'white',
        }),
        valueContainer: (base) => ({ ...base, padding: '0 8px' }),
        input: (base) => ({ ...base, margin: 0, padding: 0 }),
    };

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
                        onChange={(selected) => {
                        setAnosSelecionados(selected || []);
                        }}
                        closeMenuOnSelect={false}
                        isClearable
                        styles={{
                        control: (base, state) => ({ 
                            ...base,
                            height: '42px',
                            borderColor: state.isFocused ? '#1967d2' : '#ccc',
                            boxShadow: 'none',
                            '&:hover': {
                                borderColor: '#1967d2',
                            },
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
                            zIndex: 9999, // Garante que o menu fique por cima
                        }),
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
                    
                    {/* === NOVO: Select de Unidade Temática Ativado === */}
                    <select 
                        className={styles.native_select}
                        value={bnccTheme}
                        onChange={(e) => setBnccTheme(e.target.value)}
                    >
                        {/* Define o valor como vazio para mostrar todos */}
                        <option value="">Unidade Temática</option>
                        {/* Os values agora são os textos reais para bater com o DB */}
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
                                // === Reset de todos os filtros ===
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