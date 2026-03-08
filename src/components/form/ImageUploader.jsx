import { useState, useRef, useEffect } from 'react';
import styles from './ImageUploader.module.css';
import api from '../../services/api';
import LatexText from '../pages/Project_Page/Components_project/LatexText';

function ImageUploader({ 
  onImageProcessed, 
  onImageRemoved,
  initialImage = null,
  disabled = false,
  questionStatement = '',
  alts = { A: '', B: '', C: '', D: '', E: '' },
  correctAlternative = ''
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialImage?.url || null);
  const [imageId, setImageId] = useState(initialImage?.id || null);
  const [selectedRole, setSelectedRole] = useState(initialImage?.role || 'MEDIUM');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  
  const fileInputRef = useRef(null);

  const ACCEPTED_TYPES = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml';
  const MAX_SIZE = 5 * 1024 * 1024;

  // Sincroniza com initialImage (para edição)
  useEffect(() => {
    if (initialImage) {
      setImageUrl(initialImage.url);
      setImageId(initialImage.id);
      setSelectedRole(initialImage.role || 'MEDIUM');
    } else {
      setImageUrl(null);
      setImageId(null);
      setSelectedRole('MEDIUM');
    }
  }, [initialImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setError('Arquivo muito grande. Máximo 5MB.');
      resetFileInput();
      return;
    }
    setError('');
    setSelectedFile(file);
    setImageUrl(null);
    setImageId(null);
    setFileInfo({ name: file.name, size: file.size, type: file.type });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('description', `role=${selectedRole}`);

    try {
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.post('/api/v1/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(interval);
      setProgress(100);

      const data = response.data;
      if (data.success && data.data?.image) {
        const { id, url } = data.data.image;
        const fullImageUrl = new URL(url, api.defaults.baseURL).href;
        setImageUrl(fullImageUrl);
        setImageId(id);
        setSelectedFile(null);
        setFileInfo(null);
        // Notifica o pai com os dados completos
        onImageProcessed({ 
          id,
          url: fullImageUrl, 
          role: selectedRole, 
          filename: selectedFile.name 
        });
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // Se há uma imagem carregada com ID, deleta do servidor
    if (imageUrl && imageId) {
      try {
        await api.delete(`/api/v1/images/${imageId}`);
      } catch (err) {
        console.error('Erro ao deletar imagem do servidor:', err);
        // Não impede a remoção local, apenas loga
      }
    }
    setSelectedFile(null);
    setImageUrl(null);
    setImageId(null);
    setFileInfo(null);
    setProgress(0);
    setError('');
    resetFileInput();
    if (onImageRemoved) onImageRemoved();
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
      console.log('handleRoleChange - novo papel:', newRole);
      setSelectedRole(newRole);
      // Se já há uma imagem carregada, notifica o pai sobre a mudança de papel
      if (imageUrl && imageId) {
        onImageProcessed({ id: imageId, url: imageUrl, role: newRole, filename: fileInfo?.name });
      }
  };

  const getImageClass = () => {
    switch (selectedRole) {
      case 'SMALL': return styles.previewImageSmall;
      case 'MEDIUM': return styles.previewImageMedium;
      case 'LARGE': return styles.previewImageLarge;
      default: return styles.previewImageMedium;
    }
  };

  // Prévia da questão completa (aparece apenas se houver imagem carregada)
  const renderFullPreview = () => {
    if (!imageUrl) return null;
    return (
      <div className={styles.fullPreview}>
        <h4>Pré-visualização da Questão</h4>
        <div className={styles.previewCard}>
          <div className={styles.previewEnunciado}>
            <strong>1)</strong> {questionStatement || 'Enunciado aparecerá aqui...'}
          </div>
          <div className={styles.previewImageContainer}>
            <img 
              src={imageUrl} 
              alt="Preview" 
              className={`${styles.previewImage} ${getImageClass()}`}
            />
          </div>
          <div className={styles.previewAlternativas}>
            {['A', 'B', 'C', 'D', 'E'].map(letra => (
              <div key={letra} className={styles.previewAlternativa}>
                <span className={correctAlternative?.toUpperCase() === letra ? styles.correctAlt : ''}>
                  {letra}) {alts[letra] || `Alternativa ${letra}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.imageUploader} ${disabled ? styles.disabled : ''}`}>
      <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} className={styles.fileInput} disabled={disabled || isUploading} />

      {/* Estado inicial: sem arquivo e sem imagem */}
      {!selectedFile && !imageUrl && (
        <div className={styles.uploadArea} onClick={triggerFileInput}>
          <div className={styles.uploadIcon}>📷</div>
          <h3>Clique para selecionar uma imagem</h3>
          <p>JPEG, PNG, GIF, WebP, SVG (max 5MB)</p>
          <button type="button" onClick={triggerFileInput} className={styles.uploadButton} disabled={disabled}>
            Selecionar Imagem
          </button>
        </div>
      )}

      {/* Arquivo selecionado, aguardando upload */}
      {selectedFile && !imageUrl && (
        <div className={styles.selectionPanel}>
          {fileInfo && (
            <div className={styles.imageInfo}>
              <h4>Arquivo selecionado:</h4>
              <div className={styles.infoGrid}>
                <div><span className={styles.infoLabel}>Nome:</span> {fileInfo.name}</div>
                <div><span className={styles.infoLabel}>Tamanho:</span> {(fileInfo.size/1024).toFixed(2)} KB</div>
                <div><span className={styles.infoLabel}>Tipo:</span> {fileInfo.type}</div>
              </div>
            </div>
          )}
          <div className={styles.roleSelection}>
            <label htmlFor="roleSelect">Papel Semântico:</label>
            <select id="roleSelect" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} disabled={isUploading || disabled}>
              <option value="SMALL">Pequena (120x90px)</option>
              <option value="MEDIUM">Média (200x150px)</option>
              <option value="LARGE">Grande (300x225px)</option>
            </select>
          </div>
          <div className={styles.actionButtons}>
            <button type="button" onClick={handleUpload} className={styles.processButton} disabled={isUploading || disabled}>
              {isUploading ? 'Enviando...' : 'Enviar Imagem'}
            </button>
            <button type="button" onClick={handleRemoveImage} className={styles.cancelButton} disabled={isUploading || disabled}>
              Cancelar
            </button>
          </div>
          {isUploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}><div className={styles.progressFill} style={{width:`${progress}%`}} /></div>
              <span>{progress}%</span>
            </div>
          )}
        </div>
      )}

      {/* Imagem carregada com sucesso */}
      {imageUrl && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h4>Imagem carregada</h4>
            <button type="button" onClick={handleRemoveImage} className={styles.removeButton} disabled={disabled}>
              Remover
            </button>
          </div>
          <div className={styles.previewInfo}>
            <p>URL: {imageUrl}</p>
            <div className={styles.roleSelection}>
              <label htmlFor="roleSelectAfter">Ajuste a prévia:</label>
              <select id="roleSelectAfter" value={selectedRole} onChange={handleRoleChange} disabled={disabled}>
                <option value="SMALL">Pequena</option>
                <option value="MEDIUM">Média</option>
                <option value="LARGE">Grande </option>
              </select>
            </div>
          </div>
          {renderFullPreview()}
        </div>
      )}

      {error && <div className={styles.errorMessage}>⚠️ {error}</div>}

      <div className={styles.instructions}>
        <h4>Instruções:</h4>
        <ul> 
          <li>Define o tamanho no PDF</li>
          <li>Selecione uma imagem (máx. 5MB)</li>
          <li>Clique em "Enviar Imagem" para fazer upload</li>
          <li>Após o upload, você pode alterar o papel sem reenviar a imagem</li>
          <li>Ao remover a imagem, ela será deletada do servidor automaticamente</li>
        </ul>
      </div>
    </div>
  );
}

export default ImageUploader;