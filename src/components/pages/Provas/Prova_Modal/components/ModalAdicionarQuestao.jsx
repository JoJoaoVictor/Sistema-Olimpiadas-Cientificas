// components/ModalAdicionarQuestao.jsx
import { useState } from 'react';
import { FaTimes, FaSearch, FaPlus, FaFilter, FaEye } from 'react-icons/fa';
import Select from 'react-select';
import api from '../../../../../services/api.js';
import { authService } from '../../../../../services/authService.jsx';
import ModalInfoQuestao from './../../../../ConfProvas/modal/ModalInfoQuestao.jsx';
import styles from '../EditarProva.module.css';

// ─── Opções de filtro (espelha MontarProva) ───────────────────────────────────
const opcoesAno = [
  { value: '4', label: '4º Fundamental' },
  { value: '5', label: '5º Fundamental' },
  { value: '6', label: '6º Fundamental' },
  { value: '7', label: '7º Fundamental' },
  { value: '8', label: '8º Fundamental' },
  { value: '9', label: '9º Fundamental' },
  { value: '1M', label: '1º Médio' },
  { value: '2M', label: '2º Médio' },
  { value: '3M', label: '3º Médio' },
];

const opcoesTema = [
  'Álgebra', 'Geometria', 'Grandezas e Medidas', 'Números',
  'Probabilidade e estatística', 'Álgebra / Geometria',
  'Probabilidade', 'Estatística',
];

const opcoesDificuldade = ['1', '2', '3', '4', '5'];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: '36px',
    fontSize: '0.85rem',
    border: state.isFocused ? '1px solid #1967d2' : '1px solid #ced4da',
    borderRadius: '6px',
    boxShadow: 'none',
    '&:hover': { border: '1px solid #1967d2' },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  multiValue: (base) => ({ ...base, backgroundColor: '#e9ecef', borderRadius: '4px' }),
  placeholder: (base) => ({ ...base, fontSize: '0.83rem', color: '#adb5bd' }),
};

export default function ModalAdicionarQuestao({ questoesAtuais, adicionando, onAdicionar, onFechar }) {
  // ── Filtros ────────────────────────────────────────────────────────────────
  const [buscaNome,      setBuscaNome]      = useState('');
  const [filtroAnos,     setFiltroAnos]     = useState([]);
  const [filtroTema,     setFiltroTema]     = useState('');
  const [filtroDif,      setFiltroDif]      = useState('');
  const [filtroHab,      setFiltroHab]      = useState('');
  const [filtroNivel,    setFiltroNivel]    = useState('');
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  // ── Resultados ─────────────────────────────────────────────────────────────
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [buscando,        setBuscando]        = useState(false);
  const [jaFez,           setJaFez]           = useState(false);
  const [questaoPreview,  setQuestaoPreview]  = useState(null);

  // ── Busca ──────────────────────────────────────────────────────────────────
  async function buscarQuestoes() {
    setBuscando(true);
    setJaFez(true);
    try {
      const params = { per_page: 50, category_id: 2 };
      if (buscaNome.trim())  params.search = buscaNome.trim();

      const res   = await api.get('/api/v1/questions', { params });
      let lista   = res.data?.data?.questions || [];

      // Filtragem local (o backend pode não suportar todos os filtros)
      const idsNaProva = new Set(questoesAtuais.map(q => q.id));
      lista = lista.filter(q => !idsNaProva.has(q.id));

      if (filtroTema)
        lista = lista.filter(q => q.bncc_theme?.toLowerCase().includes(filtroTema.toLowerCase()));

      if (filtroDif)
        lista = lista.filter(q => String(q.difficulty_level) === filtroDif);

      if (filtroHab.trim())
        lista = lista.filter(q => q.ability_code?.toLowerCase().includes(filtroHab.toLowerCase()));

      if (filtroNivel.trim())
        lista = lista.filter(q => q.phase_level?.toLowerCase().includes(filtroNivel.toLowerCase()));

      if (filtroAnos.length > 0) {
        lista = lista.filter(q => {
          const grauNome = (q.grau?.name || q.serie_ano || '').toLowerCase();
          return filtroAnos.some(a => grauNome.includes(a.label.toLowerCase().split(' ')[0]));
        });
      }

      setResultadosBusca(lista);
    } catch (err) {
      alert('Erro ao buscar questões: ' + authService._handleError(err));
    } finally {
      setBuscando(false);
    }
  }

  function limparFiltros() {
    setBuscaNome('');
    setFiltroAnos([]);
    setFiltroTema('');
    setFiltroDif('');
    setFiltroHab('');
    setFiltroNivel('');
    setResultadosBusca([]);
    setJaFez(false);
    setQuestaoPreview(null);
  }

  function handleFechar() {
    limparFiltros();
    onFechar();
  }

  const temFiltroAtivo = filtroAnos.length > 0 || filtroTema || filtroDif || filtroHab || filtroNivel;

  return (
    <>
    {questaoPreview && (
      <ModalInfoQuestao questao={questaoPreview} onClose={() => setQuestaoPreview(null)} />
    )}
    <div className={styles.modal_backdrop} onClick={handleFechar}>
      <div className={styles.modal_box_large} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modal_header}>
          <h3>Adicionar Questão</h3>
          <button className={styles.modal_close_btn} onClick={handleFechar}><FaTimes /></button>
        </div>

        {/* Busca principal */}
        <div className={styles.modal_search_row}>
          <input
            type="text"
            className={styles.modal_search_input}
            placeholder="Buscar por nome da questão..."
            value={buscaNome}
            onChange={e => setBuscaNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarQuestoes()}
            autoFocus
          />
          <button
            className={styles.modal_filter_toggle}
            onClick={() => setFiltrosVisiveis(v => !v)}
            title="Filtros avançados"
          >
            <FaFilter />
            {temFiltroAtivo && <span className={styles.filter_dot} />}
          </button>
          <button
            className={styles.modal_search_btn}
            onClick={buscarQuestoes}
            disabled={buscando}
          >
            {buscando ? <span className={styles.mini_spinner} /> : <FaSearch />}
            {buscando ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Filtros avançados (colapsáveis) */}
        {filtrosVisiveis && (
          <div className={styles.modal_filters_panel}>
            <div className={styles.modal_filters_grid}>

              <div className={styles.filter_field}>
                <label className={styles.filter_label}>Ano Escolar</label>
                <Select
                  options={opcoesAno}
                  isMulti
                  placeholder="Todos os anos"
                  value={filtroAnos}
                  onChange={s => setFiltroAnos(s || [])}
                  closeMenuOnSelect={false}
                  menuPortalTarget={document.body}
                  styles={selectStyles}
                />
              </div>

              <div className={styles.filter_field}>
                <label className={styles.filter_label}>Unidade Temática</label>
                <select
                  className={styles.filter_select_native}
                  value={filtroTema}
                  onChange={e => setFiltroTema(e.target.value)}
                >
                  <option value="">Todas</option>
                  {opcoesTema.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className={styles.filter_field}>
                <label className={styles.filter_label}>Grau de Dificuldade</label>
                <select
                  className={styles.filter_select_native}
                  value={filtroDif}
                  onChange={e => setFiltroDif(e.target.value)}
                >
                  <option value="">Todos</option>
                  {opcoesDificuldade.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className={styles.filter_field}>
                <label className={styles.filter_label}>Código de Habilidade</label>
                <input
                  type="text"
                  className={styles.filter_input_text}
                  placeholder="Ex: EF06MA01"
                  value={filtroHab}
                  onChange={e => setFiltroHab(e.target.value)}
                />
              </div>

              <div className={styles.filter_field}>
                <label className={styles.filter_label}>Nível de Categoria</label>
                <input
                  type="text"
                  className={styles.filter_input_text}
                  placeholder="Ex: Fase 1"
                  value={filtroNivel}
                  onChange={e => setFiltroNivel(e.target.value)}
                />
              </div>

            </div>

            {temFiltroAtivo && (
              <button className={styles.filter_clear_btn} onClick={limparFiltros}>
                <FaTimes /> Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Resultados */}
        <div className={styles.modal_results}>
          {!jaFez && (
            <div className={styles.modal_empty}>
              Use os filtros acima e clique em <strong>Buscar</strong> para encontrar questões aprovadas.
            </div>
          )}
          {jaFez && !buscando && resultadosBusca.length === 0 && (
            <div className={styles.modal_empty}>Nenhuma questão aprovada encontrada com esses filtros.</div>
          )}
          {resultadosBusca.map(q => (
            <div key={q.id} className={styles.modal_questao_card}>
              <div className={styles.modal_questao_info}>
                <p className={styles.modal_questao_nome}>{q.name}</p>
                <div className={styles.questao_tags}>
                  {q.grau?.name && <span className={styles.tag}>{q.grau.name}</span>}
                  {q.difficulty_level && (
                    <span className={`${styles.tag} ${styles.tag_dificuldade}`}>
                      Dif. {q.difficulty_level}
                    </span>
                  )}
                  {q.bncc_theme && <span className={styles.tag}>{q.bncc_theme}</span>}
                  {q.ability_code && <span className={styles.tag}>{q.ability_code}</span>}
                  {q.phase_level && <span className={styles.tag}>{q.phase_level}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className={styles.modal_preview_btn}
                  onClick={() => setQuestaoPreview(q)}
                  title="Ver detalhes"
                >
                  <FaEye />
                </button>
                <button
                  className={styles.modal_add_btn}
                  onClick={() => onAdicionar(q)}
                  disabled={adicionando === q.id}
                >
                  {adicionando === q.id ? <span className={styles.mini_spinner} /> : <FaPlus />}
                  {adicionando === q.id ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
    </>
  );
}