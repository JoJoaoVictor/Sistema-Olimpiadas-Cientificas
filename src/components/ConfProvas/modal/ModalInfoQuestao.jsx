import styles from './ModalInfoQuestao.module.css';
import LatexText from '.././../pages/Project_Page/Components_project/LatexText';
const ModalInfoQuestao = ({ questao, onClose }) => {
  if (!questao) return null;

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2>Detalhes da Questão</h2>
          <button className={styles.close_btn} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.modal_body}>
          <div className={styles.info_section}>
            <h3>Informações Básicas</h3>
            <p><strong>Nome:</strong> {questao.name}</p>
            <p><strong>Dificuldade:</strong> {questao.difficultyLevel}/5</p>
            <p><strong>Professor:</strong> {questao.professorName}</p>
            <p><strong>Série/Ano:</strong> {questao.serieAno}</p>
            <p><strong>Grau de Ensino:</strong> {questao.grauName}</p>
            <p><strong>Fase:</strong> {questao.phaseLevel}</p>
          </div>

          <div className={styles.info_section}>
            <h3>BNCC e Habilidades</h3>
            <p><strong>Tema BNCC:</strong> {questao.bnccTheme}</p>
            <p><strong>Código Habilidade:</strong> {questao.abilityCode}</p>
            <p><strong>Descrição Habilidade:</strong> {questao.abilityDescription}</p>
            <p><strong>Objetos de Conhecimento:</strong> {questao.knowledgeObjects}</p>
          </div>

          <div className={styles.info_section}>
            <h3>Conteúdo da Questão</h3>
            <p><strong>Enunciado:</strong> {questao.questionStatement}</p>
            {questao.imageURL && (
              <p><strong>Imagem:</strong> {questao.imageURL}</p>
            )}
            <p><strong>Alternativas:</strong> {questao.alternatives}</p>
            <p><strong>Resposta Correta:</strong> {questao.correctAlternative}</p>
            <p><strong>Resolução Detalhada:</strong> {questao.detailedResolution}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoQuestao;