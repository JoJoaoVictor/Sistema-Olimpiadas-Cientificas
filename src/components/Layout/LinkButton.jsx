import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './LinkButton.module.css';

function LinkButton({ to, text }) {
    return (
        <Link className={styles.btn} to={to}>
            {text}
        </Link>
    );
}

LinkButton.propTypes = {
    text: PropTypes.node.isRequired, 
    to: PropTypes.string.isRequired,
};

export default LinkButton;