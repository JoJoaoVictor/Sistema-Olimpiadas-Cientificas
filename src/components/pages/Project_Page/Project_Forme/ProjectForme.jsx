import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

// Importação dos seus componentes personalizados de layout/form
import Input from '../../../form/Input.jsx';
import Select from '../../../form/Select.jsx'; // Usado para 'Situação da Questão'
import SubmitButton from '../../../form/SubmitButton.jsx';
import ImageUploader from '../../../form/ImageUploader.jsx';
// Importação do componente responsável por renderizar o LaTeX
import LatexText from './../Components_project/LatexText.jsx';

// Ícones e Estilos CSS Modules
import { BsFillInfoCircleFill, BsCardText, BsPersonBadge, BsBook } from 'react-icons/bs';
import styles from './ProjectForme.module.css';

function ProjectForme({ handleSubmit, projectData, btnText }) {
    const location = useLocation();
    
    // --- LÓGICA DE MODO DE EDIÇÃO ---
    // Verifica se estamos editando (se tem ID ou rota de edição)
    const isEditMode = location.pathname.includes('/projetos/') || !!projectData?.id;

    // --- LISTA DE OPÇÕES PARA SÉRIE/ANO ---
    const opcoesAno = [
        { value: '2º Fundamental', label: '2º Fundamental' }, { value: '3º Fundamental', label: '3º Fundamental' },
        { value: '4º Fundamental', label: '4º Fundamental' }, { value: '5º Fundamental', label: '5º Fundamental' },
        { value: '6º Fundamental', label: '6º Fundamental' }, { value: '7º Fundamental', label: '7º Fundamental' },
        { value: '8º Fundamental', label: '8º Fundamental' }, { value: '9º Fundamental', label: '9º Fundamental' },
        { value: '1º Médio', label: '1º Médio' }, { value: '2º Médio', label: '2º Médio' }, { value: '3º Médio', label: '3º Médio' },
    ];

    // --- 1. LÓGICA DE PERMISSÃO (ROLE) ---
    // Verifica quem é o usuário logado para saber se pode ver campos administrativos
    const [currentUserRole, setCurrentUserRole] = useState("");

    useEffect(() => {
        const storedData = localStorage.getItem("user_token");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (parsedData.user && parsedData.user.role) {
                    setCurrentUserRole(parsedData.user.role);
                }
            } catch (error) {
                console.error("Erro ao verificar permissões:", error);
            }
        }
    }, []);

    const allowedRoles = ['ADMIN', 'REVISOR', 'PROFESSOR'];
    // Define se o usuário pode ver a área de "Comentários do Revisor"
    const canEditComments = currentUserRole && allowedRoles.includes(currentUserRole.toUpperCase());

    // --- 2. ESTADO DO FORMULÁRIO (State Principal) ---
    const [project, setProject] = useState({
        name: "",
        professorName: "",
        phaseLevel: "",
        serieAno: "", 
        difficultyLevel: "",
        knowledgeObjects: "",
        bnccTheme: "",
        abilityCode: "",
        abilityDescription: "",
        questionStatement: "",
        alternatives: "", 
        correctAlternative: "",
        detailedResolution: "",
        categoryId: "1",
        reviewerComments: ""
    });

    // Estado separado para gerenciar as 5 alternativas (A, B, C, D, E) individualmente
    const [alts, setAlts] = useState({ A: "", B: "", C: "", D: "", E: "" });

    // Estados auxiliares para selects dinâmicos
    const [categories, setCategories] = useState([]);
    const [knowledgeOptionsList, setKnowledgeOptionsList] = useState([]);

    // Estados de controle de erro e envio
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 3. CARREGAMENTO DE DADOS (Fetch) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Busca as categorias do banco (para o status da questão)
                const catsRes = await fetch("http://localhost:5000/categoris");
                const catsData = await catsRes.json();
                setCategories(catsData);
            } catch (err) {
                console.error("Erro ao carregar opções:", err);
                setFormError("Erro ao carregar dados do servidor.");
            }
        };

        fetchData();

        // Se estivermos editando, preenche o formulário com os dados existentes
        if (projectData && Object.keys(projectData).length > 0) {
            setProject((prev) => ({
                ...prev,
                ...projectData, 
                categoryId: projectData.categoryId ? Number(projectData.categoryId) : "",
                reviewerComments: projectData.reviewerComments || ""
            }));

            // Tenta processar o JSON das alternativas salvas
            if (projectData.alternatives) {
                try {
                    const parsedAlts = JSON.parse(projectData.alternatives);
                    setAlts(parsedAlts);
                } catch (e) {
                    console.log("Alternativas não formatadas como JSON.");
                }
            }
        }
    }, [projectData]);

    // --- 4. LÓGICA DINÂMICA: OBJETOS DO CONHECIMENTO ---
    // Roda sempre que o usuário muda o select "Série/Ano"
    useEffect(() => {
        if (project.serieAno) {
            console.log(`Buscando objetos do conhecimento para o ano ID: ${project.serieAno}`);
            
            // Simulação baseada na escolha:
            let mockOptions = [];
            if(['1', '2', '3', '4', '5'].includes(project.serieAno)) {
                 mockOptions = ["Números Naturais", "Geometria Básica", "Medidas de Tempo"];
            } else {
                 mockOptions = ["Álgebra Linear", "Funções", "Geometria Analítica", "Probabilidade"];
            }

            setKnowledgeOptionsList(mockOptions);
        } else {
            setKnowledgeOptionsList([]); // Limpa se não tiver ano selecionado
        }
    }, [project.serieAno]);


    // --- 5. HANDLERS (Manipuladores de Eventos) ---
    
    // Atualiza qualquer campo simples do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({
            ...prev,
            [name]: value
        }));
        
        // Limpa erro do campo se o usuário começar a digitar/selecionar
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
        if (formError) setFormError("");
    };

    // Atualiza especificamente os campos das Alternativas (A-E)
    const handleAltChange = (e) => {
        const { name, value } = e.target;
        setAlts((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Validação específica para números (Dificuldade)
    const handleDifficultyChange = (e) => {
        const val = e.target.value;
        if (val === "" || (!isNaN(val) && Number(val) >= 1 && Number(val) <= 5)) {
            handleChange(e);
        }
    };

    // --- 6. ENVIO DO FORMULÁRIO (Submit) ---
    const submit = (e) => {
        e.preventDefault();
        
        // Validações básicas
        const errors = {};
        if (!project.name) errors.name = "O título da questão é obrigatório.";
        if (!project.professorName) errors.professorName = "O nome do professor é obrigatório.";
        if (!project.serieAno) errors.serieAno = "Selecione a série/ano."; 
        if (!project.difficultyLevel) errors.difficultyLevel = "Defina a dificuldade.";
        if (!project.questionStatement) errors.questionStatement = "O enunciado da questão é obrigatório.";
        
        // Valida se todas as 5 alternativas foram preenchidas
        if(!alts.A || !alts.B || !alts.C || !alts.D || !alts.E) {
            errors.alternatives = "Preencha todas as 5 alternativas (A-E).";
        }

        // Validação condicional para revisor
        if (isEditMode && canEditComments && !project.categoryId) {
            errors.categoryId = "Defina a situação da questão.";
        }

        // Se houver erros, para o envio e mostra mensagens
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFormError("Existem campos obrigatórios não preenchidos.");
            return;
        }

        setIsSubmitting(true);

        const selectedCategory = categories.find(c => String(c.id) === String(project.categoryId));

        // Empacota as alternativas em JSON String para salvar no banco
        const alternativesJSON = JSON.stringify(alts);

        // Objeto final para envio
        const finalData = {
            ...project,
            alternatives: alternativesJSON,
            difficultyLevel: Number(project.difficultyLevel),
            categoryId: Number(project.categoryId) || null,
            categoryName: selectedCategory?.name || 'Sem categoria',
            createdAt: project.createdAt || new Date().toISOString(),
        };

        // Decide se cria ou atualiza
        if (projectData?.id) {
            handleSubmit(finalData);
            setIsSubmitting(false);
        } else {
            createProject(finalData);
        }
    };

    // Função interna para criar novo projeto (POST)
    const createProject = (data) => {
        setFormError("Enviando projeto...");
        fetch("http://localhost:5000/projects", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(resp => {
            if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);
            return resp.json();
        })
        .then(() => {
            alert(`Projeto "${data.name}" criado com sucesso!`);
            // Reset do formulário após sucesso
            setProject({
                name: "", professorName: "", phaseLevel: "", serieAno: "", 
                difficultyLevel: "", knowledgeObjects: "", bnccTheme: "", 
                abilityCode: "", abilityDescription: "", questionStatement: "", 
                alternatives: "", correctAlternative: "", detailedResolution: "", 
                categoryId: "1", reviewerComments: ""
            });
            setAlts({ A: "", B: "", C: "", D: "", E: "" });
            setFormError("");
            setFieldErrors({});
            setIsSubmitting(false);
        })
        .catch(err => {
            console.error(err);
            setFormError(`Erro ao criar projeto: ${err.message}`);
            setIsSubmitting(false);
        });
    };

    // Renderiza mensagem de erro abaixo do campo
    const renderError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            return <span style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '-10px', display: 'block', marginBottom: '10px' }}>{fieldErrors[fieldName]}</span>;
        }
        return null;
    };

    return (
        <form className={styles.form_container} onSubmit={submit}>
            <div className={styles.form_header}>
                <h2>{isEditMode ? "Editar Questão" : "Nova Questão"}</h2>
                <p>Preencha os dados abaixo para cadastrar a questão no banco de dados.</p>
            </div>

            {/* SEÇÃO 1: IDENTIFICAÇÃO */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsPersonBadge /> <span>Identificação</span>
                </div>
                <div className={styles.grid_row}>
                    <div style={{width: '100%'}}>
                        <Input
                            type="text" text="Título da Questão" name="name"
                            placeholder="Ex: Teorema de Pitágoras #01"
                            value={project.name} handleOnChange={handleChange}
                        />
                        {renderError('name')}
                    </div>
                    <div style={{width: '100%'}}>
                        <Input
                            type="text" text="Nome do Professor" name="professorName"
                            placeholder="Nome completo"
                            value={project.professorName} handleOnChange={handleChange}
                        />
                        {renderError('professorName')}
                    </div>
                </div>
            </section>

            {/* SEÇÃO 2: DADOS PEDAGÓGICOS */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsBook /> <span>Dados Pedagógicos BNCC</span>
                </div>
                <div className={styles.grid_row_3}>
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%'  }}>
                        <label className={styles.label} style={{marginBottom:'16px' }}>Série/Ano:</label>
                        <select
                            name="serieAno"
                            className={styles.native_select || styles.input}
                            value={project.serieAno}
                            onChange={handleChange}
                            style={{ padding: '0.9em', borderRadius: '8px', }}
                        >
                            <option value="">Selecione o Ano...</option>
                            {opcoesAno.map((opcao) => (
                                <option key={opcao.value} value={opcao.value}>
                                    {opcao.label}
                                </option>
                            ))}
                        </select>
                        {renderError('serieAno')}
                    </div>

                    <Input
                        type="text" text="Nível da Fase ou Categoria" name="phaseLevel"
                        placeholder="Insira o nível" value={project.phaseLevel}
                        handleOnChange={handleChange}
                    />
                </div>

                <div className={styles.grid_row}>
                    <div style={{width: '100%'}}>
                        <Input
                            type="number" text="Grau de Dificuldade (1-5)" name="difficultyLevel"
                            placeholder="1 a 5" value={project.difficultyLevel}
                            handleOnChange={handleDifficultyChange}
                        />
                        {renderError('difficultyLevel')}
                    </div>
                </div>

                <div className={styles.grid_row}>
                    {/* Objetos do Conhecimento */}
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label}>Objetos do Conhecimento:</label>
                        <select
                            name="knowledgeObjects"
                            className={styles.native_select || styles.input}
                            value={project.knowledgeObjects}
                            onChange={handleChange}
                            style={{ padding: '.7em', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                        >
                            <option value="">Selecione um Objeto...</option>
                            {!project.serieAno ? (
                                <option value="" disabled>Preencha a Série/Ano acima primeiro</option>
                            ) : (
                                knowledgeOptionsList.map((opt, index) => (
                                    <option key={index} value={opt}>{opt}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Tema BNCC */}
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label}>Tema BNCC:</label>
                        <select 
                            className={styles.native_select || styles.input}
                            value={project.bnccTheme}
                            name="bnccTheme"
                            onChange={handleChange}
                            style={{ padding: '.7em', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
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
                    </div>
                </div>

                <div className={styles.grid_row_auto}>
                    <div className={styles.input_group_icon}>
                        <Input
                            type="text" text="Cód. Habilidade" name="abilityCode"
                            placeholder="Ex: EF05MA12" value={project.abilityCode}
                            handleOnChange={handleChange}
                        />
                        <span className={styles.icon_tooltip} title="Consulte a BNCC"><BsFillInfoCircleFill /></span>
                    </div>
                    <Input
                        type="text" text="Descrição da Habilidade" name="abilityDescription"
                        placeholder="Descrição completa" value={project.abilityDescription}
                        handleOnChange={handleChange}
                    />
                </div>
            </section>

            {/* SEÇÃO 3: CONTEÚDO LATEX */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsCardText /> <span>Elaboração da Questão (LaTeX)</span>
                </div>
                <div className={styles.latex_tip}>
                    💡 Dica: Você pode usar fórmulas matemáticas em LaTeX. Para fórmulas inline, use <code>\(...\)</code> e para fórmulas em bloco, use <code>\[...\]</code>.
                <br/>Exemplo: A área do círculo é <code>\(\pi r^2\)</code>
                </div>
                
                {/* 1. ENUNCIADO COM PREVIEW */}
                <div className={styles.editor_block}>
                    <Input
                        type="text" text="Enunciado" name="questionStatement"
                        placeholder="Digite o enunciado..." value={project.questionStatement}
                        handleOnChange={handleChange}
                    />
                    {renderError('questionStatement')}
                    {project.questionStatement && (
                        <div className={styles.preview_box}>
                            <strong>Pré-visualização:</strong>
                            <LatexText content={project.questionStatement} />
                        </div>
                    )}
                </div>

                <div className={styles.upload_area}>
                     <label>Imagem (Opcional)</label>
                     <ImageUploader />
                </div>

                {/* 2. ALTERNATIVAS COM PREVIEW (ATUALIZADO) */}
                <div className={styles.editor_block}>
                    <label style={{fontWeight:'bold', marginBottom:'10px', display:'block'}}>Apresente 5 Alternativas:</label>
                    
                    {/* Iteramos sobre as chaves A, B, C, D, E para gerar os campos com preview automaticamente */}
                    {['A', 'B', 'C', 'D', 'E'].map((altKey) => (
                        <div key={altKey} style={{ marginBottom: '15px' }}>
                            <Input 
                                type="text" 
                                text={`${altKey})`} 
                                name={altKey} 
                                value={alts[altKey]} 
                                handleOnChange={handleAltChange} 
                                placeholder={`Alternativa ${altKey}`} 
                            />
                            
                            {/* Bloco de pré-visualização da Alternativa (Se houver texto) */}
                            {alts[altKey] && (
                                <div className={styles.preview_box} style={{ marginTop: '5px' }}>
                                    <strong>Pré-visualização ({altKey}):</strong>
                                    <LatexText content={alts[altKey]} />
                                </div>
                            )}
                        </div>
                    ))}
                    {renderError('alternatives')}
                </div>

                <div className={styles.grid_row}>
                     <Input
                        type="text" text="Alternativa Correta (Ex: A)" name="correctAlternative"
                        placeholder="Ex: A" value={project.correctAlternative}
                        handleOnChange={handleChange}
                    />
                </div>

                {/* 3. RESOLUÇÃO COM PREVIEW */}
                <div className={styles.editor_block}>
                    <Input
                        type="text" text="Resolução Detalhada" name="detailedResolution"
                        placeholder="Explicação passo a passo..." value={project.detailedResolution}
                        handleOnChange={handleChange}
                    />
                     {project.detailedResolution && (
                        <div className={styles.preview_box}>
                            <strong>Pré-visualização:</strong>
                            <LatexText content={project.detailedResolution} />
                        </div>
                    )}
                </div>
            </section>

            {/* SEÇÃO 4: STATUS E REVISÃO (Visível apenas para roles permitidos) */}
            {isEditMode && canEditComments && (
                <section className={`${styles.form_section} ${styles.admin_section}`}>
                    <div className={styles.section_title}>Revisão e Status</div>
                    
                    <div style={{width: '100%'}}>
                        <Select 
                            text="Situação da Questão"
                            name="categoryId" 
                            options={categories}
                            value={project.categoryId}
                            handleOnChange={handleChange}
                        />
                        {renderError('categoryId')}
                    </div>

                    <div className={styles.editor_block}>
                        <label>Comentários do Revisor:</label>
                        <textarea
                            name="reviewerComments"
                            value={project.reviewerComments}
                            onChange={handleChange}
                            placeholder="Digite as correções necessárias..."
                            className={styles.custom_textarea}
                            style={{ width: '100%', minHeight: '80px', marginTop: '5px' }}
                        />
                    </div>
                </section>
            )}
            
            <div className={styles.form_footer}>
                {formError && (
                    <div className={styles.error_msg} style={{
                        color: '#d9534f', backgroundColor: '#f9d6d5', padding: '10px', 
                        borderRadius: '5px', marginBottom: '10px', border: '1px solid #d9534f'
                    }}>
                        {formError}
                    </div>
                )}
                <SubmitButton text={isSubmitting ? "Enviando..." : btnText} />
            </div>
        </form>
    );
}

ProjectForme.propTypes = {
    btnText: PropTypes.string.isRequired,
    projectData: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
};

export default ProjectForme;