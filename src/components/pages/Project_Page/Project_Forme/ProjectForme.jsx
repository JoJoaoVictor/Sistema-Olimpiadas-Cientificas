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
import { getTemasByGrauId, getObjetosByTema, getHabilidadesByObjeto, getDescricaoByCodigoHabilidade } from '../../../../data/bnccHelper.js';

function ProjectForme({ handleSubmit, projectData, btnText }) {
    const location = useLocation();
    const isEditMode = location.pathname.includes('/projetos/') || !!projectData?.id;

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

    const handleChange = (e) => {
        setProject({ ...project, [e.target.name]: e.target.value });
    };
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
    const [formError, setFormError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- CASCATA BNCC ---
    const [temasList, setTemasList] = useState([]);
    const [objetosList, setObjetosList] = useState([]);
    const [habilidadesList, setHabilidadesList] = useState([]);

    // --- 3. CARREGAR DADOS DO BACKEND ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const catsRes = await api.get('/api/v1/categories/');
                let fetchedCategories = catsRes.data?.data?.categories || [];

                const nomesOficiais = {
                    1: "Pendentes (Revisão)",
                    2: "Aprovadas (Banco)",
                    3: "Aplicadas (Em Prova)"
                };

                fetchedCategories = fetchedCategories
                    .filter(cat => [1, 2, 3].includes(cat.id)) // Corta qualquer ID duplicado (4, 5, etc)
                    .map(cat => ({
                        ...cat,
                        name: nomesOficiais[cat.id] || cat.name // Força o nome correto para não haver confusão
                    }));

                setCategories(fetchedCategories);
                
                const grausRes = await api.get('/api/v1/graus/');
                const grausData = grausRes.data?.data?.graus || [];
                setGraus(grausData);
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

    // --- 4. LÓGICA CASCATA: ATUALIZAR TEMAS QUANDO SÉRIE/ANO MUDA ---
    useEffect(() => {
        if (project.serieAno) {
            const grauId = Number(project.serieAno);
            
            // 1. Pega os temas originais do MEC
            const temasMEC = getTemasByGrauId(grauId);
            
            // 2. Pega os temas customizados do cache local
            const customBNCC = JSON.parse(localStorage.getItem('customBNCC') || '[]');
            const temasCustom = customBNCC
                .filter(item => item.grauId === grauId)
                .map(item => item.unidadeTematica);

            // 3. Junta tudo e remove nomes duplicados (usando Set)
            setTemasList([...new Set([...temasMEC, ...temasCustom])]);
            setObjetosList([]);
            setHabilidadesList([]);
        } else {
            setTemasList([]);
            setObjetosList([]);
            setHabilidadesList([]);
        }
    }, [project.serieAno]);

    // --- 5. LÓGICA CASCATA: ATUALIZAR OBJETOS QUANDO TEMA MUDA ---
    useEffect(() => {
        if (project.serieAno && project.bnccTheme) {
            const grauId = Number(project.serieAno);
            
            const objetosMEC = getObjetosByTema(grauId, project.bnccTheme);
            
            const customBNCC = JSON.parse(localStorage.getItem('customBNCC') || '[]');
            const objetosCustom = customBNCC
                .filter(item => item.grauId === grauId && item.unidadeTematica === project.bnccTheme)
                .map(item => item.objetosDeConhecimento);

            setObjetosList([...new Set([...objetosMEC, ...objetosCustom])]);
            setHabilidadesList([]);
        } else {
            setObjetosList([]);
            setHabilidadesList([]);
        }
    }, [project.serieAno, project.bnccTheme]);

    // --- 6. LÓGICA CASCATA: ATUALIZAR HABILIDADES QUANDO OBJETO MUDA ---
    useEffect(() => {
        if (project.serieAno && project.bnccTheme && project.knowledgeObjects) {
            const grauId = Number(project.serieAno);
            
            const habsMEC = getHabilidadesByObjeto(grauId, project.bnccTheme, project.knowledgeObjects);
            
            const customBNCC = JSON.parse(localStorage.getItem('customBNCC') || '[]');
            const habsCustom = customBNCC
                .filter(item => 
                    item.grauId === grauId && 
                    item.unidadeTematica === project.bnccTheme && 
                    item.objetosDeConhecimento === project.knowledgeObjects
                )
                .map(item => ({ codigo: item.habilidade, descricao: item.abilityDescription }));

            // Junta as habilidades do MEC com as customizadas
            const todasHabs = [...habsMEC, ...habsCustom];
            
            // Remove códigos de habilidade duplicados (caso exista algum conflito)
            const habsUnicas = Array.from(new Map(todasHabs.map(h => [h.codigo, h])).values());

            setHabilidadesList(habsUnicas);
        } else {
            setHabilidadesList([]);
        }
    }, [project.serieAno, project.bnccTheme, project.knowledgeObjects]);

    const handleSelectHabilidade = (e) => {
        const codigoSelecionado = e.target.value;
        const habilidadorSelecionada = habilidadesList.find(h => h.codigo === codigoSelecionado);
        if (habilidadorSelecionada) {
            setProject(prev => ({
                ...prev,
                abilityCode: habilidadorSelecionada.codigo,
                abilityDescription: habilidadorSelecionada.descricao
            }));
        } else {
            setProject(prev => ({
                ...prev,
                abilityCode: "",
                abilityDescription: ""
            }));
        }
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

    // --- 8. ENVIO DO FORMULÁRIO ---
    const submit = async (e) => {
        e.preventDefault();
        console.log('project.image antes do submit:', project.image);

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
            errors.correctAlternative = "Selecione a alternativa correta (A a E).";
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

        const alternativesText = Object.entries(alts)
            .map(([key, value]) => `${key.toLowerCase()}) ${value}`)
            .join('\n');

        const selectedGrau = graus.find(g => g.id === Number(project.serieAno));
        const grauName = selectedGrau?.name || '';

        const dados = {
            ...project,
            grauId: project.serieAno,
            grauName,
            alternatives: alternativesText,
        };

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
            return (
                <span style={{
                    color: '#e74c3c', fontSize: '0.85rem',
                    marginTop: '-10px', display: 'block', marginBottom: '10px'
                }}>
                    {fieldErrors[fieldName]}
                </span>
            );
        }
        return null;
    };

    return (
        <form className={styles.form_container} onSubmit={submit}>

            {/* ── SEÇÃO 1: IDENTIFICAÇÃO ─────────────────────────────────── */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsPersonBadge /> <span>Identificação</span>
                </div>
                <div className={styles.grid_row}>
                    <div style={{ width: '100%' }}>
                        <Input
                            type="text" text="Título da Questão" name="name"
                            placeholder="Ex: Teorema de Pitágoras_2024"
                            value={project.name} handleOnChange={handleChange}
                        />
                        {renderError('name')}
                    </div>
                    <div style={{ width: '100%' }}>
                        <Input
                            type="text" text="Nome do Professor" name="professorName"
                            placeholder="Nome completo"
                            value={project.professorName} handleOnChange={handleChange}
                        />
                        {renderError('professorName')}
                    </div>
                </div>
            </section>

            {/* ── SEÇÃO 2: DADOS PEDAGÓGICOS BNCC ───────────────────────── */}
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
                                    <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                                ))
                            ) : (
                                graus.map((grau) => (
                                    <option key={grau.id} value={grau.id}>{grau.name}</option>
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

                {/* CASCATA BNCC */}
                <div className={styles.grid_row_2}>
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label}>Tema BNCC (Unidade Temática):</label>
                        <select
                            className={styles.native_select || styles.input}
                            value={project.bnccTheme}
                            name="bnccTheme"
                            onChange={handleChange}
                            disabled={!project.serieAno}
                            style={{ padding: '.7em', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                        >
                            <option value="">
                                {!project.serieAno ? 'Selecione o ano primeiro' : 'Selecione um Tema...'}
                            </option>
                            {temasList.map((tema, index) => (
                                <option key={index} value={tema}>{tema}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label}>Objeto do Conhecimento:</label>
                        <select
                            name="knowledgeObjects"
                            className={styles.native_select || styles.input}
                            value={project.knowledgeObjects}
                            onChange={handleChange}
                            disabled={!project.bnccTheme}
                            style={{ padding: '.7em', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                        >
                            <option value="">
                                {!project.bnccTheme ? 'Selecione o tema primeiro' : 'Selecione um Objeto...'}
                            </option>
                            {objetosList.map((objeto, index) => (
                                <option key={index} value={objeto}>{objeto}</option>
                            ))}
                        </select>
                        {renderError('knowledgeObjects')}
                    </div>
                </div>

                {/* Habilidade BNCC */}
                <div className={styles.grid_row}>
                    <div className={styles.input_group} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label className={styles.label}>Habilidade BNCC:</label>
                        <select
                            className={styles.native_select || styles.input}
                            value={project.abilityCode}
                            onChange={handleSelectHabilidade}
                            disabled={!project.knowledgeObjects}
                            style={{ padding: '.7em', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                        >
                            <option value="">
                                {!project.knowledgeObjects ? 'Selecione o objeto primeiro' : 'Selecione uma Habilidade...'}
                            </option>
                            {habilidadesList.map((hab, index) => (
                                <option key={index} value={hab.codigo}>{hab.codigo}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Código e Descrição */}
                <div className={styles.grid_row_auto}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label style={{ marginBottom: '.5em', fontWeight: 'bold', color: '#333' }}>
                            Descrição da Habilidade:
                        </label>
                        <textarea
                            name="abilityDescription"
                            value={project.abilityDescription || ''}
                            onChange={handleChange}
                            placeholder="Preenchida automaticamente ou edite manualmente"
                            className={styles.custom_textarea}
                            style={{ 
                                width: '100%', 
                                minHeight: '120px', 
                                padding: '10px', 
                                borderRadius: '5px', 
                                border: '1px solid #ccc',
                                fontFamily: 'inherit',
                                resize: 'vertical' /* Permite que o usuário estique a caixa para baixo se o texto for muito grande */
                            }}
                        />
                    </div>
                    {renderError('abilityDescription')}
                </div>
            </section>

            {/* ── SEÇÃO 3: ELABORAÇÃO DA QUESTÃO ────────────────────────── */}
            <section className={styles.form_section}>
                <div className={styles.section_title}>
                    <BsCardText /> <span>Elaboração da Questão (LaTeX)</span>
                </div>

                <div className={styles.latex_tip}>
                    💡 Dica: Você pode usar fórmulas matemáticas em LaTeX. Para fórmulas inline, use <code>\(...\)</code> e para fórmulas em bloco, use <code>\[...\]</code>.
                    <br />Exemplo: A área do círculo é <code>\(\pi r^2\)</code>
                </div>

                {/* ENUNCIADO */}
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

                {/* IMAGEM */}
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

                {/* ── ALTERNATIVAS (redesenhado) ─────────────────────────── */}
                <div className={styles.editor_block}>
                    <div className={styles.alt_section_header}>
                        <span className={styles.alt_section_title}>Alternativas</span>
                        <span className={styles.alt_section_hint}>
                            Preencha as 5 opções. Marque a correta no seletor abaixo.
                        </span>
                    </div>

                    <div className={styles.alt_grid}>
                        {['A', 'B', 'C', 'D', 'E'].map((altKey) => {
                            const isCorreta = project.correctAlternative?.toUpperCase() === altKey;
                            return (
                                <div
                                    key={altKey}
                                    className={`${styles.alt_card} ${isCorreta ? styles.alt_card_correct : ''}`}
                                >
                                    <div className={styles.alt_badge_row}>
                                        <span className={`${styles.alt_badge} ${isCorreta ? styles.alt_badge_correct : ''}`}>
                                            {altKey}
                                        </span>
                                        {isCorreta && (
                                            <span className={styles.alt_correct_tag}>✓ Correta</span>
                                        )}
                                    </div>
                                    <Input
                                        type="text"
                                        text=" "
                                        name={altKey}
                                        value={alts[altKey]}
                                        handleOnChange={handleAltChange}
                                        placeholder={`Digite a alternativa ${altKey}...`}
                                    />
                                    {alts[altKey] && (
                                        <div className={styles.alt_preview}>
                                            <LatexText content={alts[altKey]} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {renderError('alternatives')}
                </div>

                {/* ── SELETOR ALTERNATIVA CORRETA (redesenhado) ─────────── */}
                <div className={styles.correct_alt_block}>
                    <label className={styles.correct_alt_label}>Alternativa correta</label>
                    <p className={styles.correct_alt_hint}>
                        Selecione a letra que corresponde à resposta correta.
                    </p>
                    <div className={styles.correct_alt_selector}>
                        {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                            <button
                                key={letra}
                                type="button"
                                className={`${styles.correct_alt_btn} ${
                                    project.correctAlternative?.toUpperCase() === letra
                                        ? styles.correct_alt_btn_active
                                        : ''
                                }`}
                                onClick={() =>
                                    handleChange({
                                        target: { name: 'correctAlternative', value: letra.toLowerCase() }
                                    })
                                }
                            >
                                {letra}
                            </button>
                        ))}
                    </div>
                    {renderError('correctAlternative')}
                </div>

                {/* ── RESOLUÇÃO (redesenhado) ───────────────────────────── */}
                <div className={`${styles.editor_block} ${styles.resolution_block}`}>
                    <div className={styles.resolution_header}>
                        <span className={styles.resolution_title}>Resolução detalhada</span>
                        <span className={styles.resolution_hint}>
                            Explique o raciocínio passo a passo.
                        </span>
                    </div>
                    <Input
                        type="text"
                        text=" "
                        name="detailedResolution"
                        placeholder="Ex: Aplicando o teorema de Pitágoras, temos que..."
                        value={project.detailedResolution}
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

            {/* ── SEÇÃO 4: STATUS E REVISÃO ──────────────────────────────── */}
            {isEditMode && canEditComments && (
                <section className={`${styles.form_section} ${styles.admin_section}`}>
                    <div className={styles.section_title}>Revisão e Status</div>
                    <BsPersonBadge />
                    <h3>Avaliação do Revisor</h3>
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
                    {/* Se for apenas visualização de erro/status para o usuário comum */}
                    <div className={styles.review_preview}>
                        <label>Comentários do Revisor (Visualização):</label>
                        <div className={styles.preview_box}>
                            <LatexText content={project.reviewerComments} />
                        </div>
                    </div>
                </section>
            )}

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
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