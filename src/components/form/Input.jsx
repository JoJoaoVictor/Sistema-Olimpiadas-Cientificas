import PropTypes from 'prop-types';
import styles from './Input.module.css';

function Input({ 
  type = 'text',               // Valor padrão adicionado aqui
  text = '',                   // Valor padrão para texto
  name = '',                   // Valor padrão para nome
  placeholder = '',            // Valor padrão movido para parâmetros
  handleOnChange = () => {},   // Função padrão vazia
  value = '',                  // Valor padrão vazio
  img = null,                  // Imagem padrão nula
  hasError = false             // Erro padrão false
}) {
  return (
    <div className={styles.form_control}>
      <label htmlFor={name}>{text}:</label>

      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        onChange={handleOnChange}
        value={value}
        className={hasError ? styles.error : ''}
      />

      {img && <img src={img} alt="ícone do campo" />}
    </div>
  );
}

// Validação das props (mantida para documentação e verificação em desenvolvimento)
Input.propTypes = {
  type: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  handleOnChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  img: PropTypes.string,
  hasError: PropTypes.bool
};

export default Input;