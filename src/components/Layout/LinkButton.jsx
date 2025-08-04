import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import styles from './LinkButton.module.css'

function LinkButton({ to, text }){
    return(
        <Link className={styles.btn} to={to}>
            {text}
        </Link>
    )
}
LinkButton.propTypes = {
    text: PropTypes.string.isRequired, // text deve ser uma string obrigatória
    to: PropTypes.string.isRequired,
};
export default LinkButton