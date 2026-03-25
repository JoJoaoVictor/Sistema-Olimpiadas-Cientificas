import bnccData from './bncc_matematica.json';

/**
 * Mapeamento de grauId para chaves de array no BNCC.json e filtro de ano
 * 
 * Backend retorna IDs:
 * 1 = 2º Fundamental
 * 2 = 3º Fundamental
 * 3 = 4º Fundamental
 * 4 = 5º Fundamental
 * 5 = 6º Fundamental
 * 6 = 7º Fundamental
 * 7 = 8º Fundamental
 * 8 = 9º Fundamental
 * 9 = 1º Médio
 * 10 = 2º Médio
 * 11 = 3º Médio
 */
const grauMapping = {
  1: { keys: ['bncc_ensinoMedio'], anoFilter: '2º ano' },           // 2º Fundamental
  2: { keys: ['bncc_ensinoMedio'], anoFilter: '3º ano' },           // 3º Fundamental
  3: { keys: ['bncc_4ano'], anoFilter: null },                       // 4º Fundamental
  4: { keys: ['bncc_5ano'], anoFilter: null },                       // 5º Fundamental
  5: { keys: ['bncc_6ano'], anoFilter: null },                       // 6º Fundamental
  6: { keys: ['bncc_7ano'], anoFilter: null },                       // 7º Fundamental
  7: { keys: ['bncc_8ano'], anoFilter: null },                       // 8º Fundamental
  8: { keys: ['bncc_9ano'], anoFilter: null },                       // 9º Fundamental
  9: { keys: ['bncc_ensinoMedio'], anoFilter: null },               // 1º, 2º e 3º Médio (todos)
  10: { keys: ['bncc_ensinoMedio'], anoFilter: null },              // 1º, 2º e 3º Médio (todos)
  11: { keys: ['bncc_ensinoMedio'], anoFilter: null }               // 1º, 2º e 3º Médio (todos)
};

/**
 * Obtém todos os dados BNCC para um grau específico
 * @param {number} grauId - ID do grau
 * @returns {Array} Array com todas as habilidades do grau
 */
function getAllDataByGrau(grauId) {
  const mapping = grauMapping[grauId];
  
  if (!mapping) {
    console.warn('[bnccHelper] Grau ID', grauId, 'não reconhecido');
    return [];
  }
  
  const { keys, anoFilter } = mapping;
  let result = [];
  
  keys.forEach(key => {
    if (bnccData[key]) {
      let arrayData = bnccData[key];
      
      // Filtrar por ano se necessário (para 2º e 3º Fundamental)
      if (anoFilter) {
        arrayData = arrayData.filter(item => item.ano === anoFilter);
      }
      
      result = [...result, ...arrayData];
    }
  });
  
  return result;
}

/**
 * Obtém temas BNCC únicos para um grau
 * @param {number} grauId - ID do grau
 * @returns {Array<string>} Array de temas únicos
 */
export function getTemasByGrauId(grauId) {
  const data = getAllDataByGrau(grauId);
  const temas = new Set();
  
  data.forEach(item => {
    if (item.unidadeTematica) {
      temas.add(item.unidadeTematica);
    }
  });
  
  return Array.from(temas).sort();
}

/**
 * Obtém objetos do conhecimento para um tema específico
 * @param {number} grauId - ID do grau
 * @param {string} tema - Nome do tema BNCC
 * @returns {Array<string>} Array de objetos do conhecimento únicos
 */
export function getObjetosByTema(grauId, tema) {
  const data = getAllDataByGrau(grauId);
  const objetos = new Set();
  
  data.forEach(item => {
    if (item.unidadeTematica === tema && item.objetosDeConhecimento) {
      objetos.add(item.objetosDeConhecimento);
    }
  });
  
  return Array.from(objetos).sort();
}

/**
 * Obtém habilidades para um objeto do conhecimento
 * @param {number} grauId - ID do grau
 * @param {string} tema - Nome do tema BNCC
 * @param {string} objeto - Nome do objeto do conhecimento
 * @returns {Array<{codigo: string, descricao: string}>} Array com código e descrição das habilidades
 */
export function getHabilidadesByObjeto(grauId, tema, objeto) {
  const data = getAllDataByGrau(grauId);
  const habilidades = [];
  const seen = new Set();
  
  data.forEach(item => {
    if (
      item.unidadeTematica === tema &&
      item.objetosDeConhecimento === objeto &&
      item.habilidade &&
      !seen.has(item.habilidade)
    ) {
      seen.add(item.habilidade);
      habilidades.push({
        codigo: item.habilidade,
        descricao: item.abilityDescription || ''
      });
    }
  });
  
  return habilidades;
}

/**
 * Obtém a descrição de uma habilidade através do seu código
 * @param {number} grauId - ID do grau
 * @param {string} codigoHabilidade - Código da habilidade (ex: "EF04MA01")
 * @returns {string} Descrição da habilidade
 */
export function getDescricaoByCodigoHabilidade(grauId, codigoHabilidade) {
  const data = getAllDataByGrau(grauId);
  const item = data.find(h => h.habilidade === codigoHabilidade);
  return item ? item.abilityDescription : '';
}

/**
 * Valida se uma combinação tema-objeto-habilidade é válida
 * @param {number} grauId - ID do grau
 * @param {string} tema - Nome do tema
 * @param {string} objeto - Nome do objeto
 * @param {string} codigoHabilidade - Código da habilidade
 * @returns {boolean} true se a combinação é válida
 */
export function isValidCombination(grauId, tema, objeto, codigoHabilidade) {
  const data = getAllDataByGrau(grauId);
  return data.some(item =>
    item.unidadeTematica === tema &&
    item.objetosDeConhecimento === objeto &&
    item.habilidade === codigoHabilidade
  );
}
