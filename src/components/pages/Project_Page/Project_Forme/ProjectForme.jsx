import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Input from '../../../form/Input.jsx';
import Select from '../../../form/Select.jsx';
import SubmitButton from '../../../form/SubmitButton.jsx';
import ImageUploader from '../../../form/ImageUploader.jsx';
import LatexText from './../Components_project/LatexText.jsx';
import { BsFillInfoCircleFill, BsCardText, BsPersonBadge, BsBook } from 'react-icons/bs';
import styles from './ProjectForme.module.css';

import api from '../../../../services/api.js';

function ProjectForme({ handleSubmit, projectData, btnText }) {
    const location = useLocation();
    const isEditMode = location.pathname.includes('/projetos/') || !!projectData?.id;

    // --- LISTA DE OPÇÕES PARA SÉRIE/ANO (fallback enquanto carrega) ---
    const opcoesAno = [
        { value: '2º Fundamental', label: '2º Fundamental' },
        { value: '3º Fundamental', label: '3º Fundamental' },
        { value: '4º Fundamental', label: '4º Fundamental' },
        { value: '5º Fundamental', label: '5º Fundamental' },
        { value: '6º Fundamental', label: '6º Fundamental' },
        { value: '7º Fundamental', label: '7º Fundamental' },
        { value: '8º Fundamental', label: '8º Fundamental' },
        { value: '9º Fundamental', label: '9º Fundamental' },
        { value: '1º Médio', label: '1º Médio' },
        { value: '2º Médio', label: '2º Médio' },
        { value: '3º Médio', label: '3º Médio' },
    ];

    // --- 1. LÓGICA DE PERMISSÃO (ROLE) ---
    const [currentUserRole, setCurrentUserRole] = useState("");
    useEffect(() => {
        const storedData = localStorage.getItem("user_token");
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (parsedData.user?.role) {
                    setCurrentUserRole(parsedData.user.role);
                }
            } catch (error) {
                console.error("Erro ao verificar permissões:", error);
            }
        }
    }, []);
    const allowedRoles = ['ADMIN', 'REVISOR', 'PROFESSOR'];
    const canEditComments = currentUserRole && allowedRoles.includes(currentUserRole.toUpperCase());

    // --- 2. ESTADO DO FORMULÁRIO ---
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
        reviewerComments: "",
        image: null,
    });

    const [alts, setAlts] = useState({ A: "", B: "", C: "", D: "", E: "" });
    const [categories, setCategories] = useState([]);
    const [graus, setGraus] = useState([]);
    const [loadingGraus, setLoadingGraus] = useState(true);
    const [knowledgeOptionsList, setKnowledgeOptionsList] = useState([]);
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 3. CARREGAR DADOS DO BACKEND ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const catsRes = await api.get('/api/v1/categories/');
                setCategories(catsRes.data?.data?.categories || []);
                const grausRes = await api.get('/api/v1/graus/');
                setGraus(grausRes.data?.data?.graus || []);
            } catch (err) {
                console.error("Erro ao carregar opções:", err);
                setFormError("Erro ao carregar dados do servidor.");
            } finally {
                setLoadingGraus(false);
            }
        };
        fetchData();
    }, []);

    // Preencher formulário em modo de edição
    useEffect(() => {
        if (projectData && Object.keys(projectData).length > 0) {
            setProject((prev) => ({
                ...prev,
                ...projectData,
                serieAno: projectData.grauId ? String(projectData.grauId) : "",
                categoryId: projectData.categoryId ? Number(projectData.categoryId) : "",
                reviewerComments: projectData.reviewerComments || ""
            }));

            if (projectData.alternatives) {
                const lines = projectData.alternatives.split('\n');
                const altObj = {};
                lines.forEach(line => {
                    const match = line.match(/^([a-e])\)\s*(.*)$/i);
                    if (match) {
                        altObj[match[1].toUpperCase()] = match[2].trim();
                    }
                });
                if (Object.keys(altObj).length === 5) {
                    setAlts(altObj);
                } else {
                    console.log("Formato de alternativas não reconhecido.");
                }
            }
        }
    }, [projectData]);

    // --- 4. LÓGICA DINÂMICA: OBJETOS DO CONHECIMENTO ---
    useEffect(() => {
        if (project.serieAno) {
            let mockOptions = [];
            if (['1','2','3','4','5'].includes(String(project.serieAno))) {
                mockOptions = ["Números Naturais", "Geometria Básica", "Medidas de Tempo"];
            } else {
                mockOptions = ["Álgebra Linear", "Funções", "Geometria Analítica", "Probabilidade"];
            }
            setKnowledgeOptionsList(mockOptions);
        } else {
            setKnowledgeOptionsList([]);
        }
    }, [project.serieAno]);

    // --- 5. HANDLERS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
        if (formError) setFormError("");
    };

    const handleAltChange = (e) => {
        const { name, value } = e.target;
        setAlts((prev) => ({ ...prev, [name]: value }));
    };

    const handleDifficultyChange = (e) => {
        const val = e.target.value;
        if (val === "" || (!isNaN(val) && Number(val) >= 1 && Number(val) <= 5)) {
            handleChange(e);
        }
    };

    const handleImageProcessed = (processedImage) => {
        setProject(prev => ({ ...prev, image: processedImage }));
        console.log('handleImageProcessed:', processedImage);
    };

    const handleImageRemoved = () => {
        setProject(prev => ({ ...prev, image: null }));
    };

    // --- 6. ENVIO DO FORMULÁRIO ---
    const submit = async (e) => {
        e.preventDefault();
        console.log('project.image antes do submit:', project.image);

        // ========== VALIDAÇÕES ==========
        const errors = {};

        if (!project.name?.trim()) errors.name = "O título da questão é obrigatório.";
        if (!project.professorName?.trim()) errors.professorName = "O nome do professor é obrigatório.";
        if (!project.serieAno) errors.serieAno = "Selecione a série/ano.";
        if (!project.difficultyLevel) errors.difficultyLevel = "Defina a dificuldade.";
        if (!project.questionStatement?.trim()) errors.questionStatement = "O enunciado da questão é obrigatório.";
        if (!alts.A || !alts.B || !alts.C || !alts.D || !alts.E) {
            errors.alternatives = "Preencha todas as 5 alternativas (A-E).";
        }
        if (!project.phaseLevel?.trim()) errors.phaseLevel = "Nível da fase é obrigatório.";
        if (!project.knowledgeObjects?.trim()) errors.knowledgeObjects = "Objetos do conhecimento é obrigatório.";
        if (!project.abilityDescription?.trim()) errors.abilityDescription = "Descrição da habilidade é obrigatória.";
        if (!project.detailedResolution?.trim()) errors.detailedResolution = "Resolução detalhada é obrigatória.";
        const validLetters = ['a', 'b', 'c', 'd', 'e'];
        if (!project.correctAlternative || !validLetters.includes(project.correctAlternative.toLowerCase())) {
            errors.correctAlternative = "Alternativa correta deve ser uma letra de A a E.";
        }
        if (isEditMode && canEditComments && !project.categoryId) {
            errors.categoryId = "Defina a situação da questão.";
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setFormError("Existem campos obrigatórios não preenchidos ou inválidos.");
            return;
        }

        setIsSubmitting(true);

        // Converte alternativas para string no formato "a) texto\nb) texto..."
        const alternativesText = Object.entries(alts)
            .map(([key, value]) => `${key.toLowerCase()}) ${value}`)
            .join('\n');

        // Encontra o nome do grau correspondente ao ID selecionado
        const selectedGrau = graus.find(g => g.id === Number(project.serieAno));
        const grauName = selectedGrau?.name || '';

        // Monta objeto com os dados do formulário
        const dados = {
            ...project,
            grauId: project.serieAno,          // ID do grau
            grauName,                           // Nome do grau
            alternatives: alternativesText,
        };

        // Se for criação e houver imagem, força papel LARGE
        if (!isEditMode && dados.image) {
            dados.image = { ...dados.image, role: 'LARGE' };
        }

        try {
            await handleSubmit(dados);
            setFormError("");
            if (!isEditMode) {
                setProject({
                    name: "", professorName: "", phaseLevel: "", serieAno: "",
                    difficultyLevel: "", knowledgeObjects: "", bnccTheme: "",
                    abilityCode: "", abilityDescription: "", questionStatement: "",
                    correctAlternative: "", detailedResolution: "",
                    categoryId: "1", reviewerComments: "", image: null
                });
                setAlts({ A: "", B: "", C: "", D: "", E: "" });
            }
        } catch (error) {
            console.error('Erro detalhado:', error.response?.data);
            setFormError("Erro ao salvar a questão. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            return <span style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '-10px', display: 'block', marginBottom: '10px' }}>{fieldErrors[fieldName]}</span>;
        }
        return null;
    };

    return (
        <form className={styles.form_container} onSubmit={submit}>
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
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label} style={{ marginBottom: '16px' }}>Série/Ano:</label>
                        <select
                            name="serieAno"
                            className={styles.native_select || styles.input}
                            value={project.serieAno}
                            onChange={handleChange}
                            style={{ padding: '0.9em', borderRadius: '8px' }}
                        >
                            <option value="">Selecione o Ano...</option>
                            {loadingGraus ? (
                                opcoesAno.map((opcao) => (
                                    <option key={opcao.value} value={opcao.value}>
                                        {opcao.label}
                                    </option>
                                ))
                            ) : (
                                graus.map((grau) => (
                                    <option key={grau.id} value={grau.id}>
                                        {grau.name}
                                    </option>
                                ))
                            )}
                        </select>
                        {renderError('serieAno')}
                    </div>

                    <Input
                        type="text" text="Nível da Fase ou Categoria" name="phaseLevel"
                        placeholder="Insira o nível" value={project.phaseLevel}
                        handleOnChange={handleChange}
                    />
                    <div>
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
                        {renderError('knowledgeObjects')}
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
                    {renderError('abilityDescription')}
                </div>
            </section>

            {/* SEÇÃO 3: CONTEÚDO LATEX */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsCardText /> <span>Elaboração da Questão (LaTeX)</span>
                </div>
                <div className={styles.latex_tip}>
                    💡 Dica: Você pode usar fórmulas matemáticas em LaTeX. Para fórmulas inline, use <code>\(...\)</code> e para fórmulas em bloco, use <code>\[...\]</code>.
                    <br />Exemplo: A área do círculo é <code>\(\pi r^2\)</code>
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
                    <label>Imagem da Questão (Opcional)</label>
                    <ImageUploader
                        onImageProcessed={handleImageProcessed}
                        onImageRemoved={handleImageRemoved}
                        initialImage={project.image}
                        disabled={isSubmitting}
                        questionStatement={project.questionStatement}
                        alts={alts}
                        correctAlternative={project.correctAlternative}
                    />
                    {project.image && (
                        <div className={styles.imageSummary}>
                            <strong>✓ Imagem anexada:</strong> {project.image.filename} (Papel: {project.image.role})
                        </div>
                    )}
                </div>

                {/* 2. ALTERNATIVAS COM PREVIEW */}
                <div className={styles.editor_block}>
                    <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Apresente 5 Alternativas:</label>
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
                    {renderError('correctAlternative')}
                </div>

                {/* 3. RESOLUÇÃO COM PREVIEW */}
                <div className={styles.editor_block}>
                    <Input
                        type="text" text="Resolução Detalhada" name="detailedResolution"
                        placeholder="Explicação passo a passo..." value={project.detailedResolution}
                        handleOnChange={handleChange}
                    />
                    {renderError('detailedResolution')}
                    {project.detailedResolution && (
                        <div className={styles.preview_box}>
                            <strong>Pré-visualização:</strong>
                            <LatexText content={project.detailedResolution} />
                        </div>
                    )}
                </div>
            </section>

            {/* SEÇÃO 4: STATUS E REVISÃO */}
            {isEditMode && canEditComments && (
                <section className={`${styles.form_section} ${styles.admin_section}`}>
                    <div className={styles.section_title}>Revisão e Status</div>
                    <div style={{ width: '100%' }}>
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