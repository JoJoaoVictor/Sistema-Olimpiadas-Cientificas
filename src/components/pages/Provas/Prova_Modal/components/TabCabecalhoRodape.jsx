// components/TabCabecalhoRodape.jsx
import { useRef, useState } from 'react';
import { FaSave, FaUpload, FaUndo } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import styles from '../EditarProva.module.css';

// Dimensões padrão do PDF (de pdf_generator.py):
//   Cabeçalho: 200mm @ 96dpi → 756 × 189 px
//   Rodapé:    160mm @ 96dpi → 605 × 151 px
const DIMENSOES = {
  header: { w: 756, h: 189, label: '756 × 189 px' },
  footer: { w: 605, h: 151, label: '605 × 151 px' },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_MB = 5;

// Converte File para base64 redimensionado via canvas
function processarImagem(file, tipo) {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      reject(new Error('Formato não suportado. Use JPG ou PNG.')); return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      reject(new Error(`Imagem muito grande. Máximo: ${MAX_MB}MB.`)); return;
    }

    const { w: targetW, h: targetH } = DIMENSOES[tipo];
    const reader = new FileReader();

    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(targetW / img.width, targetH / img.height, 1);
        const drawW = Math.round(img.width  * scale);
        const drawH = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width  = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img,
          Math.round((targetW - drawW) / 2),
          Math.round((targetH - drawH) / 2),
          drawW, drawH
        );

        resolve(canvas.toDataURL('image/png', 0.92));
      };
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

// ─── Card individual ──────────────────────────────────────────────────────────
function ImagemCard({ titulo, dimHint, nomePadrao, savedPath, previewBase64, size, tipo, onFileSelect, onReset, onSizeChange, apiBaseUrl }) {
  const inputRef = useRef(null);

  // Preview: base64 novo tem prioridade, depois path salvo no banco
  const displayUrl = previewBase64 || (savedPath ? `${apiBaseUrl}${savedPath}` : null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await processarImagem(file, tipo);
      onFileSelect(base64);
    } catch (err) {
      alert(err.message);
    }
    // Limpa input para permitir re-selecionar o mesmo arquivo
    e.target.value = '';
  }

  return (
    <div className={styles.layout_card}>
      <h4 className={styles.layout_card_title}>{titulo}</h4>
      <p className={styles.layout_dim_hint}>Tamanho padrão: {dimHint}</p>

      {/* Preview */}
      <div className={styles.preview_box}>
        <span className={styles.preview_label}>Pré-visualização</span>
        {displayUrl ? (
          <img src={displayUrl} alt={titulo} className={styles.preview_img} style={{ width: `${size}%` }} />
        ) : (
          <div className={styles.preview_placeholder}>Imagem padrão ({nomePadrao})</div>
        )}
      </div>

      {/* Upload */}
      <div className={styles.layout_upload_row}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handleFile} />
        <button className={styles.upload_btn} onClick={() => inputRef.current?.click()}>
          <FaUpload /> Carregar imagem
        </button>
        {displayUrl && (
          <button className={styles.reset_btn} onClick={onReset} title="Remove — volta ao padrão">
            <FaUndo /> Restaurar padrão
          </button>
        )}
      </div>

      {/* Slider */}
      <div className={styles.slider_group}>
        <label className={styles.slider_label}>Tamanho: <strong>{size}%</strong></label>
        <input type="range" min={50} max={150} step={5} value={size} onChange={e => onSizeChange(Number(e.target.value))} className={styles.slider} />
        <div className={styles.slider_marks}><span>50%</span><span>100%</span><span>150%</span></div>
      </div>
    </div>
  );
}

// ─── Componente exportado ─────────────────────────────────────────────────────
export default function TabCabecalhoRodape({
  headerImage, setHeaderImage,
  footerImage, setFooterImage,
  headerSize,  setHeaderSize,
  footerSize,  setFooterSize,
  salvandoLayout,
  onSalvar,
}) {
  // Base64 das novas imagens selecionadas (ainda não salvas)
  const [headerBase64, setHeaderBase64] = useState(null);
  const [footerBase64, setFooterBase64] = useState(null);

  // Flags de reset
  const [resetHeader, setResetHeader] = useState(false);
  const [resetFooter, setResetFooter] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  function handleHeaderSelect(base64) {
    setHeaderBase64(base64);
    setResetHeader(false);
  }

  function handleFooterSelect(base64) {
    setFooterBase64(base64);
    setResetFooter(false);
  }

  function handleHeaderReset() {
    setHeaderBase64(null);
    setHeaderImage(null); // limpa o path salvo para o preview sumir
    setResetHeader(true);
  }

  function handleFooterReset() {
    setFooterBase64(null);
    setFooterImage(null);
    setResetFooter(true);
  }

  async function handleSalvar() {
    // Passa base64 novo OU null (sem mudança) para o hook
    await onSalvar(headerBase64, footerBase64, resetHeader, resetFooter);
    // Limpa estado local após salvar
    setHeaderBase64(null);
    setFooterBase64(null);
    setResetHeader(false);
    setResetFooter(false);
  }

  return (
    <div className={styles.layout_section}>

      <p className={styles.layout_intro}>
        <FiAlertCircle /> Personalize o cabeçalho e rodapé do PDF desta prova.
        As imagens são redimensionadas automaticamente para o tamanho padrão:
        cabeçalho 756 × 189 px· rodapé 605 × 151 px.
        Deixe em branco para usar as imagens padrão da instituição.
      </p>

      <div className={styles.layout_grid}>
        <ImagemCard
          titulo="Cabeçalho"
          dimHint={DIMENSOES.header.label}
          nomePadrao="heder.PNG"
          savedPath={headerImage}
          previewBase64={headerBase64}
          size={headerSize}
          tipo="header"
          onFileSelect={handleHeaderSelect}
          onReset={handleHeaderReset}
          onSizeChange={setHeaderSize}
          apiBaseUrl={apiBaseUrl}
        />
        <ImagemCard
          titulo="Rodapé"
          dimHint={DIMENSOES.footer.label}
          nomePadrao="footer.PNG"
          savedPath={footerImage}
          previewBase64={footerBase64}
          size={footerSize}
          tipo="footer"
          onFileSelect={handleFooterSelect}
          onReset={handleFooterReset}
          onSizeChange={setFooterSize}
          apiBaseUrl={apiBaseUrl}
        />
      </div>

      <div className={styles.layout_save_row}>
        <button className={`${styles.action_btn} ${styles.btn_save}`} onClick={handleSalvar} disabled={salvandoLayout}>
          <FaSave /> {salvandoLayout ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>

    </div>
  );
}