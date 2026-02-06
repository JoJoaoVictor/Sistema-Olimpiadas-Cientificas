/**
 * Validador de Questões - Previne problemas na entrada
 * Verifica todos os campos antes de salvar
 */

export const VALIDATION_RULES = {
  VALID_SERIES: [
    "1º Fundamental", "2º Fundamental", "3º Fundamental",
    "4º Fundamental", "5º Fundamental", "6º Fundamental",
    "7º Fundamental", "8º Fundamental", "9º Fundamental",
    "1º Médio", "2º Médio", "3º Médio"
  ],
  
  VALID_BNCC: [
    "Álgebra", "Geometria", "Números", "Números e Álgebra",
    "Grandezas e Medidas", "Probabilidade e Estatística",
    "Álgebra/Geometria", "Grandezas/Geometria"
  ],
  
  VALID_KNOWLEDGE: [
    "Números Naturais", "Frações", "Decimais", "Operações Básicas",
    "Geometria Básica", "Geometria Analítica", "Trigonometria",
    "Álgebra", "Funções", "Álgebra Linear", "Probabilidade",
    "Estatística", "Medidas", "Perímetro e Área"
  ]
};

/**
 * Valida uma questão completa
 * @param {Object} question - Dados da questão
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateQuestion = (question) => {
  const errors = [];

  // 1. Validar campos obrigatórios
  if (!question.name || question.name.trim() === "") {
    errors.push("Nome da questão é obrigatório");
  }

  if (!question.professorName || question.professorName.trim() === "") {
    errors.push("Nome do professor é obrigatório");
  }

  if (!question.serieAno || question.serieAno.trim() === "") {
    errors.push("Série/Ano é obrigatório");
  } else if (!VALIDATION_RULES.VALID_SERIES.includes(question.serieAno)) {
    errors.push(`Série/Ano inválida. Use um dos valores: ${VALIDATION_RULES.VALID_SERIES.join(", ")}`);
  }

  if (!question.questionStatement || question.questionStatement.trim() === "") {
    errors.push("Enunciado da questão é obrigatório");
  } else if (question.questionStatement.includes('\\\\(') || question.questionStatement.includes('\\\\[')) {
    errors.push("LaTeX com escape duplo detectado. Use \\(...\\) em vez de \\\\(...\\\\)");
  }

  // 2. Validar alternativas
  const altsValidation = validateAlternatives(question.alternatives);
  if (!altsValidation.isValid) {
    errors.push(...altsValidation.errors);
  }

  // 3. Validar alternativa correta
  const corrAltValidation = validateCorrectAlternative(question.correctAlternative);
  if (!corrAltValidation.isValid) {
    errors.push(...corrAltValidation.errors);
  }

  // 4. Validar BNCC Theme
  if (question.bnccTheme && !VALIDATION_RULES.VALID_BNCC.includes(question.bnccTheme)) {
    errors.push(`BNCC Theme inválido. Use um dos valores: ${VALIDATION_RULES.VALID_BNCC.join(", ")}`);
  }

  // 5. Validar Knowledge Objects
  if (question.knowledgeObjects && !VALIDATION_RULES.VALID_KNOWLEDGE.includes(question.knowledgeObjects)) {
    errors.push(`Knowledge Objects inválido. Use um dos valores: ${VALIDATION_RULES.VALID_KNOWLEDGE.join(", ")}`);
  }

  // 6. Validar dificuldade
  if (!question.difficultyLevel || question.difficultyLevel < 1 || question.difficultyLevel > 5) {
    errors.push("Dificuldade deve ser entre 1 e 5");
  }

  // 7. Validar resolução
  if (!question.detailedResolution || question.detailedResolution.trim() === "") {
    errors.push("Resolução detalhada é obrigatória");
  } else if (question.detailedResolution.includes('\\\\(') || question.detailedResolution.includes('\\\\[')) {
    errors.push("LaTeX com escape duplo detectado na resolução");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida alternativas
 */
export const validateAlternatives = (alternatives) => {
  const errors = [];

  if (!alternatives) {
    errors.push("Alternativas são obrigatórias");
    return { isValid: false, errors };
  }

  // Se é string, tenta parsear
  let altsObj = alternatives;
  if (typeof alternatives === 'string') {
    try {
      altsObj = JSON.parse(alternatives);
    } catch (e) {
      errors.push("Alternativas devem estar em formato JSON válido");
      return { isValid: false, errors };
    }
  }

  // Validar que tem A-E
  const required = ['A', 'B', 'C', 'D', 'E'];
  for (const letter of required) {
    if (!altsObj[letter] || altsObj[letter].trim() === "") {
      errors.push(`Alternativa ${letter} está vazia`);
    }
  }

  // Validar que não tem espaços extras
  for (const letter of required) {
    if (altsObj[letter] && altsObj[letter] !== altsObj[letter].trim()) {
      // Aviso (não erro)
      console.warn(`Alternativa ${letter} tem espaços extras`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida alternativa correta
 */
export const validateCorrectAlternative = (value) => {
  const errors = [];

  if (!value || value.trim() === "") {
    errors.push("Alternativa correta é obrigatória");
    return { isValid: false, errors };
  }

  const extracted = extractCorrectLetter(value);

  if (!extracted || !/^[A-E]$/.test(extracted)) {
    errors.push(`Alternativa correta deve ser A, B, C, D ou E. Recebido: "${value}"`);
    return { isValid: false, errors };
  }

  return { isValid: true, errors };
};

/**
 * Extrai apenas a letra da alternativa
 */
export const extractCorrectLetter = (value) => {
  if (!value) return "";

  const text = value.trim().toUpperCase();

  // Apenas letra
  if (/^[A-E]$/.test(text)) {
    return text;
  }

  // Letra com parenteses: (A), (B)
  const match1 = text.match(/^\(?([A-E])\)?/);
  if (match1) return match1[1];

  // Letra com fechamento: A), B)
  const match2 = text.match(/^([A-E])\)/);
  if (match2) return match2[1];

  // Procura a primeira letra
  for (const char of text) {
    if (/[A-E]/.test(char)) return char;
  }

  return "";
};

/**
 * Normaliza série/ano
 */
export const normalizeSerieAno = (value) => {
  const map = {
    '1': '1º Fundamental',
    '2': '2º Fundamental',
    '3': '3º Fundamental',
    '4': '4º Fundamental',
    '5': '5º Fundamental',
    '6': '6º Fundamental',
    '7': '7º Fundamental',
    '8': '8º Fundamental',
    '9': '9º Fundamental',
  };

  return map[value?.trim()] || value;
};

/**
 * Limpa alternativas de espaços extras
 */
export const cleanAlternatives = (alternatives) => {
  if (typeof alternatives === 'string') {
    try {
      const parsed = JSON.parse(alternatives);
      return JSON.stringify(
        Object.fromEntries(
          Object.entries(parsed).map(([k, v]) => [k, v?.trim() || ""])
        )
      );
    } catch {
      return alternatives;
    }
  }

  return JSON.stringify(
    Object.fromEntries(
      Object.entries(alternatives).map(([k, v]) => [k, v?.trim() || ""])
    )
  );
};

/**
 * Valida LaTeX
 */
export const validateLatex = (text) => {
  if (!text) return true;

  const problems = [];

  if (text.includes('\\\\(') || text.includes('\\\\[')) {
    problems.push("Escape duplo detectado: \\\\( ou \\\\[ (use \\( ou \\[)");
  }

  if (text.includes('$$$')) {
    problems.push("Triple dollar signs detectado ($$$)");
  }

  return {
    isValid: problems.length === 0,
    problems
  };
};

/**
 * Relatório completo de validação
 */
export const getValidationReport = (question) => {
  const validation = validateQuestion(question);
  const latexCheck = validateLatex(question.questionStatement);
  const resolutionLatex = validateLatex(question.detailedResolution);

  return {
    overall: {
      isValid: validation.isValid && latexCheck.isValid && resolutionLatex.isValid,
      totalErrors: validation.errors.length + latexCheck.problems.length + resolutionLatex.problems.length
    },
    fieldErrors: validation.errors,
    latexErrors: {
      questionStatement: latexCheck.problems,
      detailedResolution: resolutionLatex.problems
    },
    warnings: getValidationWarnings(question)
  };
};

/**
 * Avisos não críticos
 */
export const getValidationWarnings = (question) => {
  const warnings = [];

  // Avisos de espaços
  if (question.alternatives) {
    try {
      const alts = typeof question.alternatives === 'string' 
        ? JSON.parse(question.alternatives) 
        : question.alternatives;
      
      for (const [key, value] of Object.entries(alts)) {
        if (value && value !== value.trim()) {
          warnings.push(`Alternativa ${key} tem espaços extras`);
        }
      }
    } catch (e) {
      // Ignorar
    }
  }

  // Aviso: questão muito longa
  if (question.questionStatement?.length > 1000) {
    warnings.push("Enunciado muito longo (>1000 caracteres)");
  }

  // Aviso: nome do professor suspeito
  if (question.professorName?.length < 3) {
    warnings.push("Nome do professor parece muito curto");
  }

  return warnings;
};
