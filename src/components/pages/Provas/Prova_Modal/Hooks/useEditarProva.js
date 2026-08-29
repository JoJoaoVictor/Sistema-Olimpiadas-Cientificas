// hooks/useEditarProva.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../../services/api.js';
import { authService } from '../../../../../services/authService.jsx';

const opcoesAno = [
  { value: '4', label: '4º' }, { value: '5', label: '5º' },
  { value: '6', label: '6º' }, { value: '7', label: '7º' },
  { value: '8', label: '8º' }, { value: '9', label: '9º' },
  { value: '1', label: '1º Médio' }, { value: '2', label: '2º Médio' },
  { value: '3', label: '3º Médio' },
];

// Normaliza qualquer representação de booleano vinda da API (true, "true", 1, "1")
const normalizarBool = (v) => v === true || v === 'true' || v === 1 || v === '1';

/**
 * Extrai as questões da prova.
 * IMPORTANTE: hide_alternatives vive na tabela associativa (exam_questions),
 * não na questão. Ao achatar o pivot, a flag precisa ser mesclada no objeto
 * da questão — senão o estado "Sem Alts." se perde a cada recarga.
 */
function extrairQuestoes(dadosProva) {
  const fonte = dadosProva?.questions || dadosProva?.exam_questions || [];
  if (!fonte.length) return [];

  const ordenadas = [...fonte].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  // Formato pivot: [{ question: {...}, order_index, hide_alternatives }]
  if (ordenadas[0]?.question) {
    return ordenadas.map(eq => ({
      ...eq.question,
      order_index: eq.order_index ?? 0,
      hide_alternatives: normalizarBool(eq.hide_alternatives),
    }));
  }

  // Formato plano: [{ id, ... }]
  if (ordenadas[0]?.id) {
    return ordenadas.map(q => ({
      ...q,
      hide_alternatives: normalizarBool(q.hide_alternatives),
    }));
  }

  return [];
}

// Monta o payload de sincronização de questões preservando a flag de cada uma
const montarPayloadQuestoes = (lista) =>
  lista.map((q, index) => ({
    question_id: q.id,
    order_index: index,
    hide_alternatives: normalizarBool(q.hide_alternatives),
  }));

export function useEditarProva(id) {
  const navigate = useNavigate();

  // ── Dados principais ──────────────────────────────────────────────────────
  const [prova,      setProva]      = useState(null);
  const [questoes,   setQuestoes]   = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ── Metadados (formulário de edição) ─────────────────────────────────────
  const [salvando,   setSalvando]   = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formNome,   setFormNome]   = useState('');
  const [formFase,   setFormFase]   = useState('');
  const [formStatus, setFormStatus] = useState('');
  const [formAnos,   setFormAnos]   = useState([]);
  const [formAno,    setFormAno]    = useState(new Date().getFullYear());

  // ── PDF ───────────────────────────────────────────────────────────────────
  const [gerandoPDF, setGerandoPDF] = useState(false);

  // ── Exclusão ──────────────────────────────────────────────────────────────
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo,           setExcluindo]           = useState(false);

  // ── Questões (remoção / adição) ───────────────────────────────────────────
  const [removendo,   setRemovendo]   = useState(null);
  const [adicionando, setAdicionando] = useState(null);

  // ── Estado para comentários do revisor ───────────────────────────────────
  const [reviewerComments, setReviewerComments] = useState('');

  // ── Layout (cabeçalho/rodapé) ─────────────────────────────────────────────
  const [headerImage,    setHeaderImage]    = useState(null);
  const [footerImage,    setFooterImage]    = useState(null);
  const [headerSize,     setHeaderSize]     = useState(100);
  const [footerSize,     setFooterSize]     = useState(100);
  const [salvandoLayout, setSalvandoLayout] = useState(false);

  // =========================================================================
  // 1. BUSCAR DADOS
  // =========================================================================
  const buscarDados = useCallback(async () => {
    if (!id) return;
    setCarregando(true);
    try {
      const res = await api.get(`/api/v1/exams/${id}`);
      const dp  = res.data?.data?.exam || res.data?.data || res.data;
      setProva(dp);
      setQuestoes(extrairQuestoes(dp));
      setFormNome(dp.name   || '');
      setFormFase(dp.fase   || '');
      setFormStatus(dp.status || 'PENDENTE');
      setFormAno(dp.ano ?? (dp.created_at ? new Date(dp.created_at).getFullYear() : new Date().getFullYear()));
      setFormAnos(
        (dp.anos || []).map(a =>
          opcoesAno.find(o => o.label === a || o.value === String(a)) || { value: a, label: a }
        )
      );
      setHeaderImage(dp.header_image || null);
      setFooterImage(dp.footer_image || null);
      setHeaderSize(dp.header_size  ?? 100);
      setFooterSize(dp.footer_size  ?? 100);
      setReviewerComments(dp.reviewer_comments || '');
    } catch {
      alert('Erro ao carregar a prova. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => { buscarDados(); }, [buscarDados]);

  // =========================================================================
  // 2. SALVAR METADADOS
  // =========================================================================
  async function salvarEdicao() {
    if (!formNome.trim()) { alert('O nome da prova não pode ser vazio.'); return; }
    setSalvando(true);
    try {
      const payload = {
        name:   formNome.trim(),
        fase:   formFase,
        status: formStatus,
        anos:   formAnos.map(a => a.label),
        ano:    Number(formAno),
        reviewer_comments: reviewerComments.trim() || null,
      };
      const res = await api.patch(`/api/v1/exams/${id}`, payload);
      const atualizado = res.data?.data?.exam || res.data?.data || { ...prova, ...payload };
      setProva(atualizado);

      // Se a resposta trouxe o pivot, ressincroniza as flags a partir dele
      const questoesAtualizadas = extrairQuestoes(atualizado);
      if (questoesAtualizadas.length) setQuestoes(questoesAtualizadas);

      setModoEdicao(false);
      alert('Prova atualizada com sucesso!');
    } catch (err) {
      alert('Erro ao salvar alterações: ' + authService._handleError(err));
    } finally {
      setSalvando(false);
    }
  }

  function cancelarEdicao() {
    setFormNome(prova?.name   || '');
    setFormFase(prova?.fase   || '');
    setFormStatus(prova?.status || 'PENDENTE');
    setFormAno(prova?.ano ?? (prova?.created_at ? new Date(prova.created_at).getFullYear() : new Date().getFullYear()));
    setFormAnos(
      (prova?.anos || []).map(a =>
        opcoesAno.find(o => o.label === a || o.value === String(a)) || { value: a, label: a }
      )
    );
    setModoEdicao(false);
    setReviewerComments(prova?.reviewer_comments || '');
  }

  // =========================================================================
  // 3. GERAR PDF
  // =========================================================================
  async function visualizarPDF() {
    if (gerandoPDF) return;
    setGerandoPDF(true);
    try {
      const res = await api.get(`/api/v1/exams/${id}/pdf`, {
        responseType: 'blob',
        params: { include_answers: true },
      });
      const url = window.URL.createObjectURL(res.data);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(`Erro ao gerar PDF: ${authService._handleError(err)}`);
    } finally {
      setGerandoPDF(false);
    }
  }

  // =========================================================================
  // 4. REMOVER QUESTÃO
  // =========================================================================
  async function removerQuestao(questaoId) {
    if (!window.confirm('Remover esta questão da prova?')) return;
    setRemovendo(questaoId);
    try {
      const novaLista = questoes.filter(q => q.id !== questaoId);
      await api.patch(`/api/v1/exams/${id}/questions`, montarPayloadQuestoes(novaLista));
      setQuestoes(novaLista);
    } catch (err) {
      alert('Erro ao remover questão: ' + authService._handleError(err));
    } finally {
      setRemovendo(null);
    }
  }

  // =========================================================================
  // 5. ADICIONAR QUESTÃO
  // =========================================================================
  async function adicionarQuestao(questao) {
    setAdicionando(questao.id);
    try {
      const novaLista = [...questoes, { ...questao, hide_alternatives: normalizarBool(questao.hide_alternatives) }];
      await api.patch(`/api/v1/exams/${id}/questions`, montarPayloadQuestoes(novaLista));
      setQuestoes(novaLista);
    } catch (err) {
      alert('Erro ao adicionar questão: ' + authService._handleError(err));
    } finally {
      setAdicionando(null);
    }
  }

  // =========================================================================
  // 6. MOVER QUESTÕES (REORDENAÇÃO)
  // =========================================================================
  async function moverQuestaoParaCima(index) {
    if (index <= 0) return;

    const novaLista = [...questoes];
    [novaLista[index - 1], novaLista[index]] = [novaLista[index], novaLista[index - 1]];

    try {
      await api.patch(`/api/v1/exams/${id}/questions`, montarPayloadQuestoes(novaLista));
      setQuestoes(novaLista);
    } catch (err) {
      alert('Erro ao reordenar questão: ' + authService._handleError(err));
    }
  }

  async function moverQuestaoParaBaixo(index) {
    if (index >= questoes.length - 1) return;

    const novaLista = [...questoes];
    [novaLista[index], novaLista[index + 1]] = [novaLista[index + 1], novaLista[index]];

    try {
      await api.patch(`/api/v1/exams/${id}/questions`, montarPayloadQuestoes(novaLista));
      setQuestoes(novaLista);
    } catch (err) {
      alert('Erro ao reordenar questão: ' + authService._handleError(err));
    }
  }

  // =========================================================================
  // ALTERNAR EXIBIÇÃO DE ALTERNATIVAS (OTIMISTA + API PIVOT)
  // =========================================================================
  const toggleAlternativasQuestao = useCallback(async (questaoId) => {
    const questaoAlvo = questoes.find(q => q.id === questaoId);
    if (!questaoAlvo) return;

    const valorAtual = normalizarBool(questaoAlvo.hide_alternatives);
    const novoValor  = !valorAtual;

    // 1. Atualização otimista
    setQuestoes(prev =>
      prev.map(q => (q.id === questaoId ? { ...q, hide_alternatives: novoValor } : q))
    );

    try {
      // 2. Persiste na associação exam_questions
      await api.patch(`/api/v1/exams/${id}/questions/${questaoId}`, {
        hide_alternatives: novoValor
      });
    } catch (err) {
      console.error('Erro ao alternar alternativas no servidor:', err);
      // 3. Rollback
      setQuestoes(prev =>
        prev.map(q => (q.id === questaoId ? { ...q, hide_alternatives: valorAtual } : q))
      );
      alert('Não foi possível salvar a alteração: ' + authService._handleError(err));
    }
  }, [id, questoes]);

  // =========================================================================
  // 7. SALVAR LAYOUT
  // =========================================================================
  async function salvarLayout(headerBase64, footerBase64, resetHeader, resetFooter) {
    setSalvandoLayout(true);
    try {
      const payload = {
        header_image: resetHeader ? "" : (headerBase64 ?? null),
        footer_image: resetFooter ? "" : (footerBase64 ?? null),
        header_size: headerSize,
        footer_size: footerSize,
      };

      const res = await api.post(`/api/v1/exams/${id}/layout`, payload);

      const examAtualizado = res.data?.data?.exam;
      if (examAtualizado) {
        setHeaderImage(examAtualizado.header_image || null);
        setFooterImage(examAtualizado.footer_image || null);
        setHeaderSize(examAtualizado.header_size  ?? 100);
        setFooterSize(examAtualizado.footer_size  ?? 100);
      }

      alert('Configurações de layout salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar layout: ' + authService._handleError(err));
    } finally {
      setSalvandoLayout(false);
    }
  }

  // =========================================================================
  // 8. EXCLUIR PROVA
  // =========================================================================
  async function excluirProva() {
    setExcluindo(true);
    try {
      await api.delete(`/api/v1/exams/${id}`);
      navigate('/Prova');
    } catch (err) {
      alert('Erro ao excluir prova: ' + authService._handleError(err));
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  }

  return {
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
    // Exclusão
    confirmandoExclusao, setConfirmandoExclusao,
    excluindo, excluirProva,
    // Questões
    removendo, removerQuestao,
    adicionando, adicionarQuestao,
    moverQuestaoParaCima, moverQuestaoParaBaixo,
    toggleAlternativasQuestao,
    // Comentários
    reviewerComments, setReviewerComments,
    // Layout
    headerImage, setHeaderImage,
    footerImage, setFooterImage,
    headerSize,  setHeaderSize,
    footerSize,  setFooterSize,
    salvandoLayout, salvarLayout,
    // Constantes
    opcoesAno,
  };
}