import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

// Ícones
import { FaArrowLeft, FaEdit, FaTimes, FaSave, FaFilePdf, FaPlus, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { FiLayers, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle, FiLayout } from 'react-icons/fi';
import { BsBook } from 'react-icons/bs';

// Hook e componentes filhos
import { useEditarProva }         from './hooks/useEditarProva.js';
import QuestaoCard                from './components/QuestaoCard.jsx';
import ModalAdicionarQuestao      from './components/ModalAdicionarQuestao.jsx';
import TabCabecalhoRodape         from './components/TabCabecalhoRodape.jsx';

import styles from './EditarProva.module.css';

// ─── Constantes de formulário ─────────────────────────────────────────────────
const customSelectStyles = {
  control: (base, state) => ({
    ...base, minHeight: '42px',
    border: state.isFocused ? '1px solid #1967d2' : '1px solid #ced4da',
    borderRadius: '6px',
    boxShadow: state.isFocused ? '0 0 0 1px #1967d2' : 'none',
    '&:hover': { border: '1px solid #1967d2' },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  multiValue:      (base) => ({ ...base, backgroundColor: '#e9ecef', borderRadius: '4px' }),
  multiValueLabel: (base) => ({ ...base, color: '#495057' }),
};

const listaFases  = [{ value: '1', label: 'Fase 1' }, { value: '2', label: 'Fase 2' }, { value: 'Final', label: 'Final' }];
const listaStatus = ['APROVADA', 'PENDENTE', 'APLICADA'];

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  : '-';

const StatusBadge = ({ status }) => {
  const s = (status || 'PENDENTE').toUpperCase();
  const map = {
    APROVADA: { icon: <FiCheckCircle />, cls: styles.status_approved, label: 'Aprovada' },
    APLICADA: { icon: <FiCheckCircle />, cls: styles.status_applied,  label: 'Aplicada' },
    PENDENTE: { icon: <FiClock />,       cls: styles.status_pending,  label: 'Pendente' },
  };
  const { icon, cls, label } = map[s] || map.PENDENTE;
  return <span className={`${styles.badge} ${cls}`}>{icon} {label}</span>;
};

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
export default function EditarProva() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [abaAtiva,    setAbaAtiva]    = useState('questoes');
  const [modalAberto, setModalAberto] = useState(false);

  const {
    // Dados
    prova, questoes, carregando,
    // Metadados
    modoEdicao, setModoEdicao,
    salvando, salvarEdicao, cancelarEdicao,
    formNome, setFormNome,
    formAno,  setFormAno,
    formFase, setFormFase,
    formStatus, setFormStatus,
    formAnos, setFormAnos,
    // PDF
    gerandoPDF, visualizarPDF,
    // Questões
    removendo, removerQuestao,
    adicionando, adicionarQuestao,
    moverQuestaoParaCima, moverQuestaoParaBaixo,
    // Exclusão
    confirmandoExclusao, setConfirmandoExclusao,
    excluindo, excluirProva,
    // Layout
    headerImage, setHeaderImage,
    footerImage, setFooterImage,
    headerSize,  setHeaderSize,
    footerSize,  setFooterSize,
    salvandoLayout, salvarLayout,
    // Constantes
    opcoesAno,
  } = useEditarProva(id);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className={styles.page_wrapper}>
        <div className={styles.loading_center}>
          <div className={styles.spinner} />
          <p>Carregando prova...</p>
        </div>
      </div>
    );
  }

  if (!prova) {
    return (
      <div className={styles.page_wrapper}>
        <button onClick={() => navigate(-1)} className={styles.back_btn}><FaArrowLeft /> Voltar</button>
        <div className={styles.empty_state}>
          <FiAlertCircle size={40} />
          <p>Prova não encontrada.</p>
        </div>
      </div>
    );
  }

  const anosTexto = (prova.anos || formAnos.map(a => a.label)).join(', ') || '—';

  return (
    <div className={styles.page_wrapper}>

      {/* ── Overlays ──────────────────────────────────────────────────────── */}
      {(gerandoPDF || salvando || salvandoLayout) && (
        <div className={styles.loadingOverlay}>
          <h3>{gerandoPDF ? 'Gerando PDF...' : 'Salvando...'}</h3>
          <p>Aguarde, isso pode levar alguns segundos.</p>
        </div>
      )}

      {/* ── Overlay confirmação de exclusão ─────────────────────────────────── */}
      {confirmandoExclusao && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <div className={styles.confirmIcon}>
              <FaExclamationTriangle />
            </div>
            <h3 className={styles.confirmTitle}>Excluir Prova</h3>
            <p className={styles.confirmMsg}>
              Tem certeza que deseja excluir esta prova?<br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </p>
            <div className={styles.confirmActions}>
              <button
                className={`${styles.action_btn} ${styles.btn_cancel}`}
                onClick={() => setConfirmandoExclusao(false)}
                disabled={excluindo}
              >
                <FaTimes /> Cancelar
              </button>
              <button
                className={`${styles.action_btn} ${styles.btn_delete}`}
                onClick={excluirProva}
                disabled={excluindo}
              >
                {excluindo
                  ? <><span className={styles.mini_spinner} /> Excluindo...</>
                  : <><FaTrashAlt /> Sim, excluir</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal adicionar questão ────────────────────────────────────────── */}
      {modalAberto && (
        <ModalAdicionarQuestao
          questoesAtuais={questoes}
          adicionando={adicionando}
          onAdicionar={adicionarQuestao}
          onFechar={() => setModalAberto(false)}
        />
      )}

      {/* Botão Voltar */}
      <button onClick={() => navigate(-1)} className={styles.back_btn}>
        <FaArrowLeft /> Voltar
      </button>

      <div className={styles.card_container}>

        {/* ── HEADER DO CARD ────────────────────────────────────────────────── */}
        <header className={styles.card_header}>
          <div className={styles.header_content}>
            <StatusBadge status={prova.status} />
            <h1 className={styles.title}>{modoEdicao ? 'Editando Dados daProva' : prova.name}</h1>
            <p className={styles.dates_info}>
              <FiCalendar />
              <span> Criado: {formatDate(prova.created_at)}</span>
              <span className={styles.separator}>|</span>
              <span> Atualizado: <strong>{formatDate(prova.updated_at)}</strong></span>
            </p>
          </div>
          <div className={styles.header_actions}>
            {!modoEdicao && (
              <>
                <button className={`${styles.action_btn} ${styles.btn_pdf}`} onClick={visualizarPDF} disabled={gerandoPDF}>
                  <FaFilePdf /> PDF
                </button>
                <button
                  className={`${styles.action_btn} ${styles.btn_delete}`}
                  onClick={() => setConfirmandoExclusao(true)}
                  title="Excluir prova"
                >
                  <FaTrashAlt /> Excluir
                </button>
              </>
            )}
            <button
              className={`${styles.action_btn} ${modoEdicao ? styles.btn_cancel : styles.btn_edit}`}
              onClick={() => modoEdicao ? cancelarEdicao() : setModoEdicao(true)}
            >
              {modoEdicao ? <><FaTimes /> Cancelar</> : <><FaEdit /> Editar Prova</>}
            </button>
            {modoEdicao && (
              <button className={`${styles.action_btn} ${styles.btn_save}`} onClick={salvarEdicao} disabled={salvando}>
                <FaSave /> Salvar
              </button>
            )}
          </div>
        </header>

        {/* ── ABAS ──────────────────────────────────────────────────────────── */}
        <div className={styles.tabs_bar}>
          <button
            className={`${styles.tab_btn} ${abaAtiva === 'questoes' ? styles.tab_active : ''}`}
            onClick={() => setAbaAtiva('questoes')}
          >
            <BsBook /> Questões da Prova
          </button>
          <button
            className={`${styles.tab_btn} ${abaAtiva === 'cabecalho' ? styles.tab_active : ''}`}
            onClick={() => setAbaAtiva('cabecalho')}
          >
            <FiLayout /> Configurar Cabeçalho/Rodapé
          </button>
        </div>

        {/* ── CORPO ─────────────────────────────────────────────────────────── */}
        <div className={styles.card_body}>

          {/* ─── ABA QUESTÕES ───────────────────────────────────────────────── */}
          {abaAtiva === 'questoes' && (
            <>
              {/* Modo visualização: grid de metadados */}
              {!modoEdicao && (
                <section className={styles.info_grid} style={{ marginBottom: '24px' }}>
                  <div className={styles.info_box}>
                    <span className={styles.label}><BsBook style={{ marginRight: 4 }} /> Anos</span>
                    <p>{anosTexto}</p>
                  </div>
                  <div className={styles.info_box}>
                    <span className={styles.label}><FiLayers style={{ marginRight: 4 }} /> Fase</span>
                    <p>{prova.fase || '—'}</p>
                  </div>
                  <div className={styles.info_box}>
                    <span className={styles.label}><FiCheckCircle style={{ marginRight: 4 }} /> Status</span>
                    <p>{prova.status || 'PENDENTE'}</p>
                  </div>
                  <div className={styles.info_box}>
                    <span className={styles.label}>Ano</span>
                    <p>{prova.ano ?? (prova.created_at ? new Date(prova.created_at).getFullYear() : '—')}</p>
                  </div>
                  <div className={styles.info_box}>
                    <span className={styles.label}>Total de Questões</span>
                    <p>{questoes.length}</p>
                  </div>
                </section>
              )}

              {/* Modo edição: formulário de metadados */}
              {modoEdicao && (
                <div className={styles.edit_mode} style={{ marginBottom: '24px' }}>
                  <p className={styles.edit_hint}>
                    <FiAlertCircle /> Edite os metadados da prova abaixo.
                  </p>
                  <div className={styles.edit_grid}>
                    <div className={styles.field_group} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.field_label}>Nome da Prova</label>
                      <input
                        type="text"
                        className={styles.field_input}
                        value={formNome}
                        onChange={e => setFormNome(e.target.value)}
                        placeholder="Nome da prova..."
                      />
                    </div>
                    <div className={styles.field_group}>
                      <label className={styles.field_label}>Ano do Titulo da Prova</label>
                      <input
                        type="number"
                        className={styles.field_input}
                        value={formAno}
                        onChange={e => setFormAno(e.target.value)}
                        min={2000}
                        max={2100}
                        placeholder={String(new Date().getFullYear())}
                      />
                    </div>
                    <div className={styles.field_group}>
                      <label className={styles.field_label}>Fase</label>
                      <Select
                        options={listaFases}
                        placeholder="Selecionar Fase"
                        value={listaFases.find(f => f.value === formFase) || null}
                        onChange={s => setFormFase(s?.value || '')}
                        isClearable
                        menuPortalTarget={document.body}
                        styles={customSelectStyles}
                      />
                    </div>
                    <div className={styles.field_group}>
                      <label className={styles.field_label}>Status</label>
                      <select
                        className={styles.field_select}
                        value={formStatus}
                        onChange={e => setFormStatus(e.target.value)}
                      >
                        {listaStatus.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className={styles.field_group} style={{ gridColumn: '1 / -1' }}>
                      <label className={styles.field_label}>Anos Escolares</label>
                      <div className="notranslate" translate="no">
                        <Select
                          menuPortalTarget={document.body}
                          isSearchable
                          options={opcoesAno}
                          isMulti
                          placeholder="Selecionar Anos"
                          value={formAnos}
                          onChange={s => setFormAnos(s || [])}
                          closeMenuOnSelect={false}
                          isClearable
                          styles={customSelectStyles}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.edit_actions}>
                    <button className={`${styles.action_btn} ${styles.btn_cancel}`} onClick={cancelarEdicao}>
                      <FaTimes /> Cancelar
                    </button>
                    <button className={`${styles.action_btn} ${styles.btn_save}`} onClick={salvarEdicao} disabled={salvando}>
                      <FaSave /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                  <hr className={styles.divider} />
                </div>
              )}

              {/* Lista de questões */}
              <section className={styles.questoes_section}>
                <div className={styles.section_heading_row}>
                  <h3 className={styles.section_heading}><BsBook /> Questões ({questoes.length})</h3>
                  <button
                    className={`${styles.action_btn} ${styles.btn_add}`}
                    onClick={() => setModalAberto(true)}
                  >
                    <FaPlus /> Adicionar Questão
                  </button>
                </div>
                {questoes.length === 0 ? (
                  <div className={styles.empty_questoes}>Nenhuma questão vinculada a esta prova.</div>
                ) : (
                  questoes.map((q, index) => (
                    <QuestaoCard
                      key={q.id}
                      q={q}
                      index={index}
                      removendo={removendo}
                      onRemover={removerQuestao}
                      onMoverParaCima={moverQuestaoParaCima}
                      onMoverParaBaixo={moverQuestaoParaBaixo}
                      isLastItem={index === questoes.length - 1}
                    />
                  ))
                )}
              </section>
            </>
          )}

          {/* ─── ABA CABEÇALHO/RODAPÉ ───────────────────────────────────────── */}
          {abaAtiva === 'cabecalho' && (
            <TabCabecalhoRodape
              headerImage={headerImage}  setHeaderImage={setHeaderImage}
              footerImage={footerImage}  setFooterImage={setFooterImage}
              headerSize={headerSize}    setHeaderSize={setHeaderSize}
              footerSize={footerSize}    setFooterSize={setFooterSize}
              salvandoLayout={salvandoLayout}
              onSalvar={salvarLayout}
            />
          )}

        </div>
      </div>
    </div>
  );
}