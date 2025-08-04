import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiSearch } from 'react-icons/fi';
import styles from './SearchBar.module.css';

function SearchBar({ 
  value = '', 
  onDebouncedChange = () => {}, 
  placeholder = "Buscar...", 
  delay = 300 
}) {
  const [inputValue, setInputValue] = useState(value);

  // Usando useCallback para memoizar a função de debounce
  const debounce = useCallback((fn, delay) => {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }, []);

  // Criando a versão debounced da função de callback
  const debouncedOnChange = useCallback(
    debounce((value) => onDebouncedChange(value), delay),
    [onDebouncedChange, delay]
  );

  useEffect(() => {
    setInputValue(value); // Sincroniza com o valor externo quando ele muda
  }, [value]);

  useEffect(() => {
    debouncedOnChange(inputValue);
  }, [inputValue, debouncedOnChange]);

  return (
    <div className={styles.searchBar}>
      <FiSearch className={styles.icon} />
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={styles.input}
        aria-label="Campo de busca"
      />
    </div>
  );
}

// Validação das props
SearchBar.propTypes = {
  value: PropTypes.string,
  onDebouncedChange: PropTypes.func,
  placeholder: PropTypes.string,
  delay: PropTypes.number,
};

export default SearchBar;