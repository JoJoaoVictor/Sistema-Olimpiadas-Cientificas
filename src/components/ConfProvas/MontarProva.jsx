import { useState, useEffect } from 'react';
import { BsFillTrashFill, BsFillInfoCircleFill } from 'react-icons/bs';
import Select from 'react-select'; 
import { useParams } from 'react-router-dom';
import styles from './MontarProva.module.css';
import SearchBar from '../form/SearchBar';
import jsPDF from 'jspdf';
import cabecalho from '../../img/heder.png'; // Imagem do cabeçalho
import rodape from '../../img/footer.png'; // Imagem do rodapé
import tema from '../../img/tema.png'; // Imagem do tema
import { info } from 'autoprefixer';
import ModalSalvarProva from './modal/ModalSalvarProva';

function MontarProva() {
  // Estados para armazenar os dados do projeto e questões
  const [projeto, setProjeto] = useState({});
  const [questoes, setQuestoes] = useState([]); // Todas as questões salvas no db
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState([]); // Questões escolhidas pelo usuário para montar a prova
  const { id } = useParams(); // Pegamos o ID do projeto via rota
  const [searchTerm, setSearchTerm] = useState('');
  const [habilidade, setHabilidade] = useState('');
  const [phaseLevel, setPhaseLevel] = useState(''); // Nível da fase, ex: 3ª fase

  // Estado para armazenar o filtro de série/ano e dificuldade
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [dificuldade, setDificuldade] = useState('');
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false); // Só mostramos as questões após o filtro

  // Estado para controlar abertura do modal
  const [modalAberto, setModalAberto] = useState(false);
  // Estados para armazenar as informações do formulário dentro do modal
  const [nomeProva, setNomeProva] = useState('');
  const [faseProva, setFaseProva] = useState('');
  const [anoProva, setAnoProva] = useState('');

  // Atualiza o estado de busca e ativa a exibição das questões
  const handleSearch = (term) => {
    setSearchTerm(term);
    setMostrarQuestoes(true);
  };

  // Buscar os dados do projeto atual e todas as questões
useEffect(() => {
  if (id) {
    fetch(`http://localhost:5000/provasMontadas/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Prova com ID ${id} não encontrada`);
        return res.json();
      })
      .then(data => {
        setProjeto(data);
        setQuestoesSelecionadas(data.questoes || []);
      })
      .catch(err => console.log(err));
  }
  
  fetch('http://localhost:5000/questõesAprovadas')
    .then(res => res.json())
    .then(data => setQuestoes(data))
    .catch(err => console.log(err));
}, [id]);

   // Move a questão uma posição para cima
const moverQuestaoParaCima = (index) => {
  if (index > 0) {
    const novaLista = [...questoesSelecionadas];
    const temp = novaLista[index - 1];
    novaLista[index - 1] = novaLista[index];
    novaLista[index] = temp;
    setQuestoesSelecionadas(novaLista);
  }
};

// Move a questão uma posição para baixo
const moverQuestaoParaBaixo = (index) => {
  if (index < questoesSelecionadas.length - 1) {
    const novaLista = [...questoesSelecionadas];
    const temp = novaLista[index + 1];
    novaLista[index + 1] = novaLista[index];
    novaLista[index] = temp;
    setQuestoesSelecionadas(novaLista);
  }
};


  // Função para lidar com a seleção de anos
    const opcoesAno = [
      { value: '4º', label: '4º' },
      { value: '5º', label: '5º' },
      { value: '6º', label: '6º' },
      { value: '7º', label: '7º' },
      { value: '8º', label: '8º' },
      { value: '9º', label: '9º' },
      { value: '1º', label: '1º' },
      { value: '2º', label: '2º' },
      { value: '3º', label: '3º' },
    ];

// Adiciona ou remove o ano da lista de anos selecionados
  const handleAnoSelecionado = (ano) => {
    setMostrarQuestoes(true);
    if (anosSelecionados.includes(ano)) {
      // Remove o ano se já estiver selecionado
      setAnosSelecionados(anosSelecionados.filter(item => item !== ano));
    } else {
      // Adiciona o ano à lista
      setAnosSelecionados([...anosSelecionados, ano]);
    }
  };
  // Normaliza o ano para facilitar a comparação
  // Remove caracteres especiais e espaços, e converte para minúsculas
  const normalizarAno = (valor) =>
  String(valor || '')
    .toLowerCase()
    .replace('º', '')
    .replace('°', '')
    .replace('ano', '')
    .replace('ano', 'ano')
    .replace('mediomedio', 'medio') // caso venha duplicado
    .replace(/\s/g, '')
    .trim();


  // Adiciona uma questão à lista se ainda não estiver presente
  function handleSelecionarQuestao(questao) {
    if (!questoesSelecionadas.find(q => q.id === questao.id)) {
      setQuestoesSelecionadas([...questoesSelecionadas, questao]);
    }
  }

  // Remove uma questão da lista
  function handleRemoverQuestao(idQuestao) {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== idQuestao));
  }

  // Salva a prova no array provasMontadas
 function salvarProva() {
  // Gera data atual formatada (ex: 16/06/2025 às 14:30)
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Monta o objeto da prova com a data 
  const novaProva = {
  ...projeto,
    id: projeto.id || Date.now(),
    name: nomeProva || `Prova ${Date.now()}`,
    fase: faseProva,
    ano: anoProva,
    questoes: questoesSelecionadas,
    createdAt: projeto.createdAt || dataFormatada
    
  };

  // Define se será PUT ou POST 
  const method = projeto.id ? 'PUT' : 'POST';
  const endpoint = projeto.id
    ? `http://localhost:5000/provasMontadas/${projeto.id}`
    : `http://localhost:5000/provasMontadas`;
  // Faz a requisição para salvar a prova
  fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(novaProva),
  })
    .then(resp => {
      if (!resp.ok) throw new Error('Erro ao salvar prova');
      return resp.json();
    })
    .then(() => {
      alert('Prova salva com sucesso!');
      setModalAberto(false);
    })
    .catch(err => console.error('Erro ao salvar prova:', err));
}

  // Aplica os filtros apenas quando mostrarQuestoes for true
const questoesFiltradas = mostrarQuestoes
  ? questoes.filter(q =>
      q.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      q.abilityCode?.toLowerCase().includes(habilidade.toLowerCase()) &&
      q.phaseLevel?.toLowerCase().includes(phaseLevel.toLowerCase()) &&
      (dificuldade === '' || String(q.difficultyLevel) === dificuldade) &&
      (anosSelecionados.length === 0 || anosSelecionados.map((a) => normalizarAno(a.value)).includes(normalizarAno(q.serieAno))) 
    )
  : [];



  // Função para gerar o PDF com as questões selecionadas
function gerarPDF(preview = false) {
  if (questoesSelecionadas.length === 0) {
    alert('Selecione pelo menos uma questão para gerar o PDF.');
    return;
  }
  // Configurações do PDF CABECALHO e RODAPÉ
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const colunaLargura = 90;
  const margemEntreColunas = 1;
  // Função para aplicar o cabeçalho e rodapé AUTOMATICAMENTE
  function aplicarCabecalhoRodape() {
    const imgCab = new Image();
    imgCab.src = cabecalho;
    doc.addImage(imgCab, 'PNG', 10, 5, 190, 30);

    const imgRod = new Image();
    imgRod.src = rodape;
    doc.addImage(imgRod, 'PNG', 18, 280, 170, 17);
  }
      // CAPA
    aplicarCabecalhoRodape();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('OLIMPÍADA DE MATEMÁTICA DA UNEMAT – 2024 – 3ª FASE – 4º e 5º Anos', 34, 38);
    doc.setFont('helvetica', 'normal');
    doc.text('ALUNO(A): __________________________________________________________________________________', 14, 44);
    doc.text('ESCOLA: _____________________________________________', 14, 51);
    doc.text('MUNICÍPIO: ___________________________', 120, 51);
    
  function renderQuestoes(questoes, incluirResposta = false) {
    let y = 60;
    let coluna = 0;

    aplicarCabecalhoRodape();

    doc.setFontSize(10);

    questoes.forEach((questao, index) => {
      const startX = coluna === 0 ? 10 : pageWidth / 2 + margemEntreColunas;
      const larguraTexto = colunaLargura;

      // Título
     // Enunciado justificado com número da questão
      doc.setFont('helvetica', 'bold');
      const enunciado = doc.splitTextToSize(`${index + 1}) ${questao.questionStatement || 'Sem enunciado'}`, larguraTexto);
      doc.text(enunciado, startX, y, { maxWidth: larguraTexto, align: 'justify' });
      y += enunciado.length * 5;


      // Alternativas horizontalmente (regex)
      if (typeof questao.alternatives === 'string') {
        const matches = questao.alternatives.match(/([a-e]\)\s[^a-e]*)/gi);
        if (matches) {
          const altLinha = matches.join('   ');
          const altLines = doc.splitTextToSize(altLinha, larguraTexto);
          doc.text(altLines, startX, y);
          y += altLines.length * 6;

        }
      }
// Resolução da questão
if (incluirResposta) {
  // Espaço antes da resolução
  y += 2;

  // Título "Resolução"
  doc.setFont('helvetica', 'italic');
  doc.text('Resolução:', startX, y);
  y += 5;

  // Texto da resolução em vermelho
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 0, 0); // Vermelho

  // Quebra automática da resolução conforme largura da coluna
  const resolucao = questao.detailedResolution || 'Sem resolução';
  const resolucaoLines = doc.splitTextToSize(resolucao, larguraTexto);

  // Renderiza resolução em vermelho com quebra
  doc.text(resolucaoLines, startX, y);
  y += resolucaoLines.length * 6;

  doc.setTextColor(0, 0, 0); // Reseta cor para preto
} else {
  // Primeira parte da prova: espaço em branco para aluno responder
  y += 2;
 
  y += 5;

  // Espaços em branco com linhas
  doc.setLineWidth(0.1);

}

      // Verifica se precisa mudar de coluna ou adicionar página
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

  // Primeira parte: Prova sem respostas
  renderQuestoes(questoesSelecionadas, false);

  // Segunda parte: Prova com resoluções
  doc.addPage();
  aplicarCabecalhoRodape();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Prova com Resoluções', 65, 40);
  renderQuestoes(questoesSelecionadas, true);

  // Visualização ou download
  if (preview) {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${projeto.name || 'prova_unemat'}.pdf`);
  }
}


  return (
    <div className={styles.container}>
      <img src={tema} alt="Tema" className={styles.tema} />
     
        <h2>Buscar Questões</h2>

        {/* Barra de busca por nome */}
        <div style={{ marginLeft: '6px', paddingBottom: '10px'}}>
            <SearchBar 
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              onDebouncedChange={handleSearch}
              delay={400}
            />
        </div>

      <div className={styles.select_container}>

       {/* Filtro por grau de ensino - ainda não implementado */}
          <select>
          <option value="">Grau de ensino</option>
          <option value="">Fundamental I</option>
          <option value="">Fundamental II</option>
          <option value="">Ensino Médio</option>
        </select>
        
        {/* Filtro por unidade temática - ainda não implementado */}
        <select>
          <option value="tema">Unidade Temática</option>
            <option value="tema1"> Álgebra </option>
            <option value="tema2"> Geometria </option> 
            <option value="tema3"> Grandezas e Medidas </option>
            <option value="tema4"> Números </option>
            <option value="tema5"> Probabilidade e estatística </option>
            <option value="tema6"> Álgebra / Geometria </option>
            <option value="tema7"> Probabilidade </option>
            <option value="tema8"> Estatística </option>
        </select>
        
        {/* Filtro por objetos de conhecimento - ainda não implementado */}
        <select>
          <option value="">Objetos de Conhecimento</option>
        </select>

        {/* Filtro por nível de dificuldade */}
        <select
          value={dificuldade}
          onChange={(e) => {
            setDificuldade(e.target.value);
            setMostrarQuestoes(true);
          }}
        >
          <option value="">Nível de Dificuldade</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
           {/* Filtro por código de habilidade */}
        <input 
          type="text"
          placeholder="Buscar habilidade"
          value={habilidade}
          onChange={(e) => {
            setHabilidade(e.target.value);
            setMostrarQuestoes(true);
          }}/>  
        {/* Filtro por fase */}
        <input  
          type="text"
          placeholder="Nível da Fase"
          value={phaseLevel}
          onChange={(e) => {
            setPhaseLevel(e.target.value);
            setMostrarQuestoes(true);
          }} />
              
        {/* Filtro por série/ano */}
              <Select className={styles.selct_ano}
                isSearchable
                options={opcoesAno}
                isMulti
                placeholder="Filtrar por Ano..."
                value={anosSelecionados}
                onChange={(selected) => {
                  setAnosSelecionados(selected || []);
                  setMostrarQuestoes(true);
                }}
                closeMenuOnSelect={false}
                isClearable
                styles={{
                  control: (base) => ({ 
                    ...base,
                    borderColor: '#ccc',
                    border: 'none',
                    outline: 'none', 
                    boxShadow: 'none', 

                  }),
                }}
              />
      </div>
      
      <div className={styles.questoes_container}>
          {/* Lista de questões filtradas */}
          {mostrarQuestoes && (
            <>
              <h2 style={{padding:'10px', marginTop:'-30px', marginLeft: '-10px'}}>Resultados da busca</h2>
                <ul style={{ padding: 0, width: '100%' }}>
                  {questoesFiltradas.map((questao) => (
                    // Renderiza cada questão filtrada
                    <li className={styles.list_item } key={questao.id} >
                      <div className={styles.list_content}>
                        <div>
                           <strong > {questao.name}</strong> 
                           <button className={styles.info_btn} onClick={() => info()}><BsFillInfoCircleFill /></button>
                        <br/>
                        <span style={{fontSize: '1em', color: '#555' }}>   
                        Dificuldade: {questao.difficultyLevel}/5 - 
                        Código: {questao.abilityCode} - 
                        Tema: {questao.bnccTheme}                        
                        <span> <p className={styles.categori_text}>
                          Serie /Ano: {questao.serieAno} -
                          Fase: {questao.phaseLevel} 
                          </p> 
                          
                        </span>
                          </span>
                           
                        </div>
                       
                        <button className={styles.add_bnt} onClick={() => handleSelecionarQuestao(questao)}> + </button>
                        
                      </div>
                    
                    </li>
                    
                  ))}
                </ul>
                {questoesFiltradas.length === 0 && <p>Nenhuma questão encontrada.</p>}

            </>
          )}
      </div>

      <div className={styles.questoes_container}>
         {/* Lista de questões selecionadas */}
         <h2 style={{padding:'10px', marginTop:'-40px', marginLeft: '-10px',}}>Questões Selecionadas: </h2>
          <ul style={{ padding: 0, width: '100%'}}>
            {questoesSelecionadas.map((questao, index) => (
              // Renderiza cada questão selecionada
              <li className={styles.list_item } key={questao.id}>
                 <div className={styles.list_content}>
                        <div>
                           <strong > {questao.name}</strong>
                           <button className={styles.info_btn} onClick={() => info()}><BsFillInfoCircleFill /></button>
                        <br/>
                        <span style={{fontSize: '1em', color: '#555' }}>   
                        Dificuldade: {questao.difficultyLevel}/5 - 
                        Código: {questao.abilityCode} - 
                        Tema: {questao.bnccTheme}                        
                        <span> <p className={styles.categori_text}>
                          Serie /Ano: {questao.serieAno} -
                          Fase: {questao.phaseLevel} 
                          </p> 
                        </span>
                          </span>
                        </div>
                      </div>
                        <button className={styles.setaBtn} onClick={() => moverQuestaoParaCima(index)}>⬆</button>
                        <button className={styles.setaBtn} onClick={() => moverQuestaoParaBaixo(index)}>⬇</button>
                        <button className={styles.remove_btn} onClick={() => handleRemoverQuestao(questao.id)}>
                          <BsFillTrashFill /> 
                        </button>
              </li>
            ))}
          </ul>
      </div>
      {/* Botão para salvar a prova */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
        <button className={styles.save_btn} onClick={() => setModalAberto(true)}>Salvar Prova</button>
        <button className={styles.visu_btn} onClick={() => gerarPDF(true)}>Visualizar PDF</button>


       </div>
            <ModalSalvarProva
            isOpen={modalAberto}
            onClose={() => setModalAberto(false)}
            onConfirm={salvarProva}
            nomeProva={nomeProva}
            fase={faseProva}
            ano={anoProva}
            setNomeProva={setNomeProva}
            setFase={setFaseProva}
            setAno={setAnoProva}
            />
    </div>
    
  );
}

export default MontarProva;
