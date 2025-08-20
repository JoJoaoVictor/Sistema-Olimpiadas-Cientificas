// Importação de dependências e componentes
import styles from './Projects.module.css' // Estilos CSS module específicos para este componente
import Container from '../Layout/Container' // Componente de container para layout
import LinkButton from '../Layout/LinkButton' // Componente de botão com link
import ProjectsCard from '../Projects/ProjectsCard' // Componente que exibe cada card de projeto
import ProjectList from '../Projects/ProjectList' // Componente que exibe a lista de projetos
import { useState, useEffect } from 'react' // Hooks do React para estado e efeitos colaterais
import Loading from '../Layout/Loading' // Componente de loading (carregamento)
import SearchBar from '../form/SearchBar'

// icons Layuot
import { LuLayoutGrid } from "react-icons/lu";
import { LuLayoutList } from "react-icons/lu";
import Select from 'react-select'; 

function Project() {
    // Estados principais
    const [projects, setProjects] = useState([]) // Armazena a lista de projetos
    const [loading, setLoading] = useState(true) // Controla o estado de carregamento
    const [error, setError] = useState(null) // Armazena mensagens de erro

    // Estados para filtragem e ordenação
    const [searchTerm, setSearchTerm] = useState('') // Termo da barra de busca
    const [sortOrder, setSortOrder] = useState('recentes') // Ordenação: recentes ou modificados
    const [dificuldade, setDificuldade] = useState(''); // Nível de dificuldade selecionado
    const [anosSelecionados, setAnosSelecionados] = useState([]); // Anos selecionados para filtragem
    const [tipoQuestao, setTipoQuestao] = useState('aprovadas'); // 'aprovadas' ou 'pendentes'

    // Estado para controle do modo de visualização (grid ou list)
    const [viewMode, setViewMode] = useState('list'); // 'grid' ou 'list'

    // Requisição dos projetos da API quando o componente é montado
  useEffect(() => {
    const endpoint = tipoQuestao === 'aprovadas' 
        ? 'http://localhost:5000/questõesAprovadas' 
        : 'http://localhost:5000/projects';

    setLoading(true);
    fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar questões');
            return res.json();
        })
        .then(data => {
            setProjects(data);
            setLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setLoading(false);
        });
}, [tipoQuestao]); 
 // Dependência: reexecuta sempre que tipoQuestao mudar

     // Função para lidar com a seleção de anos
    const opcoesAno = [
      { value: '4', label: '4º' },
      { value: '5', label: '5º' },
      { value: '6', label: '6º' },
      { value: '7', label: '7º' },
      { value: '8', label: '8º' },
      { value: '9', label: '9º' },
      { value: '1', label: '1º Medio' },
      { value: '2', label: '2º Medio' },
      { value: '3', label: '3º Medio' },
    ];

    // Função para remover um projeto
    // Função assíncrona para remover um projeto pelo ID
    async function removeProject(id) {
    // Confirma com o usuário antes de remover
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;

    try {
        // Ativa o estado de carregamento (opcional, para exibir o loader)
        setLoading(true);

        // Define o endpoint de remoção baseado no tipo de questão "aprovadas" ou "pendentes"
        // Usamos o mesmo endpoint da listagem atual,
        // pois você pode estar vendo os dados vindos de "/questõesAprovadas" OU "/projects"
        const deleteEndpoint = tipoQuestao === 'aprovadas'
        ? `http://localhost:5000/questõesAprovadas/${id}`  // Deletar de "/questõesAprovadas" se estiver nesse modo
        : `http://localhost:5000/projects/${id}`           // Deletar de "/projects" se estiver em modo "pendentes"

        // Envia a requisição DELETE para o backend
        const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
        });

        // Se a requisição falhar (status diferente de 2xx), lança um erro
        if (!response.ok) {
        throw new Error('Falha ao remover projeto');
        }

        // Remove o projeto da lista local (estado React) sem recarregar a página
        setProjects(prevProjects =>
        prevProjects.filter(project => project.id !== id)
        );

        // Alerta o usuário do sucesso
        alert('Projeto removido com sucesso!');
    } catch (err) {
        // Captura e exibe qualquer erro que ocorrer
        console.error('Erro:', err);
        alert('Erro ao remover projeto');
    } finally {
        // Desativa o carregamento (independente de sucesso ou erro)
        setLoading(false);
    }
    }


    // Filtragem e ordenação dos projetos
    const filteredAndSortedProjects = projects
    .filter((p) => 
        dificuldade === '' || String(p.difficultyLevel) === dificuldade
    )
    .filter((p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => {
  if (anosSelecionados.length === 0) return true;

  const serieNormalizada = String(p.serieAno).replace('º', '').replace('°', '').replace('ano', '').replace(/\s/g, '');

  return anosSelecionados.some(opcao =>
    serieNormalizada === opcao.value
  );
})


    .sort((a, b) => {
        if (sortOrder === 'recentes') {
            return new Date(b.createdAt) - new Date(a.createdAt)
        } else if (sortOrder === 'modificados') {
            return new Date(b.updatedAt) - new Date(a.updatedAt)
        }
        return 0
    })

        // filtro com debounce
        const handleSearch = (term) => {
            setSearchTerm(term);
          };

           // Buscar todas as questões (armazenadas em questõesAprovadas)
      
    // Renderiza loading enquanto carrega os dados
    if (loading) return (
        <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
        }}>
            <Loading />
        </div>
    )

    // Renderiza mensagem de erro
    if (error) return <p style={{color: 'red'}}>{error}</p>
    if (projects.length === 0 && !loading) return <p style={{color: 'red'}}>Não há questões cadastradas</p>

    
    // Renderização principal
    return (
        <div className={styles.projects_container}>
            {/* Título e botão de criar projeto */}
            <div className={styles.title_container}>
                <h1>Minhas Questões</h1>
                <LinkButton to="/montarProva/" text="Montar Prova" />
            </div>

            {/* Área dos filtros e resultados */}
            <div className={styles.projects_card} style={{ boxShadow: '4px 8px rgba(0, 0, 0, 0.2)' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h1 style={{marginBottom: '10px'}}>Documentos</h1>
                {/* Botão de muda Layout das questões */}    
                <button 
                    className={styles.icon_button}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {/* Ícone de layout */}
                    {viewMode === 'grid' ? (
                        <LuLayoutList className={styles.icon} />
                    ) : (
                        <LuLayoutGrid className={styles.icon} />
                    )}
                
                </button>
                
                
                </div>
                {/* Cabeçalho com busca e ordenação */}
                <div className={styles.filter_button}>
                    
                    <button 
                        className={styles.button}
                        onClick={() => setTipoQuestao('aprovadas')}
                        >
                        Questões Aprovadas 
                    </button>
                    <button 
                        className={styles.button}
                        onClick={() => setTipoQuestao('pendentes')}
                    >
                        Questões Pendentes
                    </button>

                   <Select
                            className={styles.select_anos}
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
                                control: (base) => ({
                                ...base,
                              padding: '2px',
                              border: '1px solid #ccc',
                              borderRadius: '5px',
                              outline: 'none', 
                              boxShadow: 'none',
                              '&:hover': {
                              border: '1px solid #000000', 
                              transition: '0.3s',
                              }, 
                                }),
                            }}
                            />

                  
                    {/* Ordenação */}
                     <select    className={styles.select}
                        value={dificuldade}
                        onChange={(e) => {
                            setDificuldade(e.target.value);
                            setSortOrder(e.target.value);
                        }}
                        >
                        <option value="">Nível de Dificuldade</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>

                        
                    <select className={styles.select}
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="recentes">Recentes</option>
                        <option value="modificados">Últimas Modificações</option>
                        
                    </select>
                      {/* Campo de busca */}
                    <div style={{ alignItems: 'center', display: 'flex' }}>
                        <SearchBar 
                     value={searchTerm} 
                     onDebouncedChange={handleSearch} 
                     placeholder="Buscar por nome..." 
                     delay={400}
                    />
                    </div>
                     
                    
                   

                </div>

                {/* Container com os projetos ("start" do container principal em layout ) */}
                {/* Container com os projetos */}
                <Container customClass={viewMode === 'list' ? 'column' : 'start'}>
                
                {/* Se houver projetos para exibir */}
                {filteredAndSortedProjects.length > 0 && (

                    // Modo Lista: exibe cada projeto com menos informações (em <ul>)
                    viewMode === 'list' ? (
                    <ul style={{ padding: 0, width: '100%' }}>
                        {filteredAndSortedProjects.map((project) => (
                        <ProjectList
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            difficultyLevel={project.difficultyLevel}
                            abilityCode={project.abilityCode}
                            serieAno={project.serieAno}
                            phaseLevel={project.phaseLevel}
                            bnccTheme={project.bnccTheme}
                            categoryName={project.categoryName}
                            createdAt={project.createdAt}
                            handleRemove={removeProject}
                        />
                        ))}
                    </ul>
                    ) : (
                    // Modo Grade: exibe os cards completos com todas as informações
                    filteredAndSortedProjects.map((project) => (
                        <ProjectsCard
                        key={project.id}
                        id={project.id}
                        name={project.name}
                        professorName={project.professorName}
                        serieAno={project.serieAno}
                        phaseLevel={project.phaseLevel}
                        difficultyLevel={project.difficultyLevel}
                        knowledgeObjects={project.knowledgeObjects}
                        bnccTheme={project.bnccTheme}
                        abilityCode={project.abilityCode}
                        abilityDescription={project.abilityDescription}
                        questionStatement={project.questionStatement}
                        alternatives={project.alternatives}
                        correctAlternative={project.correctAlternative}
                        detailedResolution={project.detailedResolution}
                        categoryId={project.categoryId}
                        categoryName={project.categoryName}
                        grauName={project.grauName}
                        handleRemove={removeProject}
                        createdAt={project.createdAt}
                        />
                    ))
                    )
                )}
                </Container>


            </div>
        </div>
    )
}

export default Project
