import { useState, useEffect } from 'react';
import styles from './Prova.module.css';
import { gerarPDF } from '../../ConfProvas/pdfUtils'; 
import SearchBar from '../../form/SearchBar';

function Prova() {
  const [provas, setProvas] = useState([]);
  const [searchDate, setSearchDate] = useState('');
  const [provasFiltradas, setProvasFiltradas] = useState([]);

  // Estado para armazenar o filtro de série/ano e dificuldade
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [mostrarQuestoes, setMostrarQuestoes] = useState(false); // Só mostramos as questões após o filtro

  // Carrega todas as provas montadas ao iniciar o componente
  useEffect(() => {
    fetch('http://localhost:5000/provasMontadas')
      .then(res => res.json())
      .then(data => setProvas(data))
      .catch(err => console.log(err));
  }, []);
/*
  const questoesFiltradas = mostrarQuestoes
  ? questoes.filter(q =>
      q.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      q.abilityCode?.toLowerCase().includes(habilidade.toLowerCase()) &&
      q.phaseLevel?.toLowerCase().includes(phaseLevel.toLowerCase()) &&
      (dificuldade === '' || String(q.difficultyLevel) === dificuldade) &&
      (anosSelecionados.length === 0 || anosSelecionados.map((a) => normalizarAno(a.value)).includes(normalizarAno(q.serieAno))) 
    )
  : [];
*/
  // Filtra as provas por data (com base no campo createdAt)
  useEffect(() => {
    if (searchDate) {
      setProvasFiltradas(provas.filter(prova => {
        const dataFormatada = prova.createdAt?.split(' ')[0];
        return dataFormatada === new Date(searchDate).toLocaleDateString('pt-BR');
      }));
    } else {
      setProvasFiltradas(provas);
    }
  }, [searchDate, provas]);

  // Chama o gerador de PDF com visualização das questões predefinidas 
  function visualizarPDF(prova) {
    gerarPDF(prova.questoes, prova, true); 
  }

  return (
    <div className={styles.container}>
      <div>
        <h2>Provas Salvas</h2>
          {/*Campo de busca*/
          <br />

          /*
          nome da prova:
          ano: 4°ano e 5° assim em diante. 
          fase da prova:
          provas ja aplicada:
          provas em analise:
          data de criação:

          */}
      </div>
      <div className={styles.provas_container}>
        <div className={styles.provas_list}>
          {provasFiltradas.length === 0 
            ? <p>Nenhuma prova encontrada para essa data.</p>
            : provasFiltradas.map(prova => (
              <div key={prova.id} className={styles.prova_card}>
                <h4>{prova.name}</h4>
                <p>{prova.createdAt || 'Não informada'}</p>
                <p>Quantidade de questões: {prova.questoes?.length || 0}</p>
                  
                    <button className={styles.prova_button} onClick={() => window.location.href = `/provas/${prova.id}`}>Editar</button>
                    <button onClick={() => visualizarPDF(prova)}>Visualizar PDF</button>
                  
                  
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

export default Prova;
