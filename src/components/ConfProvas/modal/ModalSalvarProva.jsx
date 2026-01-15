import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './ModalSalvarProva.module.css';

// Opções de anos escolares (Idêntico ao filtro do pai para consistência)
const opcoesAno = [
  { value: '4', label: '4º Ano' },
  { value: '5', label: '5º Ano' },
  { value: '6', label: '6º Ano' },
  { value: '7', label: '7º Ano' },
  { value: '8', label: '8º Ano' },
  { value: '9', label: '9º Ano' },
  { value: '1', label: '1º Médio' },
  { value: '2', label: '2º Médio' },
  { value: '3', label: '3º Médio' },
];

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
  const [error, setError] = useState('');

  // Limpa erros sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  // Função de validação e confirmação
  const handleConfirm = () => {
    // Validação simples para garantir consistência dos dados
    if (!nomeProva.trim() || !fase.trim() || !anosSelecionados || anosSelecionados.length === 0) {
      setError('⚠️ Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setError('');
    onConfirm(); // Executa a função de salvar do componente pai
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
            <h2>Salvar Prova</h2>
            <p>Confirme os dados gerados automaticamente antes de finalizar.</p>
        </div>

        <div className={styles.modalBody}>
            {/* Grupo: Nome da Prova */}
            <div className={styles.formGroup}>
                <label htmlFor="nomeProva">Nome da Prova <span className={styles.required}>*</span></label>
                <input 
                  id="nomeProva"
                  type="text" 
                  className={styles.input}
                  value={nomeProva} 
                  onChange={(e) => setNomeProva(e.target.value)} 
                  placeholder="Ex: olimpíadas de matemática 2024 - 1ª fase"
                />
            </div>

            {/* Grupo: Fase e Status (Lado a Lado) */}
            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label htmlFor="fase">Fase / Etapa <span className={styles.required}>*</span></label>
                    <input 
                      id="fase"
                      type="text" 
                      className={styles.input}
                      value={fase} 
                      onChange={(e) => setFase(e.target.value)} 
                      placeholder="Ex: 1ª Fase"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select 
                        id="status"
                        className={styles.selectNative}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Revisão">Em Revisão</option>
                        <option value="Pronta">Pronta</option>
                    </select>
                </div>
            </div>

            {/* Grupo: Anos Escolares */}
            <div className={styles.formGroup}>
                <label>Anos Escolares <span className={styles.required}>*</span></label>
                <Select
                  classNamePrefix="react-select"
                  isSearchable
                  options={opcoesAno}
                  isMulti
                  placeholder="Selecione os anos..."
                  value={anosSelecionados}
                  onChange={(selected) => setAnosSelecionados(selected || [])}
                  closeMenuOnSelect={false}
                  styles={{
                    control: (base, state) => ({
                      ...base, 
                      minHeight: '45px',
                      borderRadius: '6px',
                      borderColor: state.isFocused ? '#007bff' : '#ced4da',
                      boxShadow: state.isFocused ? '0 0 0 1px #007bff' : 'none',
                      '&:hover': { borderColor: '#007bff' }
                    }),
                    multiValue: (base) => ({ ...base, backgroundColor: '#e7f1ff' }),
                    multiValueLabel: (base) => ({ ...base, color: '#007bff' }),
                  }}
                />
            </div>
            
            {/* Mensagem de Erro */}
            {error && <div className={styles.errorBanner}>{error}</div>}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button className={styles.btnSave} onClick={handleConfirm}>Confirmar e Salvar</button>
        </div>
      </div>
    </div>
  );
}

ModalSalvarProva.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  nomeProva: PropTypes.string,
  fase: PropTypes.string,
  anosSelecionados: PropTypes.array,
  status: PropTypes.string,
  setNomeProva: PropTypes.func.isRequired,
  setFase: PropTypes.func.isRequired,
  setAnosSelecionados: PropTypes.func.isRequired,
  setStatus: PropTypes.func.isRequired,
};

export default ModalSalvarProva;