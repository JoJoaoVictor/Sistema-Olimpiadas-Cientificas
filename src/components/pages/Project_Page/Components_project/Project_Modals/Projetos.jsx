import styles from './Projetos.module.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Container from '../../../../Layout/Container.jsx'
import ProjectForm from '../../Project_Forme/ProjectForme.jsx'
import LatexText from '../LatexText.jsx'

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
      setCarregando(true)
      
      // Tenta buscar a questão em ambos os endpoints
      const fontes = ['projects', 'questõesAprovadas']
      for (const endpoint of fontes) {
        // DEBUG: Mostra qual endpoint está sendo tentado
        
        try {
          const res = await fetch(`http://localhost:5000/${endpoint}/${id}`)
          if (res.ok) {
            const data = await res.json()
            
            setProjeto(data) // Define a questão
            setTipoQuestao(endpoint) // Define o endpoint onde foi achado

            
            setCarregando(false)
            return
          }
        } catch (error) {
          console.error(` Erro no endpoint ${endpoint}:`, error)
        }
      }
      
      console.error(' Questão não encontrada.')
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
    const novaCategoria = project.categoryName
    let novoEndpoint = tipoQuestao // Inicia como o atual

    // Decide o novo endpoint com base na categoria
    if (novaCategoria === 'Aprovado') novoEndpoint = 'questõesAprovadas'
    else if (novaCategoria === 'Revisão') novoEndpoint = 'projects'

    const updatedProject = { ...project, id: projeto.id }

    // Se a categoria mudou, precisamos mover de um array para outro
    if (novoEndpoint !== tipoQuestao) {
      try {
        
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
        
        setProjeto(updatedProject)
        setShowProjetoForm(false)
      } catch (err) {
        console.error(' Erro ao mover questão:', err)
      }
    } else {
      
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
        })
        .catch((err) => {
          console.error(' Erro ao editar projeto:', err)
        })
    } 
  }

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
                // Exibe dados da questão (modo leitura) COM SUPORTE LaTeX
                <div className={styles.project_info}>
                  {/* Adiciona informação de status para debug visual */}
                  <span>Nome:<p>{projeto.name}</p></span>
                  <span>Dificuldade: <p>{projeto.difficultyLevel}/5</p></span>
                  <span>Professor: <p>{projeto.professorName}</p></span>
                  <span>Série/Ano escolar a que se referem a questão: <p>{projeto.serieAno} ano</p></span>
                  <span>Grau de Ensino: <p>{projeto.grauName}</p></span>
                  <span>Fase: <p>{projeto.phaseLevel}</p></span>
                
                  <span>Tema BNCC: <p>{projeto.bnccTheme}</p></span>
                  <span>Código Habilidade: <p>{projeto.abilityCode}</p></span>
                  <span>Descrição Habilidade: <p>{projeto.abilityDescription}</p></span>
                  <span>Objetos de Conhecimento: <p>{projeto.knowledgeObjects}</p></span>
                  
                  {/* Campos com suporte LaTeX */}
                  <div className={styles.latex_field}>
                    <span>Enunciado: </span>
                    <div className={styles.latex_content}>
                      <LatexText content={projeto.questionStatement || "Sem enunciado"} />
                    </div>
                  </div>

                  <span>Imagem (opcional): <p>{projeto.imageURL || "Nenhuma imagem"}</p></span>
                  
                  <div className={styles.latex_field}>
                    <span>Alternativas: </span>
                    <div className={styles.latex_content}>
                      <LatexText content={projeto.alternatives || "Sem alternativas"} />
                    </div>
                  </div>

                  <span>Resposta Correta: <p>{projeto.correctAlternative}</p></span>
                  
                  <div className={styles.latex_field}>
                    <span>Resolução Detalhada: </span>
                    <div className={styles.latex_content}>
                      <LatexText content={projeto.detailedResolution || "Sem resolução detalhada"} />
                    </div>
                  </div>
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