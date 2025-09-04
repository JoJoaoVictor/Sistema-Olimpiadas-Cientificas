import styles from './ProjectsCard.module.css';
import { BsPencil, BsFillTrashFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function ProjectsCard({ 
  id,
  name = '',
  professorName = '',
  serieAno = '',
  grauName = '',
  phaseLevel = '',
  difficultyLevel = 0,
  knowledgeObjects = '',
  bnccTheme = '',
  abilityCode = '',
  abilityDescription = '',
  questionStatement = '',
  alternatives = '',
  correctAlternative = '',
  detailedResolution = '',
  categoryName = '',
  handleRemove = () => {},
  createdAt = new Date().toISOString()
}) {

  const remove = (e) => {
    e.preventDefault();
    handleRemove(id);
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };

  return (
    <div className={styles.project_container}>
      <div className={styles.card_body}>
        <div className={styles.card_header}>
          <h3>{name}</h3>
          <span className={styles.difficulty}>Dificuldade: {difficultyLevel}/5</span>
          <span>Série: {serieAno}</span>
          <span className={styles.card_data}>Data de Criação: {formatDate(createdAt)}</span>
        </div>
        
        <div className={styles.info_group}>
          <h4>Informações Básicas</h4>
          <p><strong>Grau de Ensino:</strong> {grauName}</p>
          <p><strong>Professor:</strong> {professorName}</p>
          <p><strong>Fase:</strong> {phaseLevel}</p>
          <p className={styles.categori_text}>
            <strong>Categoria:</strong>
            <span className={`${styles[categoryName.toLowerCase()]}`}></span>
            {categoryName}
          </p>
          
          <br/>
          
          <h4>Detalhes Pedagógicos</h4>
          <p><strong>Tema BNCC:</strong> {bnccTheme}</p>
          <p><strong>Código Habilidade:</strong> {abilityCode}</p>
          <p><strong>Descrição Habilidade:</strong> {abilityDescription}</p>
          <p><strong>Objetos de Conhecimento:</strong> {knowledgeObjects}</p>
          
          <br/>
          
          <h4>Questão</h4>
          <p><strong>Enunciado:</strong> {questionStatement}</p>
          <p><strong>Alternativas:</strong> {alternatives}</p>
          <p><strong>Resposta Correta:</strong> {correctAlternative}</p>
          
          <br/>
          
          <h4>Resolução Detalhada</h4>
          <p>{detailedResolution}</p>
          
          <div className={styles.card_footer}>
            <Link className={styles.edit_btn} to={`/projetos/${id}`}>
              <BsPencil /> Editar
            </Link>
            <button className={styles.delete_btn} onClick={remove}>
              <BsFillTrashFill /> Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Validação de tipos com PropTypes
ProjectsCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string,
  professorName: PropTypes.string,
  serieAno: PropTypes.string,
  grauName: PropTypes.string,
  phaseLevel: PropTypes.string,
  difficultyLevel: PropTypes.number,
  knowledgeObjects: PropTypes.string,
  bnccTheme: PropTypes.string,
  abilityCode: PropTypes.string,
  abilityDescription: PropTypes.string,
  questionStatement: PropTypes.string,
  alternatives: PropTypes.string,
  correctAlternative: PropTypes.string,
  detailedResolution: PropTypes.string,
  categoryName: PropTypes.string,
  handleRemove: PropTypes.func,
  createdAt: PropTypes.string
};

export default ProjectsCard;