import styles from './Projetos.module.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Container from '../../../../Layout/Container.jsx'
import ProjectForm from '../../Project_Forme/ProjectForme.jsx'

function Projetos() {
  // Obtém o ID da questão pela URL (usado para buscar no backend)
  const { id } = useParams()

  // Estado da questão carregada
  const [projeto, setProjeto] = useState({})

  // Mostra ou esconde o formulário de edição
  const [showProjetoForm, setShowProjetoForm] = useState(false)

  // Armazena o endpoint atual da questão (projects ou questõesAprovadas)
  const [tipoQuestao, setTipoQuestao] = useState('projects')

  // Estado para controlar o carregamento
  const [carregando, setCarregando] = useState(true)

  // Quando o componente carrega ou o ID muda
  useEffect(() => {
    async function buscarProjeto() {
      // DEBUG: Início da busca
      console.log('🔍 Iniciando busca da questão...')
      
      setCarregando(true)
      
      // Tenta buscar a questão em ambos os endpoints
      const fontes = ['projects', 'questõesAprovadas']
      for (const endpoint of fontes) {
        // DEBUG: Mostra qual endpoint está sendo tentado
        console.log(`📡 Tentando endpoint: ${endpoint}`)
        
        try {
          const res = await fetch(`http://localhost:5000/${endpoint}/${id}`)
          if (res.ok) {
            const data = await res.json()
            
            // DEBUG: Mostra qual endpoint retornou a questão
            console.log(`✅ Questão encontrada no endpoint: ${endpoint}`)
            console.log(`📊 Dados da questão:`, {
              id: data.id,
              name: data.name,
              categoryName: data.categoryName
            })
            
            setProjeto(data) // Define a questão
            setTipoQuestao(endpoint) // Define o endpoint onde foi achado
            
            // DEBUG: Mostra o valor de tipoQuestao após carregar
            console.log(`🎨 tipoQuestao definido como: ${endpoint}`)
            
            setCarregando(false)
            return
          }
        } catch (error) {
          console.error(`❌ Erro no endpoint ${endpoint}:`, error)
        }
      }
      
      console.error('❌ Questão não encontrada.')
      setCarregando(false)
    }

    buscarProjeto()
  }, [id])

  // Alterna o estado de exibição do formulário
  function toggleProjetoForm() {
    setShowProjetoForm(!showProjetoForm)
  }

  // Lida com a edição ou movimentação da questão entre os arrays
  async function editPost(project) {
    // DEBUG: Início da edição
    console.log('✏️ Iniciando edição da questão...')
    console.log(`📝 Categoria anterior: ${projeto.categoryName}, Nova categoria: ${project.categoryName}`)
    
    const novaCategoria = project.categoryName
    let novoEndpoint = tipoQuestao // Inicia como o atual

    // Decide o novo endpoint com base na categoria
    if (novaCategoria === 'Aprovado') novoEndpoint = 'questõesAprovadas'
    else if (novaCategoria === 'Revisão') novoEndpoint = 'projects'

    // DEBUG: Mostra os endpoints envolvidos
    console.log(`🔄 Endpoint anterior: ${tipoQuestao}, Novo endpoint: ${novoEndpoint}`)

    const updatedProject = { ...project, id: projeto.id }

    // Se a categoria mudou, precisamos mover de um array para outro
    if (novoEndpoint !== tipoQuestao) {
      try {
        // DEBUG: Movendo questão
        console.log(`🚀 Movendo questão para novo endpoint: ${novoEndpoint}`)
        
        // POST: adiciona no novo array
        const addRes = await fetch(`http://localhost:5000/${novoEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProject)
        })

        if (!addRes.ok) throw new Error('Falha ao mover para novo endpoint')

        // DELETE: remove do array antigo
        await fetch(`http://localhost:5000/${tipoQuestao}/${projeto.id}`, {
          method: 'DELETE'
        })

        // Atualiza estados após sucesso
        setTipoQuestao(novoEndpoint)
        
        // DEBUG: Confirma atualização
        console.log(`✅ tipoQuestao atualizado para: ${novoEndpoint}`)
        
        setProjeto(updatedProject)
        setShowProjetoForm(false)
      } catch (err) {
        console.error('❌ Erro ao mover questão:', err)
      }
    } else {
      // DEBUG: Atualizando no mesmo endpoint
      console.log(`📋 Atualizando questão no mesmo endpoint: ${tipoQuestao}`)
      
      // Caso continue no mesmo array, apenas atualiza
      fetch(`http://localhost:5000/${tipoQuestao}/${projeto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      })
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao atualizar o projeto')
          return res.json()
        })
        .then((data) => {
          setProjeto(data)
          setShowProjetoForm(false)
          
          // DEBUG: Confirma atualização
          console.log(`✅ Questão atualizada com sucesso no endpoint: ${tipoQuestao}`)
        })
        .catch((err) => {
          console.error('❌ Erro ao editar projeto:', err)
        })
    } 
  }

  // DEBUG: Mostra estado atual durante o render
  console.log(`🎨 RENDER - tipoQuestao: ${tipoQuestao}, categoryName: ${projeto.categoryName}`)
  console.log(`🎯 Cor aplicada: ${tipoQuestao === 'questõesAprovadas' ? 'VERDE' : 'LARANJA'}`)

  return (
    <div className={styles.project_datails}>
      <Container customClass="Column">
        <div className={styles.details_container}>
          {/* Mostra loading enquanto busca os dados */}
          {carregando ? (
            <p>Carregando questão...</p>
          ) : (
            <>
              <h1 className={`${styles.title} ${
                  tipoQuestao === 'questõesAprovadas' 
                    ? styles.title_aprovada 
                    : styles.title_pendente
                }`}>
                {projeto.name}
                {/* DEBUG: Mostra visualmente o status */}
                <small style={{fontSize: '0.5em', display: 'block', marginTop: '5px'}}>
                  {tipoQuestao === 'questõesAprovadas' ? 'APROVADA' : 'PENDENTE'}
                </small>
              </h1>
              
              <button 
                    onClick={toggleProjetoForm} 
                    className={`${styles.button} ${
                        tipoQuestao === 'questõesAprovadas' 
                            ? styles.button_aprovada 
                            : styles.button_pendente
                    } ${showProjetoForm ? styles.button_active : ''}`}
                >
                    {!showProjetoForm ? 'Editar Questão' : 'Fechar Edição'}
              </button>

              {!showProjetoForm ? (
                // Exibe dados da questão (modo leitura)
                <div className={styles.project_info}>
                  {/* Adiciona informação de status para debug visual */}
                  <span> Nome:<p>{projeto.name}</p> </span>
                  <span>Dificuldade: </span><p>{projeto.difficultyLevel}/5</p>
                  <span>Professor: </span><p>{projeto.professorName}</p>
                  <span>Série/Ano escolar a que se referem a questão:</span><p>{projeto.serieAno} ano</p>
                  <span>Grau de Ensino: </span><p>{projeto.grauName}</p>
                  <span>Fase: </span><p>{projeto.phaseLevel}</p>
                
                  <span>Tema BNCC: </span><p>{projeto.bnccTheme}</p>
                  <span>Código Habilidade: </span><p>{projeto.abilityCode}</p>
                  <span>Descrição Habilidade: </span><p>{projeto.abilityDescription}</p>
                  <span>Objetos de Conhecimento: </span><p>{projeto.knowledgeObjects}</p>
                  <span>Enunciado: </span><p>{projeto.questionStatement}</p>
                  <span>Imagem(opcional):</span><p></p>{projeto.imageURL}
                
                  <span>Alternativas: </span><p>{projeto.alternatives}</p>
                  <span>Resposta Correta: </span><p>{projeto.correctAlternative}</p>
                  <span>Resolução Detalhada: </span><p>{projeto.detailedResolution}</p>
                </div>
              ) : (
                // Formulário de edição
                <div className={styles.project_edit}>
                  <ProjectForm
                    handleSubmit={editPost}
                    btnText="Concluir edição"
                    projectData={projeto}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export default Projetos