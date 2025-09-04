
import PropTypes from 'prop-types';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Importe o CSS do KaTeX

const LatexRenderer = ({ formula }) => {
      const [error, setError] = useState(null)
    try {
        // Renderiza a fórmula LaTeX em HTML
        const html = katex.renderToString(formula, {
            throwOnError: false, // Evita erros caso a fórmula seja inválida
        });

        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch (error) {
        return <span style={{ color: 'red' }}>Fórmula inválida</span>;
    }
};


// Definição de props (corrige o erro do ESLint)
LatexRenderer.propTypes = {
    latex: PropTypes.string.isRequired,
};
export default LatexRenderer;