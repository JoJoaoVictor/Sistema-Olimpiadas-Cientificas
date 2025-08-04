import PropTypes from 'prop-types'; // Importa prop-types para validar as props
import styles from './SubmitButton.module.css';

function SubmitButton({ text }) {
    return (
        <div>
            <button className={styles.btn}>{text}</button>
        </div>
    );
}

// Validação das props para evitar erro do ESLint
SubmitButton.propTypes = {
    text: PropTypes.string.isRequired, // text deve ser uma string obrigatória
};

export default SubmitButton;
