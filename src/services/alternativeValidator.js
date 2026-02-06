/**
 * Utilidades para normalização e validação de alternativas de questões
 * Padroniza inputs em múltiplos formatos para um único padrão
 */

/**
 * Extrai a letra da alternativa correta de diversos formatos
 * @param {string} correctAlternative - Input em qualquer formato
 * @returns {string} - Letra maiúscula (A-E) ou string vazia
 */
export const extractCorrectLetter = (correctAlternative) => {
  if (!correctAlternative) return "";
  
  const text = correctAlternative.trim();
  
  // Um único padrão que cobre: "A)", "A.", "(A)", "A ", "A"
  // Procura por: opcional (, letra A-E, opcional ), seguido por ) . espaço ou fim
  const match = text.match(/^\(?([A-Ea-e])\)?[\s\)\.]*$/i);
  
  return match ? match[1].toUpperCase() : "";
};

/**
 * Valida se o valor é uma letra válida de alternativa
 * @param {string} letter - Letra a validar
 * @returns {boolean} - True se for A-E
 */
export const isValidAlternativeLetter = (letter) => {
  return /^[A-E]$/.test(letter?.toUpperCase());
};

/**
 * Normaliza o input de alternativa correta
 * Tenta extrair a letra, se não conseguir retorna valor original
 * @param {string} value - Valor a normalizar
 * @returns {string} - Letra extraída ou valor original
 */
export const normalizeAlternativeInput = (value) => {
  if (!value) return "";
  
  const trimmed = value.trim();
  const extracted = extractCorrectLetter(trimmed);
  
  // Se conseguiu extrair a letra, retorna ela
  // Caso contrário, retorna o original para mensagem de erro ser clara
  return extracted || trimmed;
};

/**
 * Validação completa para alternativa correta
 * Retorna objeto com status e mensagem
 * @param {string} value - Valor a validar
 * @returns {object} - { isValid: boolean, message: string, normalized: string }
 */
export const validateCorrectAlternative = (value) => {
  if (!value) {
    return {
      isValid: false,
      message: "Alternativa correta é obrigatória",
      normalized: ""
    };
  }

  const normalized = extractCorrectLetter(value);

  if (!normalized) {
    return {
      isValid: false,
      message: "Digite apenas a letra (A-E) ou formatos: A) ou (A) ou A.",
      normalized: ""
    };
  }

  return {
    isValid: true,
    message: "",
    normalized
  };
};

/**
 * Normaliza todos os dados de alternativas antes do envio
 * @param {object} alternatives - Objeto { A: "", B: "", ... }
 * @param {string} correctAlternative - Alternativa correta em qualquer formato
 * @returns {object} - { alternatives: object, correctAlternative: string }
 */
export const normalizeAllAlternatives = (alternatives, correctAlternative) => {
  const validation = validateCorrectAlternative(correctAlternative);

  return {
    alternatives,
    correctAlternative: validation.normalized,
    isValid: validation.isValid,
    message: validation.message
  };
};
