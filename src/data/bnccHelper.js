import bnccData from './bncc_matematica.json';

export function getAllDataByGrau(grauId) {
  if (!grauId) return [];

  const id = Number(grauId);

  // 1. Achatamento inteligente: Ignora o nome das chaves e junta TODAS as habilidades numa lista única
  let allItems = [];
  if (Array.isArray(bnccData)) {
    allItems = bnccData;
  } else if (bnccData && typeof bnccData === 'object') {
    Object.values(bnccData).forEach(val => {
      if (Array.isArray(val)) {
        allItems = [...allItems, ...val];
      }
    });
  }

  // 2. Filtro Cirúrgico à Prova de Bugs
  const dataOriginal = allItems.filter(item => {
    if (!item || !item.ano) return false;
    
    const anoStr = String(item.ano).toLowerCase().trim();
    const habStr = item.habilidade ? String(item.habilidade).toUpperCase() : '';

    // --- REGRA PARA O ENSINO MÉDIO (IDs 9, 10, 11) ---
    if (id >= 9 && id <= 11) {
      // Se for Médio, busca TUDO que tenha "médio" ou código "EM". 
      // Isso resgata as habilidades perdidas (como Números/Geometria).
      return anoStr.includes('médio') || anoStr.includes('medio') || habStr.includes('EM');
    } 
    
    // --- REGRA PARA O ENSINO FUNDAMENTAL (IDs 1 a 8) ---
    else if (id >= 1 && id <= 8) {
      // Como o ID 1 = 2º ano, ID 2 = 3º ano... pegamos só o NÚMERO
      const numSerie = String(id + 1); 
      
      // Buscar APENAS pelo número (ex: '2') ignora o erro do caractere (º vs °).
      // A trava !médio e !EM garante que não vai vazar os dados do Ensino Médio.
      return (
        anoStr.includes(numSerie) && 
        !anoStr.includes('médio') && 
        !anoStr.includes('medio') && 
        !habStr.includes('EM')
      );
    }
    
    return false;
  });

  // --- INTEGRAÇÃO COM LOCALSTORAGE ---
  const customBNCC = JSON.parse(localStorage.getItem('customBNCC') || '[]');
  const customForGrau = customBNCC.filter(item => Number(item.grauId) === id);
  
  return [...dataOriginal, ...customForGrau];
}

// ── O RESTANTE DO CÓDIGO CONTINUA IGUAL, USANDO A NOVA BUSCA ──

export function getTemasByGrauId(grauId) {
  const data = getAllDataByGrau(grauId);
  const temas = new Set();
  data.forEach(item => {
    if (item.unidadeTematica) temas.add(item.unidadeTematica.trim());
  });
  return Array.from(temas);
}

export function getObjetosByTema(grauId, tema) {
  const data = getAllDataByGrau(grauId);
  const objetos = new Set();
  data.forEach(item => {
    if (item.unidadeTematica && item.unidadeTematica.trim() === String(tema).trim() && item.objetosDeConhecimento) {
      objetos.add(item.objetosDeConhecimento.trim());
    }
  });
  return Array.from(objetos);
}

export function getHabilidadesByObjeto(grauId, tema, objeto) {
  const data = getAllDataByGrau(grauId);
  const habilidades = [];
  const seen = new Set();
  
  data.forEach(item => {
    if (
      item.unidadeTematica && item.unidadeTematica.trim() === String(tema).trim() &&
      item.objetosDeConhecimento && item.objetosDeConhecimento.trim() === String(objeto).trim() &&
      item.habilidade &&
      !seen.has(item.habilidade.trim())
    ) {
      seen.add(item.habilidade.trim());
      habilidades.push({
        codigo: item.habilidade.trim(),
        descricao: item.abilityDescription || ''
      });
    }
  });
  
  return habilidades;
}

export function getDescricaoByCodigoHabilidade(grauId, codigoHabilidade) {
  const data = getAllDataByGrau(grauId);
  const item = data.find(h => h.habilidade && h.habilidade.trim() === String(codigoHabilidade).trim());
  return item ? item.abilityDescription : '';
}

export function saveCustomBNCC(grauId, unidadeTematica, objetosDeConhecimento, habilidade, abilityDescription) {
  const customBNCC = JSON.parse(localStorage.getItem('customBNCC') || '[]');
  const newItem = {
    id: `custom_${Date.now()}`,
    grauId: Number(grauId),
    unidadeTematica: unidadeTematica.trim(),
    objetosDeConhecimento: objetosDeConhecimento.trim(),
    habilidade: habilidade.trim().toUpperCase(),
    abilityDescription: abilityDescription.trim()
  };
  customBNCC.push(newItem);
  localStorage.setItem('customBNCC', JSON.stringify(customBNCC));
  return newItem;
}

export function findHabilidade(codigo) {
  const cleanCodigo = codigo.replace(/[()]/g, '').trim().toLowerCase();
  for (let i = 1; i <= 11; i++) {
    const data = getAllDataByGrau(i);
    const found = data.find(item => {
      const habStr = item.habilidade ? item.habilidade.replace(/[()]/g, '').trim().toLowerCase() : '';
      return habStr === cleanCodigo;
    });
    if (found) return { ...found, grauId: i };
  }
  return null;
}