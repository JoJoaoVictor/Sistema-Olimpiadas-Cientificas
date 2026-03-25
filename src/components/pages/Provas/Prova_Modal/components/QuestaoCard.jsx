// components/QuestaoCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { FiLayers, FiInfo } from 'react-icons/fi';
import { BsBook, BsPencil } from 'react-icons/bs';
import ModalInfoQuestao from './../../../../ConfProvas/modal/ModalInfoQuestao';
import styles from '../EditarProva.module.css';

export default function QuestaoCard({ 
  q, 
  index, 
  removendo, 
  onRemover,
  onMoverParaCima,
  onMoverParaBaixo,
  isLastItem
}) {
  const navigate = useNavigate();
  const [verDetalhes, setVerDetalhes] = useState(false);

  return (
    <>
      {verDetalhes && (
        <ModalInfoQuestao questao={q} onClose={() => setVerDetalhes(false)} />
      )}

      <div className={styles.questao_card}>
        <div className={styles.questao_numero}>{index + 1}</div>

        <div className={styles.questao_content}>
          <p className={styles.questao_nome}>{q.name || `Questão ${index + 1}`}</p>
          <div className={styles.questao_tags}>
            {q.grau?.name && (
              <span className={styles.tag}>
                <BsBook style={{ marginRight: 4 }} />{q.grau.name}
              </span>
            )}
            {q.phase_level && (
              <span className={styles.tag}>
                <FiLayers style={{ marginRight: 4 }} />{q.phase_level}
              </span>
            )}
            {q.difficulty_level && (
              <span className={`${styles.tag} ${styles.tag_dificuldade}`}>
                Nível {q.difficulty_level}
              </span>
            )}
            {q.category?.name && (
              <span className={`${styles.tag} ${
                q.category.name.toLowerCase().includes('aprov')
                  ? styles.tag_aprovada
                  : styles.tag_pendente
              }`}>
                {q.category.name}
              </span>
            )}
          </div>
        </div>

        <div className={styles.questao_actions}>
          <button
            className={styles.questao_info_btn}
            onClick={() => setVerDetalhes(true)}
            title="Ver detalhes da questão"
          >
            <FiInfo />
          </button>
          <button
            className={styles.questao_edit_btn}
            onClick={() => navigate(`/projetos/${q.id}`)}
            title="Editar questão"
          >
            <BsPencil /><span>Editar</span>
          </button>
          
          <div className={styles.questao_move_buttons}>
            <button
              className={styles.questao_move_btn}
              onClick={() => onMoverParaCima?.(index)}
              disabled={index === 0}
              title="Mover para cima"
            >
              ⬆
            </button>
            <button
              className={styles.questao_move_btn}
              onClick={() => onMoverParaBaixo?.(index)}
              disabled={isLastItem}
              title="Mover para baixo"
            >
              ⬇
            </button>
          </div>

          <button
            className={styles.questao_remove_btn}
            onClick={() => onRemover(q.id)}
            disabled={removendo === q.id}
            title="Remover da prova"
          >
            {removendo === q.id
              ? <span className={styles.mini_spinner} />
              : <FaTrashAlt />
            }
          </button>
        </div>
      </div>
    </>
  );
}