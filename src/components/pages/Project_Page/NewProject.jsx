// src/components/pages/Project_Page/NewProject.jsx
import { useNavigate } from 'react-router-dom';
import ProjectForme from './Project_Forme/ProjectForme';
import api from '../../../services/api';
import { authService } from '../../../services/authService';
import styles from './NewProjects.module.css';

function NewProject() {
    const navigate = useNavigate();

    const createPost = async (project) => {
        const payload = {
            name: project.name,
            professor_name: project.professorName,
            phase_level: project.phaseLevel,
            grau_id: project.grauId ? Number(project.grauId) : null,
            serie_ano: project.grauName || '',
            difficulty_level: Number(project.difficultyLevel),
            knowledge_objects: project.knowledgeObjects,
            bncc_theme: project.bnccTheme,
            ability_code: project.abilityCode,
            ability_description: project.abilityDescription,
            question_statement: project.questionStatement,
            alternatives: project.alternatives,
            correct_alternative: project.correctAlternative.toLowerCase(),
            detailed_resolution: project.detailedResolution,
            category_id: Number(project.categoryId) || null,
            reviewer_comments: project.reviewerComments || "",
            image_id: project.image?.id || null,
            image_role: project.image?.role || null,
        };

        console.log('Payload enviado:', JSON.stringify(payload, null, 2));

        try {
            const response = await api.post('/api/v1/questions', payload);
            if (response.data && response.data.success) {
                navigate('/projects');
            } else {
                alert(response.data?.message || 'Erro ao criar questão');
            }
        } catch (error) {
            console.error('Erro detalhado:', error.response?.data);
            const errorMsg = authService._handleError(error);
            alert(`Erro ao criar questão: ${errorMsg}`);
        }
    };

    return (
        <div className={styles.newproject_container}>
            <ProjectForme handleSubmit={createPost} btnText="Submeter Questão" />
        </div>
    );
}

export default NewProject;