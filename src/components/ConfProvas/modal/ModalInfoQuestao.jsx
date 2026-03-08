import styles from './ModalInfoQuestao.module.css';
import LatexText from '.././../pages/Project_Page/Components_project/LatexText';

const ModalInfoQuestao = ({ questao, onClose }) => {
  if (!questao) return null;

  // Função para converter alternativas para array de objetos {letra, texto}
  const parseAlternatives = (alternatives) => {
    if (!alternatives) return [];

    // Se já é array
    if (Array.isArray(alternatives)) {
      return alternatives.map(alt => ({
        letra: alt.letra || alt.letter || '?',
        texto: alt.texto || alt.text || ''
      }));
    }

    // Se é objeto (formato antigo)
    if (typeof alternatives === 'object' && !Array.isArray(alternatives)) {
      return Object.entries(alternatives).map(([letra, texto]) => ({
        letra,
        texto
      }));
    }

    // Se é string
    if (typeof alternatives === 'string') {
      // Tenta parsear como JSON
      try {
        const parsed = JSON.parse(alternatives);
        return parseAlternatives(parsed);
      } catch {
        // Formato "a) texto\nb) texto..."
        const lines = alternatives.split('\n');
        const result = [];
        lines.forEach(line => {
          const match = line.match(/^([a-e])\)\s*(.*)$/i);
          if (match) {
            result.push({
              letra: match[1].toUpperCase(),
              texto: match[2].trim()
            });
          }
        });
        if (result.length > 0) return result;
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
          {/* Informações Básicas */}
          <div className={styles.info_section}>
            <h3>Informações Básicas</h3>
            <p><strong>Nome:</strong> {questao.name}</p>
            <p><strong>Professor:</strong> {questao.professor_name}</p>
            <p><strong>Dificuldade:</strong> {questao.difficulty_level}/5</p>
            <p><strong>Série/Ano:</strong> {questao.serieAno}</p>
            <p><strong>Fase:</strong> {questao.phase_level}</p>
          </div>

          {/* BNCC */}
          <div className={styles.info_section}>
            <h3>BNCC</h3>
            <p><strong>Tema BNCC:</strong> {questao.bncc_theme}</p>
            <p><strong>Código Habilidade:</strong> {questao.ability_code}</p>
            <p><strong>Descrição Habilidade:</strong> {questao.ability_description}</p>
            <p><strong>Objetos de Conhecimento:</strong> {questao.knowledge_objects}</p>
          </div>

          {/* Conteúdo da Questão */}
          <div className={styles.info_section}>
            <h3>Conteúdo da Questão</h3>
            
            {/* Enunciado */}
            <div className={styles.field_with_latex}>
              <strong>Enunciado:</strong>
              <div className={styles.latex_content}>
                <LatexText content={questao.question_statement || "Sem enunciado"} />
              </div>
            </div>

            {/* Imagem */}
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

            {/* Alternativas */}
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
                        backgroundColor: alt.letra === questao.correct_alternative ? '#d4edda' : '#f8f9fa',
                        borderLeft: alt.letra === questao.correct_alternative ? '4px solid #28a745' : '4px solid #007bff',
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

            {/* Resposta Correta */}
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
                {questao.correct_alternative}
              </span>
            </p>

            {/* Resolução Detalhada */}
            <div className={styles.field_with_latex}>
              <strong>Resolução Detalhada:</strong>
              <div className={styles.latex_content}>
                <LatexText content={questao.detailed_resolution || "Sem resolução detalhada"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalInfoQuestao;