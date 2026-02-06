import styles from './ModalInfoQuestao.module.css';
import LatexText from '.././../pages/Project_Page/Components_project/LatexText';

const ModalInfoQuestao = ({ questao, onClose }) => {
  if (!questao) return null;

  // Função para converter alternativas do objeto JSON para array
  const parseAlternatives = (alternatives) => {
    if (!alternatives) return [];
    
    // Se já é array
    if (Array.isArray(alternatives)) {
      return alternatives.map(alt => ({
        letra: alt.letra || alt.letter || '?',
        texto: alt.texto || alt.text || ''
      }));
    }
    
    // Se é objeto {"A": "600", "B": "675", ...}
    if (typeof alternatives === 'object') {
      return Object.entries(alternatives).map(([letra, texto]) => ({
        letra,
        texto
      }));
    }
    
    // Se é string (formato antigo)
    if (typeof alternatives === 'string') {
      // Tenta parsear como JSON
      try {
        const parsed = JSON.parse(alternatives);
        return parseAlternatives(parsed);
      } catch {
        // Se não é JSON, retorna como texto único
        return [{ letra: '?', texto: alternatives }];
      }
    }
    
    return [];
  };

  const alternativasArray = parseAlternatives(questao.alternatives);

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
            
            {/* Enunciado com suporte LaTeX */} 
            <div className={styles.field_with_latex}>
              <strong>Enunciado:</strong>
              <div className={styles.latex_content}>
                <LatexText content={questao.questionStatement || "Sem enunciado"} />
              </div>
            </div>

            {/* Imagem (se existir) */}
            {questao.imageURL && (
              <div className={styles.field_with_latex}>
                <strong>Imagem:</strong>
                <div className={styles.image_preview}>
                  <img 
                    src={questao.imageURL} 
                    alt="Imagem da questão" 
                    style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '8px' }}
                  />
                </div>
              </div>
            )}

            {/* Alternativas em lista  */}
            <div className={styles.field_with_latex}>
              <strong>Alternativas:</strong>
              <div className={styles.alternatives_list}>
                {alternativasArray.length > 0 ? (
                  alternativasArray.map((alt, index) => (
                    <div 
                      key={index} 
                      className={styles.alternative_item}
                      style={{
                        padding: '8px 12px',
                        marginBottom: '8px',
                        backgroundColor: alt.letra === questao.correctAlternative ? '#d4edda' : '#f8f9fa',
                        borderLeft: alt.letra === questao.correctAlternative ? '4px solid #28a745' : '4px solid #007bff',
                        borderRadius: '4px',
                        display: 'flex',
                      }}
                    >
                      <strong style={{ marginRight: '8px' }}>{alt.letra})</strong>
                      <LatexText content={alt.texto} />
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Sem alternativas</p>
                )}
              </div>
            </div>

            {/* Resposta Correta - Agora destacada */}
            <p>
              <strong>Resposta Correta:</strong>{' '}
              <span style={{ 
                color: '#28a745', 
                fontWeight: 'bold', 
                fontSize: '1.1em',
                backgroundColor: '#d4edda',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {questao.correctAlternative}
              </span>
            </p>

            {/* Resolução Detalhada com suporte LaTeX */}
            <div className={styles.field_with_latex}>
              <strong>Resolução Detalhada:</strong>
              <div className={styles.latex_content}>
                <LatexText content={questao.detailedResolution || "Sem resolução detalhada"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoQuestao;