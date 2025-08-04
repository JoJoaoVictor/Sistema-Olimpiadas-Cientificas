import { useState } from 'react';
import styles from './ImageUploader.module.css';

// Componente para upload de imagem
function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Função para lidar com a mudança de imagem
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Função para abrir o input file quando o botão é clicado
  // Isso é necessário porque o input file está escondido
  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  return (
    <div className={styles.imageUploader}>
      {/* Campo de input file escondido */}
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Botão para abrir o input file */}
      <button
        type="button"
        onClick={triggerFileInput}
        className={styles.uploadButton}
      >
        Escolha uma imagem
      </button>

      {/* Exibe a imagem selecionada, se houver */}
      {selectedImage && (
        <div className={styles.preview}>
          <p>Pré-visualização:</p>
          <img src={selectedImage} alt="Pré-visualização da imagem" />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
