import ProjectForme from './Project_Forme/ProjectForme';
import { useNavigate } from 'react-router-dom';
import styles from './NewProjects.module.css';

function NewProject() {
    const navigate = useNavigate();

    function createPost(project) {
        // Converta categoryId para string para garantir a comparação correta
        const categoryId = String(project.categoryId);
        
        // Validação antecipada da categoria
        if (!["1", "2"].includes(categoryId)) {
            alert('Selecione uma categoria válida (Revisão,Aprovada)');
            return; // Sai da função se a categoria for inválida
        }

        // Adicione campos padrão
        const projectToSend = {
            ...project,
            categoryId, // Usa a versão convertida para string
            sgom: 0,
            services: [],
            createdAt: new Date().toISOString()
        };

        fetch('http://localhost:5000/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectToSend)
        })
        .then((response) => {
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return response.json();
        })
        .then((data) => {
            console.log("Projeto salvo com sucesso:", data);
            navigate(`/projects/${data.id}`); // Redireciona para o projeto criado
        })
        .catch((error) => {
            console.error("Erro detalhado:", error);
            alert(`Erro ao criar o projeto: ${error.message}`);
            
        });
    }

    
    return (
        <div className={styles.newproject_container}>
            <h1> Criar Questão</h1>
            <ProjectForme handleSubmit={createPost} btnText="Submeter Questão"/>  
        </div>
    );
}

export default NewProject;