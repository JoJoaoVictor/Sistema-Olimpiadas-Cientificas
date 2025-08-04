import styles from './Projetos.module.css'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Container from '../Layout/Container.jsx'
import ProjectForm from '../Projects/ProjectForme.jsx'

function Projetos() {
  // Obtém o ID da questão pela URL (usado para buscar no backend)
  const { id } = useParams()

  // Estado da questão carregada
  const [projeto, setProjeto] = useState({})

  // Mostra ou esconde o formulário de edição
  const [showProjetoForm, setShowProjetoForm] = useState(false)

  // Armazena o endpoint atual da questão (projects ou questõesAprovadas)
  const [tipoQuestao, setTipoQuestao] = useState('projects')

  // Quando o componente carrega ou o ID muda
  useEffect(() => {
    async function buscarProjeto() {
      // Tenta buscar a questão em ambos os endpoints
      const fontes = ['projects', 'questõesAprovadas']
      for (const endpoint of fontes) {
        const res = await fetch(`http://localhost:5000/${endpoint}/${id}`)
        if (res.ok) {
          const data = await res.json()
          setProjeto(data) // Define a questão
          setTipoQuestao(endpoint) // Define o endpoint onde foi achado
          return
        }
      }
      console.error('Questão não encontrada.')
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
        console.error('Erro ao mover questão:', err)
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
          console.error('Erro ao editar projeto:', err)
        })
    }
  }

  return (
    <div className={styles.project_datails}>
      <Container customClass="Column">
        <div className={styles.details_container}>
          <h1>{projeto.name}</h1>
          <button onClick={toggleProjetoForm} className={styles.button}>
            {!showProjetoForm ? 'Editar Projeto' : 'Fechar'}
          </button>

          {!showProjetoForm ? (
            // Exibe dados da questão (modo leitura)
            <div className={styles.project_info}>
              <span>Nome: </span><p>{projeto.name}</p>
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
              <span>Alternativas: </span><p>{projeto.alternatives}</p>
              <span>Resposta Correta: </span><p>{projeto.correctAlternative}</p>
              <span>Resolução Detalhada: </span><p>{projeto.detailedResolution}</p>
            </div>
          ) : (
            // Formulário de edição
            <div className={styles.project_info}>
              <ProjectForm
                handleSubmit={editPost}
                btnText="Concluir edição"
                projectData={projeto}
              />
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default Projetos
