// components/ModalInfoQuestao.jsx
import { FaTimes, FaBookOpen, FaCheckCircle, FaLayerGroup } from 'react-icons/fa';
import { BsBookHalf } from 'react-icons/bs';
import { FiInfo } from 'react-icons/fi';
import LatexText from '.././../pages/Project_Page/Components_project/LatexText';
import styles from './ModalInfoQuestao.module.css';

// ─── Parser de alternativas ───────────────────────────────────────────────────
function parseAlternatives(alternatives) {
  if (!alternatives) return [];

  if (Array.isArray(alternatives)) {
    return alternatives.map(alt => ({
      letra: alt.letra || alt.letter || '?',
      texto: alt.texto || alt.text || '',
    }));
  }

  if (typeof alternatives === 'object') {
    return Object.entries(alternatives).map(([letra, texto]) => ({ letra, texto }));
  }

  if (typeof alternatives === 'string') {
    try {
      return parseAlternatives(JSON.parse(alternatives));
    } catch {
      const lines = alternatives.split('\n');
      const result = [];
      lines.forEach(line => {
        const match = line.match(/^([a-e])\)\s*(.*)$/i);
        if (match) result.push({ letra: match[1].toUpperCase(), texto: match[2].trim() });
      });
      return result.length > 0 ? result : [{ letra: '?', texto: alternatives }];
    }
  }

  return [];
}

// ─── Dificuldade em número ────────────────────────────────────────────────────
function DificuldadeLabel({ nivel }) {
  return <span>Dif. {nivel}/5</span>;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ModalInfoQuestao({ questao, onClose }) {
  if (!questao) return null;

  const alternativas = parseAlternatives(questao.alternatives);
  const correta      = (questao.correct_alternative || '').toUpperCase();

  // URL da imagem — resolve de múltiplas origens possíveis
  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const rawImageUrl =
    questao.imageURL ||           // MontarProva já monta com imageURL
    questao.image?.url ||         // objeto image aninhado
    null;
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith('http')
      ? rawImageUrl
      : `${BASE_URL}${rawImageUrl}`
    : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.header_left}>
            <div className={styles.header_icon}><FaBookOpen /></div>
            <div>
              <p className={styles.header_title}>{questao.name || 'Detalhes da Questão'}</p>
              {questao.professor_name && (
                <p className={styles.header_subtitle}>Prof. {questao.professor_name}</p>
              )}
            </div>
          </div>
          <button className={styles.close_btn} onClick={onClose}><FaTimes /></button>
        </div>

        {/* ── Meta tags ──────────────────────────────────────────────────── */}
        <div className={styles.meta_row}>
          {(questao.grau?.name || questao.serieAno) && (
            <span className={`${styles.meta_tag} ${styles.meta_tag_blue}`}>
              <BsBookHalf /> {questao.grau?.name || questao.serieAno}
            </span>
          )}
          {questao.phase_level && (
            <span className={`${styles.meta_tag} ${styles.meta_tag_purple}`}>
              <FaLayerGroup /> Nível/Categoria: {questao.phase_level}
            </span>
          )}
          {questao.bncc_theme && (
            <span className={`${styles.meta_tag} ${styles.meta_tag_orange}`}>
              {questao.bncc_theme}
            </span>
          )}
          {questao.ability_code && (
            <span className={`${styles.meta_tag} ${styles.meta_tag_green}`}>
              {questao.ability_code}
            </span>
          )}
          {questao.difficulty_level && (
            <span className={`${styles.meta_tag} ${styles.meta_tag_gray}`}>
              <DificuldadeLabel nivel={questao.difficulty_level} />
            </span>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className={styles.body}>

          {/* Enunciado */}
          <div className={styles.section}>
            <p className={styles.section_title}>Enunciado</p>
            <div className={styles.enunciado_box}>
              <LatexText content={questao.question_statement || 'Sem enunciado.'} />
            </div>
          </div>

          {/* Imagem */}
          {imageUrl && (
            <div className={styles.section}>
              <p className={styles.section_title}>Imagem</p>
              <div className={styles.image_box}>
                <img src={imageUrl} alt="Imagem da questão" />
              </div>
            </div>
          )}

          {/* Alternativas */}
          {alternativas.length > 0 && (
            <div className={styles.section}>
              <p className={styles.section_title}>Alternativas</p>
              <div className={styles.alternatives_list}>
                {alternativas.map((alt, i) => {
                  const isCorreta = alt.letra.toUpperCase() === correta;
                  return (
                    <div
                      key={i}
                      className={`${styles.alternative} ${isCorreta ? styles.alternative_correct : ''}`}
                    >
                      <div className={`${styles.alt_letter} ${isCorreta ? styles.alt_letter_correct : ''}`}>
                        {isCorreta ? <FaCheckCircle /> : alt.letra}
                      </div>
                      <div className={styles.alt_text}>
                        <LatexText content={alt.texto} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolução */}
          {questao.detailed_resolution && (
            <div className={styles.section}>
              <p className={styles.section_title}>Resolução Detalhada</p>
              <div className={styles.resolucao_box}>
                <LatexText content={questao.detailed_resolution} />
              </div>
            </div>
          )}

          {/* Info BNCC */}
          {(questao.ability_description || questao.knowledge_objects) && (
            <div className={styles.section}>
              <p className={styles.section_title}>Informações BNCC</p>
              <div className={styles.info_grid}>
                {questao.ability_description && (
                  <div className={styles.info_item} style={{ gridColumn: '1 / -1' }}>
                    <p className={styles.info_item_label}>Descrição da Habilidade</p>
                    <p className={styles.info_item_value}>{questao.ability_description}</p>
                  </div>
                )}
                {questao.knowledge_objects && (
                  <div className={styles.info_item} style={{ gridColumn: '1 / -1' }}>
                    <p className={styles.info_item_label}>Objetos de Conhecimento</p>
                    <p className={styles.info_item_value}>{questao.knowledge_objects}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.close_footer_btn} onClick={onClose}>Fechar</button>
        </div>

      </div>
    </div>
  );
}