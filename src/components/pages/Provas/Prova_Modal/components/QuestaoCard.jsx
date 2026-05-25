// components/QuestaoCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { FiLayers, FiInfo } from 'react-icons/fi';
import { BsBook, BsPencil, BsListOl, BsTextParagraph } from 'react-icons/bs';
import ModalInfoQuestao from './../../../../ConfProvas/modal/ModalInfoQuestao';
import styles from '../EditarProva.module.css';

export default function QuestaoCard({ 
  q, 
  index, 
  removendo, 
  onRemover,
  onMoverParaCima,
  onMoverParaBaixo,
  isLastItem,
  onToggleAlternativas // Prop injetada para receber a ação do hook
}) {
  const navigate = useNavigate();
  const [verDetalhes, setVerDetalhes] = useState(false);

  // Normaliza o valor booleano vindo da flag do banco
  const ocultarAlternativas = q.hide_alternatives === true || q.hide_alternatives === "true";

  return (
    <>
      {verDetalhes && (
        <ModalInfoQuestao questao={q} onClose={() => setVerDetalhes(false)} />
      )}

      <div className={`${styles.questao_card} ${ocultarAlternativas ? styles.questao_sem_alt : ''}`}>
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
            {ocultarAlternativas && (
              <span className={styles.tag} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px dashed #ffeeba' }}>
                Discursiva (Sem Alts.)
              </span>
            )}
          </div>
        </div>

        <div className={styles.questao_actions}>
          {/* BOTÃO MUDADO: Alternar entre múltipla escolha e discursiva */}
          <button
            className={`${styles.action_btn}`}
            onClick={() => onToggleAlternativas?.(q.id)}
            title={ocultarAlternativas ? "Mudar para Múltipla Escolha" : "Tornar Discursiva (Ocultar Alts)"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: ocultarAlternativas ? '#f8d7da' : '#e2e8f0',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              color: ocultarAlternativas ? '#721c24' : '#334155'
            }}
          >
            {ocultarAlternativas ? <BsTextParagraph /> : <BsListOl />}
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {ocultarAlternativas ? "Sem Alts." : "Com Alts."}
            </span>
          </button>

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