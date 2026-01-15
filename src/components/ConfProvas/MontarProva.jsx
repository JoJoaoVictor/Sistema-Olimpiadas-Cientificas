import { useState, useEffect, useRef } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import Select from 'react-select'; 
import { useParams, useNavigate } from 'react-router-dom'; // Adicionei useNavigate
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // NOVO: Drag and Drop
import styles from './MontarProva.module.css'; 
import SearchBar from '../form/SearchBar';

// IMPORTS NECESSÁRIOS PARA O PDF COM LATEX E IMAGENS
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; 
import katex from 'katex'; 
import 'katex/dist/katex.min.css'; 
import renderMathInElement from 'katex/dist/contrib/auto-render'; 

// IMAGENS
import cabecalho from '../../img/heder.png'; 
import rodape from '../../img/footer.png'; 
import tema from '../../img/tema.png'; 

// MODAIS
import ModalSalvarProva from './modal/ModalSalvarProva'; 
import ModalInfoQuestao from './modal/ModalInfoQuestao'; 

// === UTILITÁRIOS DE CORREÇÃO DE STRING ===
const sanitizeLatex = (str) => {
  if (!str) return '';
  return str.replace(/\\\\/g, '\\');
};

const safeParseAlternatives = (rawAlt) => {
  if (!rawAlt) return {};
  if (typeof rawAlt === 'object') return rawAlt; // Já veio como objeto do backend
  try {
    return JSON.parse(rawAlt);
  } catch (e) {
    try {
      const fixed = rawAlt.replace(/\\\\/g, '\\');
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("Erro fatal ao parsear alternativas:", rawAlt);
      return {}; 
    }
  }
};

const verificarLatex = (texto) => {
  if (!texto) return false;
  const regexLatex = /(\$\$|\$|\\\(|\\\[|\\begin\{|\\frac|\\pi|\\sqrt)/;
  return regexLatex.test(texto);
};

// === ADAPTADOR DE DADOS (BACKEND -> FRONTEND) ===
// Transforma os dados do Python (snake_case) para o formato que seu PDF espera (camelCase)
const mapearQuestaoBackend = (q) => ({
    id: q.id,
    name: `Questão ${q.id}`, // ou q.code se tiver
    questionStatement: q.statement, // Mapeia 'statement' para 'questionStatement'
    alternatives: q.alternatives,
    correctAlternative: q.answer, // Assumindo 'answer' no backend
    detailedResolution: q.resolution,
    difficultyLevel: q.difficulty,
    abilityCode: "EF0" + q.year, // Exemplo, ajuste conforme seu modelo
    bnccTheme: "Matemática", // Ajuste conforme seu modelo
    serieAno: q.year ? `${q.year}º Ano` : "Geral",
    phaseLevel: q.fase || "Única"
});

function MontarProva() {
  const [projeto, setProjeto] = useState({});
  const [questoes, setQuestoes] = useState([]); 
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]); 
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros
  const [habilidade, setHabilidade] = useState('');
  const [phaseLevel, setPhaseLevel] = useState(''); 
  const [status, setStatus] = useState('rascunho'); // Ajustado para minusculo (enum do backend)
  
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [dificuldade, setDificuldade] = useState('');
  const [mostrarQuestoes, setMostrarQuestoes] = useState(true); // Mudei para true padrão para facilitar testes
  
  // Modais
  const [modalSalvarAberto, setModalSalvarAberto] = useState(false); 
  const [modalInfoAberto, setModalInfoAberto] = useState(false); 
  const [questaoSelecionada, setQuestaoSelecionada] = useState(null);
  
  // Dados da Prova
  const [nomeProva, setNomeProva] = useState('');
  const [faseProva, setFaseProva] = useState(''); 
  const [anoProva, setAnoProva] = useState('');
  
  // PDF e Progress
  const [gerandoPDF, setGerandoPDF] = useState(false); 
  const [progresso, setProgresso] = useState(0); 
  const printRef = useRef(null); 

  // === SEARCH ===
  const handleSearch = (term) => {
    setSearchTerm(term);
    setMostrarQuestoes(true);
  };

  // === CARREGAMENTO DE DADOS ===
  useEffect(() => {
    // 1. Carregar Prova Existente (se houver ID)
    if (id) {
      fetch(`http://localhost:8000/api/v1/exams/${id}`) // PORTA 8000
        .then(res => {
          if (!res.ok) throw new Error(`Prova não encontrada`);
          return res.json();
        })
        .then(response => {
           // O backend retorna { data: { exam: ... } }
           const exam = response.data.exam; 
           setProjeto(exam);
           setNomeProva(exam.name);
           setFaseProva(exam.fase);
           // Precisamos buscar os detalhes das questões dessa prova
           // Supondo que o endpoint retorne os IDs ou objetos completos.
           // Se retornar só IDs, teríamos que fazer outro fetch. 
           // Vamos assumir que mapeamos o que veio:
           if (exam.questions) {
               setQuestoesSelecionadas(exam.questions.map(mapearQuestaoBackend));
           }
        })
        .catch(err => console.log(err));
    }

    // 2. Carregar Banco de Questões
    fetch('http://localhost:8000/api/v1/questions') // PORTA 8000
      .then(res => res.json())
      .then(data => {
          // O backend retorna uma lista pura ou paginada? 
          // Ajuste conforme seu retorno. Ex: data.items ou data
          const lista = Array.isArray(data) ? data : (data.items || []);
          setQuestoes(lista.map(mapearQuestaoBackend));
      })
      .catch(err => console.log("Erro ao buscar questões", err));
  }, [id]);

  // === DRAG AND DROP (Substitui moverQuestaoParaCima/Baixo) ===
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(questoesSelecionadas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestoesSelecionadas(items);
  };

  // === FILTROS E SELEÇÃO ===
  const opcoesAno = [
      { value: '2', label: '2º Ano' }, { value: '3', label: '3º Ano' },
      { value: '4', label: '4º Ano' }, { value: '5', label: '5º Ano' },
      { value: '6', label: '6º Ano' }, { value: '7', label: '7º Ano' },
      { value: '8', label: '8º Ano' }, { value: '9', label: '9º Ano' },
      { value: '1', label: '1º Médio' }, { value: '2', label: '2º Médio' }, { value: '3', label: '3º Médio' },
  ];

  const handleAnoSelecionado = (selected) => {
    setMostrarQuestoes(true);
    setAnosSelecionados(selected || []); 
  };

  const normalizarAno = (valor) =>
    String(valor || '')
      .toLowerCase()
      .replace(/º|°|ano|\s/g, '')
      .replace('mediomedio', 'medio') 
      .trim();

  function handleSelecionarQuestao(questao) {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  }

  function handleRemoverQuestao(idQuestao) {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== idQuestao));
  }

  // === SALVAR NO BACKEND ===
  function salvarProva() {
    const payload = {
      name: nomeProva || `Prova ${new Date().toLocaleDateString()}`,
      description: "Prova gerada pelo sistema",
      fase: faseProva || "1",
      anos: anosSelecionados.map(a => a.value), // Array de strings
      status: status,
      estimated_duration: 120, // Padrão
      question_ids: questoesSelecionadas.map(q => q.id) // A ORDEM AQUI IMPORTA
    };

    const method = id ? 'PUT' : 'POST';
    const endpoint = id
      ? `http://localhost:8000/api/v1/exams/${id}`
      : `http://localhost:8000/api/v1/exams`;

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(resp => {
        if (!resp.ok) return resp.json().then(err => { throw err; });
        return resp.json();
      })
      .then((data) => {
        alert('Prova salva com sucesso!');
        setModalSalvarAberto(false);
        // Se for criação nova, redireciona ou atualiza ID
        if (!id && data.data && data.data.exam) {
            navigate(`/montar-prova/${data.data.exam.id}`);
        }
      })
      .catch(err => {
          console.error('Erro ao salvar:', err);
          alert(`Erro ao salvar: ${err.detail || 'Verifique o console'}`);
      });
  }

  const questoesFiltradas = mostrarQuestoes
  ? questoes.filter(q =>
      (!searchTerm || q.name?.toLowerCase().includes(searchTerm.toLowerCase()) || q.questionStatement?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!habilidade || q.abilityCode?.toLowerCase().includes(habilidade.toLowerCase())) &&
      (!phaseLevel || q.phaseLevel?.toLowerCase().includes(phaseLevel.toLowerCase())) &&
      (dificuldade === '' || String(q.difficultyLevel) === difficulty) &&
      (anosSelecionados.length === 0 || anosSelecionados.some(a => normalizarAno(q.serieAno).includes(normalizarAno(a.value))))
    )
  : [];

  // ==================================================================================
  // === LÓGICA DE PDF (MANTIDA ORIGINAL) ===
  // ==================================================================================
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const converterQuestaoParaImagem = async (questao, index, tipo) => {
      const container = printRef.current;
      if (!container) return null;
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      
      // Estilos inline para garantir renderização correta no canvas
      Object.assign(wrapper.style, {
          width: '420px', padding: '5px', backgroundColor: '#ffffff',
          fontFamily: 'Times New Roman, serif', fontSize: '12px',
          color: '#000000', lineHeight: '1.3', textAlign: 'justify'
      });

      let htmlContent = '';
      
      if (tipo === 'enunciado_only') {
          const rawText = questao.questionStatement || 'Sem enunciado';
          const safeText = sanitizeLatex(rawText).replace(/\n/g, '<br/>');
          htmlContent += `<div style="margin-bottom: 2px;"><strong>${index + 1})</strong> ${safeText}</div>`;
      } 
      else if (tipo === 'alternativas_only') {
          let htmlAlternativas = '';
          const altObj = safeParseAlternatives(questao.alternatives);
          if (altObj) {
            htmlAlternativas += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 15px; margin-top: 5px; margin-left: 10px; align-items: baseline;">`;
            Object.keys(altObj).forEach(key => {
                const valorSafe = sanitizeLatex(String(altObj[key]));
                htmlAlternativas += `<span style="white-space: nowrap;"><strong>${key})</strong> ${valorSafe}</span>`;
            });
            htmlAlternativas += `</div>`;
          }
          htmlContent += htmlAlternativas;
      }
      else if (tipo === 'resolucao') {
          const rawRes = questao.detailedResolution || 'Sem resolução';
          const safeRes = sanitizeLatex(rawRes).replace(/\n/g, '<br/>');
          htmlContent += `<div style="margin-bottom: 5px;"><strong>${index + 1}) Resolução:</strong></div>`;
          const correta = questao.correctAlternative ? `<br/><strong>Gabarito: ${questao.correctAlternative}</strong><br/>` : '';
          htmlContent += `<div style="color: #000;">${correta}</div>`;
          htmlContent += `<div style="color: #c00; font-style: italic;">${safeRes}</div>`;
      }
      
      wrapper.innerHTML = htmlContent;
      container.appendChild(wrapper);

      try {
          renderMathInElement(wrapper, {
              delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\(', right: '\\)', display: false}, 
                  {left: '\\[', right: '\\]', display: true}
              ],
              throwOnError: false, strict: false 
          });
      } catch (err) { console.error("Erro renderizando LaTeX:", err); }

      await wait(10); 

      const canvas = await html2canvas(wrapper, { 
          scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      
      container.innerHTML = ''; 
      const imgWidthMM = 90; 
      const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;
      return { imgData: canvas.toDataURL('image/png'), width: imgWidthMM, height: imgHeightMM };
  };

  // Funções nativas do PDF
  const calcularAlturaTextoNativo = (doc, texto, largura) => {
     const linhas = doc.splitTextToSize(texto, largura);
     const lineHeight = doc.getFontSize() * 1.15 * 0.352777; 
     return linhas.length * lineHeight;
  };

  const renderizarTextoNativo = (doc, texto, x, y, largura, negrito = false, cor = '#000000') => {
     doc.setTextColor(cor);
     doc.setFont('helvetica', negrito ? 'bold' : 'normal');
     const linhas = doc.splitTextToSize(texto, largura);
     doc.text(linhas, x, y);
     const lineHeight = doc.getFontSize() * 1.15 * 0.352777;
     return y + (linhas.length * lineHeight);
  };

  // === GERAR PDF (MANTIDO) ===
  async function gerarPDF(preview = false) {
    if (questoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma questão.');
      return;
    }
    setGerandoPDF(true);
    setProgresso(0);
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cabeçalho e Rodapé
    const anoAtual = new Date().getFullYear();
    let textoAnos = "Anos Diversos";
    if (anosSelecionados.length > 0) {
        const labels = anosSelecionados.map(a => a.label.replace(' Ano', '').replace(' Médio', ''));
        textoAnos = labels.length > 1 
            ? `${labels.slice(0, -1).join(', ')} e ${labels.slice(-1)} Anos` 
            : `${labels[0]} Ano`;
    }
    const textoFase = faseProva ? faseProva.toUpperCase() : "FASE INDEFINIDA";
    const tituloCabecalho = `OLIMPÍADA DE MATEMÁTICA DA UNEMAT – ${anoAtual} – ${textoFase} – ${textoAnos}`;

    function aplicarCabecalhoRodape() {
        try {
          doc.addImage(cabecalho, 'PNG', 10, 5, 190, 30); 
          doc.addImage(rodape, 'PNG', 18, 280, 170, 17);
        } catch(e) {}
    }

    aplicarCabecalhoRodape();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(tituloCabecalho, 34, 38);
    doc.setFont('helvetica', 'normal');
    doc.text('ALUNO(A): __________________________________________________________________________________', 14, 44);
    doc.text('ESCOLA: _____________________________________________', 14, 51);
    doc.text('MUNICÍPIO: ___________________________', 120, 51);

    // Loop Questões
    let y = 60; 
    let coluna = 0; 
    let paginaAtual = 1;
    const larguraColuna = 90; 
    const totalEtapas = questoesSelecionadas.length * 3;
    let etapasConcluidas = 0;

    const verificarEspaco = (alturaNecessaria) => {
        if (y + alturaNecessaria > 270) {
            if (coluna === 0) {
                coluna = 1;
                y = (paginaAtual === 1) ? 60 : 40; 
            } else {
                doc.addPage();
                paginaAtual++;
                aplicarCabecalhoRodape();
                coluna = 0;
                y = 40; 
            }
        }
    };

    for (let i = 0; i < questoesSelecionadas.length; i++) {
        etapasConcluidas++;
        setProgresso(Math.round((etapasConcluidas / totalEtapas) * 100));
        if (i % 5 === 0) await wait(0);
        
        const questao = questoesSelecionadas[i];
        const enunciadoSafe = sanitizeLatex(questao.questionStatement);
        const temLatexEnunciado = verificarLatex(enunciadoSafe);
        const alternativesSafe = sanitizeLatex(JSON.stringify(questao.alternatives));
        const temLatexAlternativas = verificarLatex(alternativesSafe);

        // 1. Enunciado
        if (temLatexEnunciado) {
            try {
              const imgObj = await converterQuestaoParaImagem(questao, i, 'enunciado_only');
              if (imgObj) {
                  verificarEspaco(imgObj.height + 2);
                  const xPos = coluna === 0 ? 10 : 110;
                  doc.addImage(imgObj.imgData, 'PNG', xPos, y, imgObj.width, imgObj.height);
                  y += imgObj.height + 2;
              }
            } catch(e) { console.error(e); }
        } else {
            const textoEnunciado = `${i + 1}) ${questao.questionStatement || ''}`;
            const alturaTexto = calcularAlturaTextoNativo(doc, textoEnunciado, larguraColuna);
            verificarEspaco(alturaTexto + 2);           
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`${i + 1})`, coluna === 0 ? 10 : 110, y);
            const wNum = doc.getTextWidth(`${i + 1}) `);          
            doc.setFont('helvetica', 'normal');
            const xTexto = (coluna === 0 ? 10 : 110) + wNum;
            const linhas = doc.splitTextToSize(questao.questionStatement || '', larguraColuna - wNum);
            doc.text(linhas, xTexto, y);           
            const lh = doc.getFontSize() * 1.15 * 0.352777;
            y += (linhas.length * lh) + 2;
        }

        // 2. Alternativas
        if (temLatexAlternativas) {
             try {
               const imgObjAlt = await converterQuestaoParaImagem(questao, i, 'alternativas_only');
               if (imgObjAlt) {
                   verificarEspaco(imgObjAlt.height + 5);
                   const xPos = coluna === 0 ? 10 : 110;
                   doc.addImage(imgObjAlt.imgData, 'PNG', xPos, y, imgObjAlt.width, imgObjAlt.height);
                   y += imgObjAlt.height + 5;
               }
             } catch(e) { console.error(e); }
        } else {
            let textoAlternativas = [];
            const altObj = safeParseAlternatives(questao.alternatives);          
            if (altObj) {
               Object.keys(altObj).forEach(key => {
                   textoAlternativas.push({ key: `${key})`, val: String(altObj[key]) });
               });
            }
            verificarEspaco(5); 
            doc.setFontSize(10);
            let currentLineX = coluna === 0 ? 15 : 115; 
            const limiteX = (coluna === 0 ? 10 : 110) + larguraColuna;          
            textoAlternativas.forEach((item) => {
                doc.setFont('helvetica', 'bold');
                const wKey = doc.getTextWidth(item.key + ' ');
                doc.setFont('helvetica', 'normal');
                const wVal = doc.getTextWidth(item.val);              
                const wTotal = wKey + wVal + 8;
                if (currentLineX + wTotal > limiteX) {
                    y += 5; 
                    currentLineX = coluna === 0 ? 15 : 115;
                    verificarEspaco(5); 
                }
                const xReal = (coluna === 0 ? 15 : 115) + (currentLineX - (coluna === 0 ? 15 : 115));
                doc.setFont('helvetica', 'bold');
                doc.text(item.key, xReal, y);
                doc.setFont('helvetica', 'normal');
                doc.text(item.val, xReal + wKey, y);
                currentLineX += wTotal;
            });
            y += 6; 
        }
    }

    // Gabarito
    doc.addPage();
    aplicarCabecalhoRodape();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Gabarito e Resoluções', 105, 40, { align: 'center' });   
    y = 50; 
    coluna = 0;
    let paginaGabaritoInicial = true; 
    
    for (let i = 0; i < questoesSelecionadas.length; i++) {
         etapasConcluidas++;
         setProgresso(Math.round((etapasConcluidas / totalEtapas) * 100));
         if (i % 10 === 0) await wait(0);
         const questao = questoesSelecionadas[i];
         const resolucao = questao.detailedResolution || 'Sem resolução detalhada.';
         const temLatexRes = verificarLatex(sanitizeLatex(resolucao));

         if (temLatexRes) {
            try {
              const imgObj = await converterQuestaoParaImagem(questao, i, 'resolucao');
              if(!imgObj) continue;
              if (y + imgObj.height > 270) {
                 if (coluna === 0) {
                     coluna = 1; y = paginaGabaritoInicial ? 50 : 40;
                 } else {
                     doc.addPage(); paginaGabaritoInicial = false; 
                     aplicarCabecalhoRodape();
                     doc.setFontSize(10); doc.setFont('helvetica', 'italic');
                     doc.text('Continuação Gabarito', 105, 38, { align: 'center' });
                     coluna = 0; y = 40; 
                 }
              }
              const currentX = coluna === 0 ? 10 : 110;
              doc.addImage(imgObj.imgData, 'PNG', currentX, y, imgObj.width, imgObj.height);
              y += imgObj.height + 5; 
            } catch(e) {}
         } else {
             doc.setFontSize(10);
             const cabecalhoRes = `${i+1}) Resolução:`;
             const gabaritoTexto = questao.correctAlternative ? `Gabarito: ${questao.correctAlternative}` : '';          
             let alturaNecessaria = calcularAlturaTextoNativo(doc, cabecalhoRes, larguraColuna);
             if(gabaritoTexto) alturaNecessaria += calcularAlturaTextoNativo(doc, gabaritoTexto, larguraColuna);
             alturaNecessaria += calcularAlturaTextoNativo(doc, resolucao, larguraColuna) + 5;
             
             if (y + alturaNecessaria > 270) {
                if (coluna === 0) {
                   coluna = 1; y = paginaGabaritoInicial ? 50 : 40;
                } else {
                   doc.addPage(); paginaGabaritoInicial = false; 
                   aplicarCabecalhoRodape();
                   coluna = 0; y = 40; 
                }
             }
             const currentX = coluna === 0 ? 10 : 110;       
             y = renderizarTextoNativo(doc, cabecalhoRes, currentX, y, larguraColuna, true);
             if(gabaritoTexto) y = renderizarTextoNativo(doc, gabaritoTexto, currentX, y, larguraColuna, true);
             doc.setTextColor('#cc0000');
             doc.setFont('helvetica', 'italic');
             const linhasRes = doc.splitTextToSize(resolucao, larguraColuna);
             doc.text(linhasRes, currentX, y);
             y += (linhasRes.length * doc.getFontSize() * 1.15 * 0.352777) + 5;
             doc.setTextColor('#000000');
         }
    }
    setGerandoPDF(false); 
    setProgresso(100);
    if (preview) window.open(doc.output('bloburl'), '_blank');
    else doc.save(`${projeto.name || 'prova_unemat'}.pdf`);
  }

  const abrirModalInfo = (questao) => { setQuestaoSelecionada(questao); setModalInfoAberto(true); };
  const fecharModalInfo = () => { setModalInfoAberto(false); setQuestaoSelecionada(null); };

  return (
    <div className={styles.container}>
      <img src={tema} alt="Tema" className={styles.tema} />
      <div ref={printRef} style={{ position: 'absolute', top: 0, left: '-9999px', width: '400px', background: '#fff' }} />

      {gerandoPDF && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
              <h3>Gerando PDF... Por favor aguarde.</h3>
              <div style={{ width: '300px', height: '20px', backgroundColor: '#ddd', borderRadius: '10px', marginTop: '15px', overflow: 'hidden' }}>
                  <div style={{ width: `${progresso}%`, height: '100%', backgroundColor: '#007bff', transition: 'width 0.3s' }}></div>
              </div>
              <p style={{ marginTop: '10px' }}>{progresso}% concluído</p>
          </div>
      )}

      {/* ========== MODAL SALVAR =========== */}
      {modalSalvarAberto && (
        <ModalSalvarProva 
           fechar={() => setModalSalvarAberto(false)}
           salvar={salvarProva}
           setNomeProva={setNomeProva}
           setFaseProva={setFaseProva}
           nomeProva={nomeProva}
           faseProva={faseProva}
           gerarPDF={gerarPDF} // Passando a função para o modal se ele tiver botão de PDF
        />
      )}
      
      {modalInfoAberto && questaoSelecionada && (
        <ModalInfoQuestao questao={questaoSelecionada} fechar={fecharModalInfo} />
      )}

      <h2 className={styles.sectionTitle}>Buscar Questões</h2>
      
      {/* ========== FILTROS =========== */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <SearchBar 
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            onDebouncedChange={handleSearch}
            delay={400}
            placeholder="Digite o nome da questão..."
          />
        </div>
        <Select 
            classNamePrefix="react-select" isSearchable isMulti
            options={opcoesAno} placeholder="Filtrar por Ano"
            value={anosSelecionados}
            onChange={handleAnoSelecionado}
            styles={{ control: (base) => ({ ...base, minHeight: '45px', borderRadius: '6px' }), multiValue: (base) => ({ ...base, backgroundColor: '#e7f1ff' }) }}
        />
        <select className={styles.filterSelect} value={dificuldade} onChange={(e) => { setDificuldade(e.target.value); setMostrarQuestoes(true); }}>
            <option value="">Grau de Dificuldade</option>
            <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>
        </select>
        <input type="text" className={styles.filterInput} placeholder="Buscar por Habilidade (Cód.)" value={habilidade} onChange={(e) => { setHabilidade(e.target.value); setMostrarQuestoes(true); }} />  
        <input type="text" className={styles.filterInput} placeholder="Nível de Categoria" value={phaseLevel} onChange={(e) => { setPhaseLevel(e.target.value); setMostrarQuestoes(true); }} />
      </div>
      
      {/* ========== RESULTADOS =========== */}
      <div className={styles.resultsSection}>
        {mostrarQuestoes && (
          <>
            <h2 className={styles.sectionTitle}>Resultados da busca</h2>
            <ul className={styles.questoesList}>
              {questoesFiltradas.map((questao) => (
                <li className={styles.questionCard} key={questao.id}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                        <strong className={styles.cardTitle}>{questao.name}</strong>
                        <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => abrirModalInfo(questao)} title="Ver detalhes"><BsFillInfoCircleFill /></button>
                    </div>
                    <div className={styles.tagsWrapper}>
                        <span className={`${styles.tag} ${styles.tagDifficulty}`}> <strong>Dif:</strong> {questao.difficultyLevel}</span>
                        <span className={styles.tag}><strong>Ano:</strong> {questao.serieAno}</span>
                        <span className={styles.tag} title={questao.questionStatement}> {questao.questionStatement?.substring(0, 60)}...</span>
                    </div>
                  </div>
                  <div className={styles.actionsGroup}>
                    <button className={`${styles.btn} ${styles.btnAdd}`} onClick={() => handleSelecionarQuestao(questao)} title="Adicionar">+</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* ========== QUESTÕES SELECIONADAS (COM DRAG AND DROP) =========== */}
      <div className={styles.selectedSection}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 className={styles.sectionTitle}>Questões Selecionadas</h2>
             <div>
                <button className={styles.btnSalvar} onClick={() => setModalSalvarAberto(true)} style={{marginRight: '10px'}}>Salvar Prova</button>
                <button className={styles.btnSalvar} onClick={() => gerarPDF(false)} style={{backgroundColor: '#dc3545'}}>Gerar PDF</button>
             </div>
         </div>

         <DragDropContext onDragEnd={handleOnDragEnd}>
             <Droppable droppableId="selected-questions">
                {(provided) => (
                   <ul className={styles.questoesList} {...provided.droppableProps} ref={provided.innerRef}>
                      {questoesSelecionadas.length === 0 && <p className={styles.emptyState}>Sua prova ainda está vazia.</p>}
                      
                      {questoesSelecionadas.map((questao, index) => (
                        <Draggable key={String(questao.id)} draggableId={String(questao.id)} index={index}>
                           {(provided) => (
                              <li 
                                className={styles.questionCard} 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style, borderLeft: '5px solid #007bff' }}
                              >
                                 <div className={styles.cardContent}>
                                      <div className={styles.cardHeader}>
                                          <span style={{marginRight: '10px', fontWeight: 'bold', color: '#007bff'}}>#{index + 1}</span>
                                          <strong className={styles.cardTitle}>{questao.name}</strong>
                                          <button className={`${styles.btn} ${styles.btnInfo}`} onClick={() => abrirModalInfo(questao)}><BsFillInfoCircleFill /></button>
                                      </div>
                                      <div className={styles.tagsWrapper}>
                                          <span className={styles.tag}>{questao.questionStatement?.substring(0, 80)}...</span>
                                      </div>
                                 </div>
                                 <div className={styles.actionsGroup}>
                                      <button className={`${styles.btn} ${styles.btnRemove}`} onClick={() => handleRemoverQuestao(questao.id)} title="Remover"><BsFillTrashFill /></button>
                                 </div>
                              </li>
                           )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                   </ul>
                )}
             </Droppable>
         </DragDropContext>
      </div>
    </div>
  );
}

export default MontarProva;