import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import Input from '../../../form/Input.jsx';
import Select from '../../../form/Select.jsx';
import styles from './ProjectForme.module.css';
import SubmitButton from '../../../form/SubmitButton.jsx';
import ImageUploader from '../../../form/ImageUploader.jsx';
import LatexText from './../Components_project/LatexText.jsx' // Importa o componente LatexText
import { BsFillInfoCircleFill } from 'react-icons/bs';

function ProjectForme({ handleSubmit,projectData, btnText }) {
    // Definindo os estados para cada campo do formulário
    const [name, setName] = useState(""); // Nome do projeto
    const [professorName, setProfessorName] = useState(""); // Nome do professor
    const [phaseLevel, setPhaseLevel] = useState(""); // Nível da fase
    const [serieAno, setSerieAno] = useState(""); // Série/Ano escolar q as questões se referem
    const location = useLocation(); // Captura a URL atual
    const [difficultyLevel, setDifficultyLevel] = useState(""); // Nível de dificuldade
    const [knowledgeObjects, setKnowledgeObjects] = useState(""); // Objetos do conhecimento
    const [bnccTheme, setBnccTheme] = useState(""); // Tema da BNCC
    const [abilityCode, setAbilityCode] = useState(""); // Código da habilidade
    const [abilityDescription, setAbilityDescription] = useState(""); // Descrição da habilidade
    const [questionStatement, setQuestionStatement] = useState(""); // Enunciado da questão
    const [alternatives, setAlternatives] = useState(""); // Alternativas da questão
    const [correctAlternative, setCorrectAlternative] = useState(""); // Alternativa correta
    const [detailedResolution, setDetailedResolution] = useState(""); // Resolução detalhada
    // Estado para a categoria selecionada
    const [categoryId, setCategoryId] = useState(1); 
    const [grauId, setGrauId] = useState(""); // ID do grau escolar

    // Estado para mensagens de erro específicas 
    const [error, setError] = useState("");

    // Estado para mensagens de erro gerais (ex: campos não preenchidos)
    const [formError, setFormError] = useState("");

    // Estado para armazenar as categorias e graus de nivel escolar carregadas da API
    const [categoris, setCategoris] = useState([]);
    const [grauOptions, setGrauOptions] = useState([]);

    // Verifica se está no modo de edição
    const isEditMode = location.pathname.includes('/projetos/'); 

    // useEffect para carregar as categorias da API ao montar o componente
    useEffect(() => {
        // Este useEffect executa duas operações principais:
        // 1. Inicializa os campos do formulário quando projectData está disponível (para edição)
        // 2. Carrega a lista de categorias da API
        // ==============================================
        //  INICIALIZAÇÃO DOS CAMPOS DO FORMULÁRIO
        // ==============================================
        if (projectData) {
            // Se projectData existe (modo de edição), preenche os campos do formulário
            // com os valores existentes. O operador || "" fornece um fallback vazio
            // caso algum campo não exista no projectData
            setName(projectData.name || "");                                // Nome da questão
            setProfessorName(projectData.professorName || "");              // Nome do professor
            setPhaseLevel(projectData.phaseLevel || "");                    // Nível da fase
            setSerieAno(projectData.serieAno || "");                        // Série/Ano escolar
            setGrauId(String(projectData.grauId || ""));                    // Conversão para string Grau escolar
            setDifficultyLevel(projectData.difficultyLevel || "");          // Nível de dificuldade
            setKnowledgeObjects(projectData.knowledgeObjects || "");        // Objetos de conhecimento
            setBnccTheme(projectData.bnccTheme || "");                      // Tema da BNCC
            setAbilityCode(projectData.abilityCode || "");                  // Código da habilidade
            setAbilityDescription(projectData.abilityDescription || "");    // Descrição da habilidade
            setQuestionStatement(projectData.questionStatement || "");      // Enunciado
            setAlternatives(projectData.alternatives || "");                // Alternativas
            setCorrectAlternative(projectData.correctAlternative || "");    // Alternativa correta
            setDetailedResolution(projectData.detailedResolution || "");    // Resolução detalhada
            setCategoryId(projectData.categoryId || "");                    // ID da categoria
            
            // o operador || para garantir que sempre teremos uma string
            // mesmo que o campo não exista no projectData ou seja null/undefined
        }
    
        //  CARREGAMENTO DAS CATEGORIAS DA API
        // Faz uma requisição GET para obter a lista de categorias disponíveis
  // Carrega categorias
  fetch("http://localhost:5000/categoris")
    .then((resp) => resp.json())
    .then((data) => setCategoris(data))
    .catch((err) => console.error("Erro ao carregar categorias:", err));

  // Carrega graus
 fetch("http://localhost:5000/grau")
  .then((resp) => resp.json())
  .then((data) => setGrauOptions(data))
  .catch((err) => console.error("Erro ao carregar grau:", err));

}, [projectData]);
                      // Dependências do useEffect:
                      // - Executa novamente sempre que projectData mudar
                      // - Executa uma vez quando o componente é montado (projectData inicial é undefined)
    
    // Função para validar o nível de dificuldade
    const handleDifficultyChange = (e) => {
        const value = e.target.value;
        // Verifica se o valor é um número entre 1 e 5
        if (value === "" || (!isNaN(value) && Number(value) >= 1 && Number(value) <= 5)) {
            setDifficultyLevel(value); // Atualiza o estado do nível de dificuldade
            setError(""); // Limpa a mensagem de erro
        } else {
            setError("Nível de dificuldade deve ser entre 1 e 5"); // Exibe mensagem de erro
        }
    };

    // Função para lidar com o envio do formulário
    const submitForm = (e) => {
        e.preventDefault(); // Impede o comportamento padrão de recarregar a página
        // Verifica se todos os campos obrigatórios foram preenchidos
        if (
            !name ||
            !professorName ||
            !serieAno ||
            !grauId ||
            !phaseLevel ||
            !difficultyLevel ||
            !knowledgeObjects ||
            !bnccTheme ||
            !abilityCode ||
            !abilityDescription ||
            !questionStatement ||
            !correctAlternative ||
            !detailedResolution  ||
            !categoryId 
            
        ) {
            setFormError("Por favor, preencha todos os campos."); // Exibe mensagem de erro
            return; // Interrompe o envio do formulário
        }
        // Se todos os campos estiverem preenchidos, prossegue com o envio Cria o objeto do projeto
         // Busca o nome do grau baseado no ID selecionado
        const grauName = grauOptions.find(g => String(g.id) === String(grauId))?.name || 'Grau não encontrado';

        // Monta o objeto do projeto para envio
        const project = {
            name,
            professorName,
            serieAno,
            grauId: Number(grauId),
            grauName,
            phaseLevel,
            difficultyLevel: Number(difficultyLevel),
            knowledgeObjects,
            bnccTheme,
            abilityCode,
            abilityDescription,
            questionStatement,
            alternatives,
            correctAlternative,
            detailedResolution,
            categoryId: Number(categoryId),
            categoryName: categoris.find(cat => String(cat.id) === String(categoryId))?.name || "Sem categoria",
            createdAt: new Date().toISOString()
        };
        // Se estiver editando (projectData tem ID), faz PUT/PATCH
        if (projectData?.id) {
        // Chama a função handleSubmit passada como prop (que deve fazer a atualização)
        handleSubmit(project);
        return;
        }
        // Determina o endpoint com base na categoria selecionada depois de verificar se é edição ou criação
        // Exibe mensagem de carregamento
        // Criação do projeto
            setFormError("Enviando projeto...");
            fetch("http://localhost:5000/projects", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            })
            .then(resp => {
                if (!resp.ok) throw new Error(`Erro HTTP: ${resp.status}`);
                return resp.json();
            })
            .then(data => {
                console.log("Projeto enviado com sucesso:", data);
                alert(`Projeto "${name}" enviado com sucesso!`);
                setFormError("");
                // Limpa os campos do formulário após o envio
                setName("");
                setProfessorName("");
                setSerieAno("");
                setGrauId("");
                setPhaseLevel("");
                setDifficultyLevel("");
                setKnowledgeObjects("");
                setBnccTheme("");
                setAbilityCode("");
                setAbilityDescription("");
                setQuestionStatement("");
                setAlternatives("");
                setCorrectAlternative("");
                setDetailedResolution("");
                setCategoryId("");
            })
            .catch((err) => {   
                console.error("Erro ao enviar o projeto:", err);
                setFormError(`Erro ao enviar o projeto: ${err.message}. Tente novamente.`);
            });
    };

    return (
        // Renderiza o formulário do projeto
        <form className={styles.form} onSubmit={submitForm}>
            {/* Campo: Nome do Projeto */}
            <Input
                type="text"
                text="Titulo da Questão"
                name="name"
                placeholder="Insira o nome"
                value={name}
                handleOnChange={(e) => setName(e.target.value)}
            />
            {/* Seção 1: Identificação do Professor */}
            <b>1. Identificação do Professor</b>
            <Input
                type="text"
                text="Nome do Professor"
                name="professorName"
                placeholder="Insira o nome do Professor"
                value={professorName}
                handleOnChange={(e) => setProfessorName(e.target.value)}
            />
            {/* Seção 2: Identificação das Questões */}
            <b>2. Identificação das Questões: etapa de elaboração</b>
            <Input 
                type="text"
                text="Série/Ano escolar a que se referem a questão"
                name="serieAno"
                placeholder="4° ano, 5° ou 5 etc."
                value={serieAno}
                handleOnChange={(e) => setSerieAno(e.target.value)}
            />  
            <Select
                text="Informe o grau escolar Ano/Faixa"
                name="grau"
                options={grauOptions}
                value={grauId}
                handleOnChange={(e) => {
                       console.log("Grau selecionado:", e.target.value);
                    setGrauId(e.target.value);
                }}
            />
            <Input
                type="text"
                text="Nível da Fase"
                name="phaseLevel"
                placeholder="Insira o nível da fase"
                value={phaseLevel}
                handleOnChange={(e) => setPhaseLevel(e.target.value)}
            />
            <Input
                type="text"
                text="Nível de Dificuldade"
                name="difficultyLevel"
                placeholder="Insira o nível de dificuldade (1 a 5)"
                value={difficultyLevel}
                handleOnChange={handleDifficultyChange}
            />
            {error && <p style={{ color: "red" }}>{error}</p>} {/* Exibe erro de nível de dificuldade */}
          
            {/* Seção 3: BNCC */}
            <b>3. BNCC: principal habilidade que deve ser mobilizada pelo discente</b>
            <Input
                type="text"
                text="Tema da BNCC"
                name="bnccTheme"
                placeholder="Insira o tema / unidade temática"
                value={bnccTheme}
                handleOnChange={(e) => setBnccTheme(e.target.value)}
            />
              <Input
                type="text"
                text="Objetos do conhecimento envolvidos"
                name="knowledgeObjects"
                placeholder="Insira o texto"
                value={knowledgeObjects}
                handleOnChange={(e) => setKnowledgeObjects(e.target.value)}
            />
            
            <Input
                type="text"
                text="Código da habilidade"
                name="abilityCode"
                placeholder="Insira o código"
                value={abilityCode}
                handleOnChange={(e) => setAbilityCode(e.target.value)}
            /> <BsFillInfoCircleFill/>
            <Input
                type="text"
                text="Descrição da habilidade"
                name="abilityDescription"
                placeholder="Insira a descrição"
                value={abilityDescription}
                handleOnChange={(e) => setAbilityDescription(e.target.value)}
            />
            {/* Seção 4: Proposição da Habilidade */}
            <b>4. Proposição da habilidade</b>
            <p style={{ fontSize: '1rem', color: '#666',padding: '5px' }}>
                Você pode usar fórmulas matemáticas em LaTeX. Para fórmulas inline, use \(...\) e para fórmulas em bloco, use \[...\]. 
                <br/>Exemplo: A área do círculo é \(\pi r^2\).
                </p>
                  <Input
                    type="text"
                    text="Enunciado da questão (máximo de 50 palavras)"
                    name="questionStatement"
                    placeholder="Insira o texto"
                    value={questionStatement}
                    handleOnChange={(e) => setQuestionStatement(e.target.value)}
                />
                {/* Instrução e pré-visualização para o enunciado */}
                {questionStatement && (
                    <div>
                    <strong style={{padding:'5px'}}>Pré-visualização:</strong>
                    <LatexText content={questionStatement} />
                    </div>
                )}
                <br/>
            {/* Seção: Upload de Imagem */}
            <b>Área da imagem usada na questão (caso necessário)</b><br />
            <b>Observação: a imagem deve ter boa resolução e tamanhos de letras e figuras adequados.</b>
            <ImageUploader />
            {/* Campo: Alternativas da Questão */}
             <Input
        type="text"
        text="Apresentar 5 (cinco) alternativas (em ordem crescente, nos casos aplicáveis)"
        name="alternatives"
        placeholder="Insira o texto"
        value={alternatives}
        handleOnChange={(e) => setAlternatives(e.target.value)}
      />
      {alternatives && (
        <div>
          <strong>Pré-visualização:</strong>
          <LatexText content={alternatives} />
        </div>
      )}
            {/* Seção 5: Resolução da Questão */}
            <b>5. Resolução da Questão</b>
             <Input
                    type="text"
                    text="Indicar a alternativa correta"
                    name="correctAlternative"
                    placeholder="Insira o texto"
                    value={correctAlternative}
                    handleOnChange={(e) => setCorrectAlternative(e.target.value)}
                />
                <Input
                    type="text"
                    text="Resolução detalhada da questão (sem limite de linhas)"
                    name="detailedResolution"
                    placeholder="Insira o texto"
                    value={detailedResolution}
                    handleOnChange={(e) => setDetailedResolution(e.target.value)}
                />
                {/* Instrução e pré-visualização para a resolução detalhada */}
                {detailedResolution && (
                    <div>
                    <strong>Pré-visualização:</strong>
                    <LatexText content={detailedResolution} />
                    </div>
                )}

            {/* Seção 6: Envio para Análise */}

            {/* Exibe a seção de envio para análise apenas se estiver no modo de edição*/}
            {isEditMode && (
                <>
                    <b>6. Envio para Análise</b>
                    <Select 
                    name="category_id" 
                    text="Selecione o tipo de estado da questão"
                    options={categoris}
                    value={categoryId}
                    handleOnChange={(e) => {
                        console.log("Categoria selecionada:", e.target.value);
                        setCategoryId(e.target.value);
                    }}
                    />
                </>
                )}
            {/* Exibe mensagem de erro geral (campos não preenchidos)*/}
            {formError && <p style={{ color: "red" }}>{formError}</p>}
            {/* Botão de envio do formulário */}
            <SubmitButton text={btnText} />
        </form>
    );
}
// Validação da prop btnText (obrigatória e deve ser uma string)
ProjectForme.propTypes = {
    btnText: PropTypes.string.isRequired,
    projectData: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired
};

export default ProjectForme;