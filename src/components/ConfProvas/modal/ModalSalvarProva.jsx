import PropTypes from 'prop-types';
import { useState } from 'react';
import Select from 'react-select';
import styles from './ModalSalvarProva.module.css';

// Opções de anos escolares
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

// Componente ModalSalvarProva
function ModalSalvarProva({ 
  isOpen, 
  onClose, 
  onConfirm, 
  nomeProva, 
  fase, 
  anosSelecionados, 
  status, 
  setNomeProva, 
  setFase, 
  setAnosSelecionados,
  setStatus 
}) {
  // Estado local para mensagens de erro
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Função para validar campos e salvar
  const handleConfirm = () => {
    if (!nomeProva.trim() || !fase.trim() || anosSelecionados.length === 0 || !status.trim()) {
      setError('⚠️ Todos os campos devem ser preenchidos!');
      return;
    }
    setError('');
    onConfirm(); // Chama função do pai
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Informações da Prova</h2>

        {/* Nome da Prova */}
        <label>Nome da Prova:</label>
        <input 
          type="text" 
          value={nomeProva} 
          onChange={(e) => setNomeProva(e.target.value)} 
        />

        {/* Fase */}
        <label>Fase:</label>
        <input 
          type="text" 
          value={fase} 
          onChange={(e) => setFase(e.target.value)} 
        />

        {/* Anos Escolares */}
        <label>Anos:</label>
        <Select
          style={{ outline: 'none' }}
          className={styles.select_anos}
          isSearchable
          options={opcoesAno}
          isMulti
          placeholder="Selecione os anos"
          value={anosSelecionados}
          onChange={(selected) => setAnosSelecionados(selected || [])}
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

        {/* Status da Prova */}
        <label>Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Selecione...</option>
          <option value="Pendente">Pendente</option>
          <option value="Aplicada">Aplicada</option>
        </select>

        {/* Exibe erro se algum campo estiver vazio */}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleConfirm}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// Validação das props
ModalSalvarProva.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  nomeProva: PropTypes.string.isRequired,
  fase: PropTypes.string.isRequired,
  anosSelecionados: PropTypes.array.isRequired, // agora é array
  status: PropTypes.string.isRequired,
  setNomeProva: PropTypes.func.isRequired,
  setFase: PropTypes.func.isRequired,
  setAnosSelecionados: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
};

export default ModalSalvarProva;
