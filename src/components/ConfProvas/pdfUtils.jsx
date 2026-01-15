import jsPDF from 'jspdf';
import cabecalho from '../../img/heder.png';
import rodape from '../../img/footer.png';

// Função exportada que aceita lista de questões e dados da prova
export function gerarPDF(questoes, projeto, preview = false) {
  if (!questoes || questoes.length === 0) {
    alert('A prova não possui questões.');
    return;
  }
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const colunaLargura = 90;
  const margemEntreColunas = 1;

  // === INÍCIO DA LÓGICA DE TÍTULO INTELIGENTE ===
  
  const anoAtual = new Date().getFullYear();
  const faseTexto = projeto.fase ? projeto.fase.toUpperCase() : 'FASE INDEFINIDA';

  // 1. Mapa simplificado: Apenas o ordinal, sem a palavra "Médio" ou "Ano"
  // Isso permite montarmos frases como "4º e 5º Anos" ou "1º, 2º e 3º Anos do Ensino Médio"
  const mapaAnos = {
    '4': '4º', '5': '5º', '6': '6º', '7': '7º', '8': '8º', '9': '9º',
    '1': '1º', '2': '2º', '3': '3º' // Assumindo que 1, 2 e 3 aqui são IDs do Médio
  };

  let anosTexto = 'Anos Diversos';
  
  if (projeto.anos && Array.isArray(projeto.anos) && projeto.anos.length > 0) {
    // Ordena os anos para garantir que saia "4º e 5º" e não "5º e 4º"
    const anosOrdenados = [...projeto.anos].sort();

    // 2. Verifica se é Ensino Médio
    // Lógica: Se incluir '1', '2' ou '3' (IDs do médio) assumimos que é prova de Ensino Médio
    // (Ajuste essa verificação conforme seus IDs reais do banco de dados se houver conflito com 1º/2º/3º fundamental)
    const ehEnsinoMedio = anosOrdenados.some(val => ['1', '2', '3'].includes(val));

    // 3. Define o sufixo baseado no ciclo escolar
    const sufixo = ehEnsinoMedio ? 'Anos do Ensino Médio' : 'Anos';

    // 4. Cria a lista de labels (ex: ["1º", "2º", "3º"] ou ["4º", "5º"])
    const labels = anosOrdenados.map(val => mapaAnos[val] || val);

    // 5. Monta a string gramaticalmente correta
    if (labels.length > 1) {
      const ultimo = labels.pop(); 
      anosTexto = `${labels.join(', ')} e ${ultimo} ${sufixo}`;
    } else {
      // Singular (Ex: "3º Ano do Ensino Médio" ou "5º Ano")
      // Removemos o "s" de "Anos"
      const sufixoSingular = sufixo.replace('Anos', 'Ano');
      anosTexto = `${labels[0]} ${sufixoSingular}`;
    }
  }

  const tituloCabecalho = `OLIMPÍADA DE MATEMÁTICA DA UNEMAT – ${anoAtual} – ${faseTexto}º Fase – ${anosTexto}`;
  
  // === FIM DA LÓGICA ===

  function aplicarCabecalhoRodape() {
    const imgCab = new Image();
    imgCab.src = cabecalho;
    doc.addImage(imgCab, 'PNG', 10, 5, 190, 30);

    const imgRod = new Image();
    imgRod.src = rodape;
    doc.addImage(imgRod, 'PNG', 18, 280, 170, 17);
  }

  // Capa
  aplicarCabecalhoRodape();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  // Imprime o Título Gerado Automaticamente
  doc.text(tituloCabecalho, 34, 38);
  
  doc.setFont('helvetica', 'normal');
  doc.text('ALUNO(A): __________________________________________________________________________________', 14, 44);
  doc.text('ESCOLA: _____________________________________________', 14, 51);
  doc.text('MUNICÍPIO: ___________________________', 120, 51);

  // Função para renderizar questões
  function renderQuestoes(questoes, incluirResposta = false) {
    let y = 60;
    let coluna = 0;

    aplicarCabecalhoRodape();
    doc.setFontSize(10);

    questoes.forEach((questao, index) => {
      const startX = coluna === 0 ? 10 : pageWidth / 2 + margemEntreColunas;
      const larguraTexto = colunaLargura;

      // Enunciado
      doc.setFont('helvetica', 'bold');
      const enunciado = doc.splitTextToSize(`${index + 1}) ${questao.questionStatement || 'Sem enunciado'}`, larguraTexto);
      doc.text(enunciado, startX, y, { maxWidth: larguraTexto, align: 'justify' });
      y += enunciado.length * 5;

      // Alternativas
      if (typeof questao.alternatives === 'string') {
        const matches = questao.alternatives.match(/([a-e]\)\s[^a-e]*)/gi);
        if (matches) {
          const altLinha = matches.join('   ');
          const altLines = doc.splitTextToSize(altLinha, larguraTexto);
          doc.text(altLines, startX, y);
          y += altLines.length * 6;
        }
      }

      // Resolução
      if (incluirResposta) {
        y += 2;
        doc.setFont('helvetica', 'italic');
        doc.text('Resolução:', startX, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 0, 0); // vermelho

        const resolucao = questao.detailedResolution || 'Sem resolução';
        const resolucaoLines = doc.splitTextToSize(resolucao, larguraTexto);
        doc.text(resolucaoLines, startX, y);
        y += resolucaoLines.length * 6;

        doc.setTextColor(0, 0, 0); // volta ao preto
      } else {
        y += 7;
        doc.setLineWidth(0.1);
      }

      // Muda coluna/página
      if (y > 250) {
        if (coluna === 0) {
          coluna = 1;
          y = 60;
        } else {
          doc.addPage();
          aplicarCabecalhoRodape();
          coluna = 0;
          y = 40;
        }
      }
    });
  }

  renderQuestoes(questoes, false);

  doc.addPage();
  aplicarCabecalhoRodape();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Prova com Resoluções', 65, 40);
  renderQuestoes(questoes, true);

  if (preview) {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${projeto.name || 'prova_unemat'}.pdf`);
  }
}