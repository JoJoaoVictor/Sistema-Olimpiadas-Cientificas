import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './ModalSalvarProva.module.css';

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

  // ESTADO LOCAL: Todos os campos agora são controlados localmente para garantir a validação
  const [localNome, setLocalNome] = useState('');
  const [localFase, setLocalFase] = useState('');
  const [localAnos, setLocalAnos] = useState([]); // Novo estado local para Anos

  // Carrega os dados iniciais APENAS quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setLocalNome(nomeProva || '');
      setLocalFase(fase || '');
      setLocalAnos(anosSelecionados || []); // Sincroniza anos iniciais
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); 

  if (!isOpen) return null;

  // Atualiza Nome Local e avisa o pai
  const handleChangeNome = (e) => {
    const valor = e.target.value;
    setLocalNome(valor);
    if (setNomeProva) setNomeProva(valor);
  };

  // Atualiza Fase Local e avisa o pai
  const handleChangeFase = (e) => {
    const valor = e.target.value;
    setLocalFase(valor);
    if (setFase) setFase(valor);
  };

  // Atualiza Anos Locais e avisa o pai (CORREÇÃO DO ERRO DE VALIDAÇÃO)
  const handleChangeAnos = (selected) => {
    const valor = selected || [];
    setLocalAnos(valor); // Atualiza visualmente e para validação imediata
    if (setAnosSelecionados) setAnosSelecionados(valor);
  };

  const handleConfirm = () => {
    // Valida usando EXCLUSIVAMENTE os estados locais (o que você vê na tela)
    // Isso impede que atrasos do pai causem falso erro de "campo vazio"
    if (!localNome.trim() || !localFase.trim() || !localAnos || localAnos.length === 0) {
      setError('⚠️ Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Garante sincronia final antes de salvar
    if (setNomeProva) setNomeProva(localNome);
    if (setFase) setFase(localFase);
    if (setAnosSelecionados) setAnosSelecionados(localAnos);

    setError('');
    onConfirm(); 
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
                  value={localNome} 
                  onChange={handleChangeNome} 
                  placeholder="Ex: OM_2024_NÍVEL I_FASE 1"
                />
            </div>

            {/* Grupo: Fase e Status */}
            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label htmlFor="fase">Fase / Etapa <span className={styles.required}>*</span></label>
                    <input 
                      id="fase"
                      type="text" 
                      className={styles.input}
                      value={localFase} 
                      onChange={handleChangeFase} 
                      placeholder="Ex: 1ª FASE"
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
                  value={localAnos} // AGORA USA O ESTADO LOCAL
                  onChange={handleChangeAnos} // AGORA CHAMA O HANDLER LOCAL
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