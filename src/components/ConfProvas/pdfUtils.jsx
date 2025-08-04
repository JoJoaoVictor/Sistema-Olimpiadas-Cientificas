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
  doc.text( 'OLIMPÍADA DE MATEMÁTICA DA UNEMAT – 2024 – 3ª FASE – 4º e 5º Anos', 34, 38);
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
        // espaço para aluno responder
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

  // Parte 1: sem resolução
  renderQuestoes(questoes, false);

  // Parte 2: com resolução
  doc.addPage();
  aplicarCabecalhoRodape();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Prova com Resoluções', 65, 40);
  renderQuestoes(questoes, true);

  // Preview ou Download
  if (preview) {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${projeto.name || 'prova_unemat'}.pdf`);
  }
}
