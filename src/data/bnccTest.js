// Arquivo de teste para diagnosticar problemas com o bnccHelper
// Execute este arquivo para debug

import bnccData from './bncc_matematica.json';
import { getTemasByGrauId, getObjetosByTema, getHabilidadesByObjeto } from './bnccHelper.js';

console.log('=== DIAGNÓSTICO BNCC ===\n');

// 1. Verificar estrutura do JSON
console.log('1. ESTRUTURA DO JSON CARREGADO:');
console.log('Chaves disponíveis:', Object.keys(bnccData));
console.log('Total de temas 4º ano:', bnccData.bncc_4ano?.length || 0);
console.log('Total de temas Ensino Médio:', bnccData.bncc_ensinoMedio?.length || 0);

console.log('\n2. TESTE: getTemasByGrauId(1) - Fundamental I (4º-5º)');
const temasGrau1 = getTemasByGrauId(1);
console.log('Temas retornados:', temasGrau1);
console.log('Quantidade:', temasGrau1.length);

console.log('\n3. TESTE: getTemasByGrauId(3) - Ensino Médio');
const temasGrau3 = getTemasByGrauId(3);
console.log('Temas retornados:', temasGrau3);
console.log('Quantidade:', temasGrau3.length);

if (temasGrau1.length > 0) {
    console.log('\n4. TESTE: getObjetosByTema(1, "' + temasGrau1[0] + '")');
    const objetos = getObjetosByTema(1, temasGrau1[0]);
    console.log('Objetos retornados:', objetos);
    console.log('Quantidade:', objetos.length);

    if (objetos.length > 0) {
        console.log('\n5. TESTE: getHabilidadesByObjeto(1, "' + temasGrau1[0] + '", "' + objetos[0] + '")');
        const habilidades = getHabilidadesByObjeto(1, temasGrau1[0], objetos[0]);
        console.log('Habilidades retornadas:', habilidades);
        console.log('Quantidade:', habilidades.length);
    }
}

console.log('\n=== FIM DO DIAGNÓSTICO ===');
