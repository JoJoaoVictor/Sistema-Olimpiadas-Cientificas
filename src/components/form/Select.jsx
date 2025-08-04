import styles from './Select.module.css';
import PropTypes from 'prop-types';

function Select({ text, name, options, handleOnChange, value }) {
    // Garante que options é sempre um array antes do map
    const safeOptions = Array.isArray(options) ? options : [];

    return (
        <div className={styles.form_control}>
            <label htmlFor={name}>{text}:</label>
            <select 
                name={name} 
                id={name} 
                onChange={handleOnChange} 
                value={value || ''}
            >
                {/* Primeira opção padrão */}
                <option value="">Selecione uma opção</option>

                {/* Renderiza as opções dinamicamente */}
                {safeOptions.map((option) => (
                    <option value={option.id} key={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Tipagem das props
Select.propTypes = {
    text: PropTypes.string.isRequired,               // Texto do rótulo
    name: PropTypes.string.isRequired,               // Nome do input
    options: PropTypes.arrayOf(                      // Lista de opções com id e name
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    handleOnChange: PropTypes.func.isRequired,       // Função de mudança
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) // Valor atual
};

export default Select;
