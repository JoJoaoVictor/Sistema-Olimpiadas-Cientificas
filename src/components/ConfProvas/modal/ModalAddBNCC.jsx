import React, { useState, useEffect } from 'react';
import { findHabilidade, saveCustomBNCC } from '../../../data/bnccHelper';
import { FaTimes, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import api from '../../../services/api';
import styles from './ModalAddBNCC.module.css';

const opcoesAnoFiltro = [
  { value: '2º Fundamental', label: '2º Fundamental' },
  { value: '3º Fundamental', label: '3º Fundamental' },
  { value: '4º Fundamental', label: '4º Fundamental' },
  { value: '5º Fundamental', label: '5º Fundamental' },
  { value: '6º Fundamental', label: '6º Fundamental' },
  { value: '7º Fundamental', label: '7º Fundamental' },
  { value: '8º Fundamental', label: '8º Fundamental' },
  { value: '9º Fundamental', label: '9º Fundamental' },
  { value: '1º Médio', label: '1º Médio' }, 
  { value: '2º Médio', label: '2º Médio' },
  { value: '3º Médio', label: '3º Médio' },
];

// MAPA PARA O HELPER VELHO (1 a 11)
const mapaIdsParaOVelho = {
  '2º Fundamental': 1,
  '3º Fundamental': 2,
  '4º Fundamental': 3,
  '5º Fundamental': 4,
  '6º Fundamental': 5,
  '7º Fundamental': 6,
  '8º Fundamental': 7,
  '9º Fundamental': 8,
  '1º Médio': 9, 
  '2º Médio': 10,
  '3º Médio': 11,
};

export default function ModalAddBNCC({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('adicionar');

  const [ano, setAno] = useState('');
  const [unidade, setUnidade] = useState('');
  const [objeto, setObjeto] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [customList, setCustomList] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'gerenciar') {
      const locais = JSON.parse(localStorage.getItem('customBNCC') || '[]');
      setCustomList(locais);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Adaptado para ler o ID (1 a 11) e devolver o nome correto
  const getAnoLabel = (grauId) => {
    const chaves = Object.keys(mapaIdsParaOVelho);
    const nomeEncontrado = chaves.find(key => mapaIdsParaOVelho[key] === Number(grauId));
    return nomeEncontrado || `ID ${grauId}`;
  };

  const handleVerificarCodigo = (val) => {
    setCodigo(val);
    if (val.length >= 4) {
      const existe = findHabilidade(val);
      if (existe) {
        setFeedback({
          type: 'exists',
          data: existe,
          path: { ano: existe.grauId, unidade: existe.unidadeTematica, objeto: existe.objetosDeConhecimento }
        });
      } else {
        setFeedback(null);
      }
    } else {
      setFeedback(null);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!ano || !unidade || !objeto || !codigo) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    const existe = findHabilidade(codigo);
    if (existe) {
      alert("Esta habilidade já está cadastrada!");
      return;
    }

    // 1. Pega a string ("2º Fundamental") e converte no ID que o velho espera (1)
    const backendGrauId = mapaIdsParaOVelho[ano] || 1;

    // 2. Manda para a API o número inteiro (1 a 11) -> Adeus Erro 422!
    const newItem = {
      grauId: backendGrauId,
      unidadeTematica: unidade,
      objetosDeConhecimento: objeto,
      habilidade: codigo,
      abilityDescription: descricao
    };

    try {
      const response = await api.post('/api/v1/bncc-custom', newItem);
      
      // 3. Usa EXATAMENTE a função do helper velho, mandando o ID Numérico 
      saveCustomBNCC(backendGrauId, unidade, objeto, codigo, descricao);
      
      setCustomList(prev => [...prev, response.data]);

      setFeedback({ type: 'success', path: { ano, unidade, objeto } });
      setAno(''); setUnidade(''); setObjeto(''); setCodigo(''); setDescricao('');
      
      window.dispatchEvent(new Event('bnccUpdated'));

      setTimeout(() => setFeedback(null), 4000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Ocorreu um erro ao salvar no servidor.");
    }
  };

  const handleExcluir = async (id, habilidadeCodigo) => {
    if (!window.confirm(`Tem certeza que deseja excluir a habilidade ${habilidadeCodigo}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/bncc-custom/${id}`);
      const atualizados = customList.filter(item => item.id !== id);
      localStorage.setItem('customBNCC', JSON.stringify(atualizados));
      setCustomList(atualizados);
      alert('Habilidade excluída com sucesso!');
      
      if (feedback?.data?.id === id) setFeedback(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Ocorreu um erro ao excluir.");
    } finally {
      setIsDeleting(false);
    }
  };

  const listaFiltrada = customList.filter(item => {
    const termo = termoBusca.toLowerCase();
    return (
      item.habilidade.toLowerCase().includes(termo) ||
      item.unidadeTematica.toLowerCase().includes(termo) ||
      (item.abilityDescription && item.abilityDescription.toLowerCase().includes(termo))
    );
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <h2>Configurações da BNCC</h2>
          <button onClick={onClose} className={styles.closeBtn}><FaTimes /></button>
        </div>

        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'adicionar' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('adicionar')}
          >
            <FaPlus style={{ marginRight: '8px' }}/> Adicionar Nova
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'gerenciar' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('gerenciar')}
          >
            <FaSearch style={{ marginRight: '8px' }}/> Buscar / Excluir
          </button>
        </div>

        {activeTab === 'adicionar' && (
          <form onSubmit={handleSalvar} className={styles.form}>
            <input type="text" placeholder="1. Cód. da Habilidade (Verifica Duplicadas) *" 
                   value={codigo} onChange={e => handleVerificarCodigo(e.target.value.toUpperCase())} className={styles.input} required />

            <select value={ano} onChange={e => setAno(e.target.value)} className={styles.input} required>
              <option value="">2. Selecione o Ano *</option>
              {opcoesAnoFiltro.map((a, index) => (
                <option key={`ano-${index}`} value={a.value}>{a.label}</option>
              ))}
            </select>

            <input type="text" placeholder="3. Unidade Temática (Ex: Álgebra) *" 
                   value={unidade} onChange={e => setUnidade(e.target.value)} className={styles.input} required />

            <input type="text" placeholder="4. Objeto de Conhecimento *" 
                   value={objeto} onChange={e => setObjeto(e.target.value)} className={styles.input} required />

            <textarea placeholder="Descrição da Habilidade" 
                   value={descricao} onChange={e => setDescricao(e.target.value)} className={`${styles.input} ${styles.textarea}`} />

            {feedback && (
              <div className={`${styles.feedback} ${feedback.type === 'exists' ? styles.feedbackExists : styles.feedbackSuccess}`}>
                {feedback.type === 'exists' ? (
                  <><strong>⚠️ Código já existe!</strong> Se deseja gerenciar ou excluir habilidades duplicadas, acesse a aba "Buscar / Excluir".</>
                ) : (
                  <strong>✅ Salvo com sucesso!</strong>
                )}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={feedback?.type === 'exists'}>
              {feedback?.type === 'exists' ? 'Código Indisponível' : 'Salvar Nova BNCC'}
            </button>
          </form>
        )}

        {activeTab === 'gerenciar' && (
          <div className={styles.form}>
            <input 
              type="text" 
              placeholder="Buscar por Código, Unidade ou Descrição..." 
              value={termoBusca} 
              onChange={e => setTermoBusca(e.target.value)} 
              className={styles.input}
              style={{ border: '2px solid #007bff' }} 
            />

            <div className={styles.listContainer}>
              {listaFiltrada.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                  Nenhuma habilidade customizada encontrada.
                </p>
              ) : (
                listaFiltrada.map(item => (
                  <div key={item.id} className={styles.listItem}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#007bff' }}>{item.habilidade}</strong> - {getAnoLabel(item.grauId)}
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#444' }}>
                        <strong>Unidade:</strong> {item.unidadeTematica}
                      </p>
                      {item.abilityDescription && (
                        <p style={{ margin: '0', fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                          "{item.abilityDescription}"
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleExcluir(item.id, item.habilidade)}
                      disabled={isDeleting}
                      className={styles.iconDeleteBtn}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', margin: 0 }}>
              * Apenas habilidades criadas manualmente podem ser excluídas. As originais do MEC são protegidas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}