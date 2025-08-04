import PropTypes from 'prop-types';
import styles from './ModalSalvarProva.module.css'; 

// Componente ModalSalvarProva recebe props para controlar exibição e inputs
function ModalSalvarProva({ isOpen, onClose, onConfirm, nomeProva, fase, ano, setNomeProva, setFase, setAno }) {
 // Função para confirmar e fechar o modal
    if (!isOpen) return null;
 
  return (
    // Renderiza o modal se isOpen for true
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Informações da Prova</h2>
        {/* Inputs para nome da prova, fase e ano*/}
        <label>Nome da Prova:</label>
        <input type="text" value={nomeProva} onChange={(e) => setNomeProva(e.target.value)} />

        <label>Fase:</label>
        <input type="text" value={fase} onChange={(e) => setFase(e.target.value)} />
        
        <label>Ano:</label>
        <input type="text" value={ano} onChange={(e) => setAno(e.target.value)} />
        
        <div className={styles.actions}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={onConfirm}>Salvar</button>
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
  ano: PropTypes.string.isRequired,
  setNomeProva: PropTypes.func.isRequired,
  setFase: PropTypes.func.isRequired,
  setAno: PropTypes.func.isRequired,
};

export default ModalSalvarProva;
