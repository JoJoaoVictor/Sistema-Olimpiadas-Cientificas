import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForme from './Project_Forme/ProjectForme';
import api from '../../../services/api';
import { authService } from '../../../services/authService';
import styles from './NewProjects.module.css';

function NewProject() {
    const navigate = useNavigate();
    const formRef = useRef(null);

    // Carrega o rascunho de forma SÍNCRONA antes da primeira renderização
    const [initialData] = useState(() => {
        const saved = sessionStorage.getItem('draftNewProject');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Não remova ainda – mantenha até que o usuário submeta com sucesso
                // sessionStorage.removeItem('draftNewProject');
                return parsed;
            } catch (e) {
                console.error('Erro ao restaurar rascunho:', e);
                return null;
            }
        }
        return null;
    });

    // Autosave a cada 2 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            if (formRef.current?.getFormData) {
                const data = formRef.current.getFormData();
                if (data && Object.keys(data).length > 0) {
                    sessionStorage.setItem('draftNewProject', JSON.stringify(data));
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Salvamento de emergência quando a sessão expira
    useEffect(() => {
        const handler = () => {
            if (formRef.current?.getFormData) {
                const data = formRef.current.getFormData();
                sessionStorage.setItem('draftNewProject', JSON.stringify(data));
            }
        };
        window.addEventListener('session-expired', handler);
        return () => window.removeEventListener('session-expired', handler);
    }, []);

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

        try {
            const response = await api.post('/api/v1/questions', payload);
            if (response.data && response.data.success) {
                sessionStorage.removeItem('draftNewProject');
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
            <ProjectForme
                ref={formRef}
                handleSubmit={createPost}
                btnText="Submeter Questão"
                initialData={initialData}   
            />
        </div>
    );
}

export default NewProject;