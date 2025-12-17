// Prova.jsx
import { useState, useEffect } from 'react';
import styles from './Prova.module.css';
import { gerarPDF } from '../../ConfProvas/pdfUtils'; 
import { FiSearch } from 'react-icons/fi';
import { BsPencil } from 'react-icons/bs';
import Select from 'react-select';

function Prova() {
  const [provas, setProvas] = useState([]);
  const [provasFiltradas, setProvasFiltradas] = useState([]);

  // Estados dos filtros
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [anosSelecionados, setAnosSelecionados] = useState([]);
  const [faseSelecionada, setFaseSelecionada] = useState('');
  const [statusSelecionado, setStatusSelecionado] = useState('');

  // Carrega todas as provas montadas
  useEffect(() => {
    fetch('http://localhost:5000/provasMontadas')
      .then(res => res.json())
      .then(data => setProvas(data))
      .catch(err => console.log(err));
  }, []);

  // Aplica todos os filtros
  useEffect(() => {
    let filtradas = [...provas];

    // Filtro pelo nome
    if (searchName.trim() !== '') {
      filtradas = filtradas.filter(p =>
        p.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filtro por data
    if (searchDate) {
      const dataSelecionada = new Date(searchDate).toLocaleDateString('pt-BR');
      filtradas = filtradas.filter(p =>
        p.createdAt?.split(' ')[0] === dataSelecionada
      );
    }

    // Filtro por anos escolares (array de objetos)
    if (anosSelecionados.length > 0) {
    filtradas = filtradas.filter(p => {
      const anosDaProva = p.anos || []; // pega array de anos da prova
      return anosSelecionados.some(opt => anosDaProva.includes(opt.label));
    });
  }

    // Filtro por fase
      if (faseSelecionada) {
      filtradas = filtradas.filter(p => String(p.fase) === faseSelecionada);
    }
    // Filtro por Status
    if (statusSelecionado) {
    filtradas = filtradas.filter(p =>
      p.status === statusSelecionado
    );
  }

    setProvasFiltradas(filtradas);
  }, [searchName, searchDate, anosSelecionados, faseSelecionada, statusSelecionado, provas]);

  function visualizarPDF(prova) {
    gerarPDF(prova.questoes, prova, true);
  }

  // Lista fixa de anos (pode vir do backend)
  const opcoesAno = [
    { value: '4', label: '4º' },
    { value: '5', label: '5º' },
    { value: '6', label: '6º' },
    { value: '7', label: '7º' },
    { value: '8', label: '8º' },
    { value: '9', label: '9º' },
    { value: '1', label: '1º Médio' },
    { value: '2', label: '2º Médio' },
    { value: '3', label: '3º Médio' },
  ];

  // Lista fixa de fases
    const listaFases = [
    { value: '1', label: 'Fase 1' },
    { value: '2', label: 'Fase 2' },
    { value: 'Final', label: 'Final' }
  ];


  // Lista fixa de status
  const listaStatus = ['Aplicada', 'Pendente','Aprovada'];

  return (
    <div className={styles.container}>
      <h2>Provas Salvas</h2>
        {/* Buscar pelo nome */}
      <div className={styles.search_container}>
        <FiSearch className={styles.icon} />
        <input
          style={{ border: 'none', outline: 'none',fontSize: '1em' }}
          type="text"
          placeholder="Buscar prova..." 
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
        />
      </div>
      {/* Filtros */}
      <div className={styles.select}>
        {/* Filtro por ano */}
        <Select
          className={styles.select_anos}
          isSearchable
          options={opcoesAno}
          isMulti
          placeholder="Ano"
          value={anosSelecionados}
          onChange={selected => setAnosSelecionados(selected || [])}
          closeMenuOnSelect={false}
          isClearable
          styles={{
            control: base => ({
              ...base,        
              minHeight: '45px',
                    height: '50px',
                               border: '1px solid #ccc',
                              borderRadius: '5px',
                              outline: 'none', 
                              boxShadow: 'none',
                              '&:hover': {
                              border: '1px solid #000000', 
                              transition: '0.3s',
                              }, 
           
                             }),valueContainer: (base) => ({
                                ...base,
                                height: '45px',
                                padding: '0 0.6em',
                                overflow: 'auto', // Permite scroll se tiver muitos itens selecionados
                            }),
                            input: (base) => ({
                                ...base,
                                margin: 0,
                                padding: 0,
                            }),
                            indicatorsContainer: (base) => ({
                                ...base,
                                height: '45px',
                            }),
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: '#e0e0e0',
                            }),
                            multiValueLabel: (base) => ({
                                ...base,
                                color: '#797979',
                            }),
                            placeholder: (base) => ({
                                ...base,
                                color: '#797979',
                            }),
                            menu: (base) => ({
                                ...base,
                                zIndex: 9999, // Garante que o menu fique por cima
                            }),
                            }}
                    />


        {/* Filtro por fase */}
         <Select 
          className={styles.select_anos}
          options={listaFases}
          placeholder="Fase"
          value={listaFases.find(f => f.value === faseSelecionada) || null}
          onChange={selected => setFaseSelecionada(selected?.value || '')}
          isClearable
           styles={{
            control: base => ({
              ...base,
                              minHeight: '45px',
                              height: '50px',
                              border: '1px solid #ccc',
                              borderRadius: '5px',
                              outline: 'none', 
                              boxShadow: 'none',
                              '&:hover': {
                              border: '1px solid #000000', 
                              transition: '0.3s',
                              }, 
            }),
          }}
        />

        {/* Filtro por status */}
        <select style={{fontSize:'1em'}}
          value={statusSelecionado}
          onChange={e => setStatusSelecionado(e.target.value)}
        >
          <option value="">Todos os status</option>
          {listaStatus.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        {/* Filtro por data */}
        <input style={{fontSize:'1em', padding:'5px', borderRadius:'5px', border:'1px solid #ccc'}}
          type="date"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
        />
      </div>

    

      {/* Lista de provas */}
      <div className={styles.provas_container}>
        <div className={styles.provas_list}>
          <h2 style={{ padding: '5px', marginTop: '20px', marginLeft: '10px' }}>
            Resultados da busca
          </h2>
          {provasFiltradas.length === 0 ? (
            <p>Nenhuma prova encontrada.</p>
          ) : (
            provasFiltradas.map(prova => (
              <div key={prova.id} className={styles.prova_card}>
                <div className={styles.prova_card_item}>
                  {/* Nome da prova  */}
                  <h3>
                {prova.name}
                    </h3>
                 
                   {/* Informações adicionais como Fase, ano, data e status  */}
                  <span >
                    <p style={{  color: '#555' }}> <strong>Ano escolar:</strong> {(prova.anos || []).join(', ') || 'Não informado'}
                    <strong> - Fase:</strong> {prova.fase || 'Não informada'}</p>
                  </span>
                 <span className={styles.status}>
                  <span className={styles[prova.status?.toLowerCase()]}></span> {/* Círculo colorido */}
                  <p style={{ color: '#555' }}>
                    <strong> Status:</strong> {prova.status || 'Não informado'}
                    <strong> - Última modificação:</strong> {prova.createdAt || 'Não informada'}
                  </p>
                </span>
                </div>
                <div className={styles.prova_card_buttons}>
                  <button
                    className={styles.edit_btn}
                    onClick={() => window.location.href = `/provas/${prova.id}`}
                  >
                    <BsPencil />
                  </button >
                  <button className={styles.view_btn} onClick={() => visualizarPDF(prova)}><FiSearch/></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Prova;
