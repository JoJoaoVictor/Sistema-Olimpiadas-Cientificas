import { FiAlertTriangle } from 'react-icons/fi';
import styles from '../AdminUsers.module.css';

function DeleteConfirmationModal({ userToDelete, onConfirm, onCancel }) {
  if (!userToDelete) return null;

  return (
    <div className={styles.modal_overlay} onClick={onCancel}>
      <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
        <div className={styles.modal_header_danger}>
          <FiAlertTriangle size={40} />
        </div>
        <h3>Excluir Usuário?</h3>
        <p>
          Tem certeza que deseja remover <strong>{userToDelete.name}</strong>?
          <br />
          Essa ação não pode ser desfeita.
        </p>
        <div className={styles.modal_actions}>
          <button className={styles.btn_cancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.btn_confirm_danger} onClick={onConfirm}>
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
