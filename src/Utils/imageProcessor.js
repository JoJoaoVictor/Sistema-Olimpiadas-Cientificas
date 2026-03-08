/**
 * Processador de Imagens para Questões
 * Redimensiona, comprime e converte para Base64 com metadados
 */

class ImageProcessor {
  // Configurações por papel semântico
  static ROLES = {
    SMALL: {
      name: 'Ilustrativa pequena',
      description: 'Ilustração complementar, ícone',
      maxWidth: 200,
      maxHeight: 150,
      scale: 0.5,
      quality: 0.7,
      align: 'CENTER'
    },
    MEDIUM: {
      name: 'Gráfico/figura média',
      description: 'Gráficos, diagramas, figuras explicativas',
      maxWidth: 400,
      maxHeight: 300,
      scale: 0.75,
      quality: 0.8,
      align: 'CENTER'
    },
    LARGE: {
      name: 'Figura principal',
      description: 'Imagem central do enunciado',
      maxWidth: 600,
      maxHeight: 450,
      scale: 1.0,
      quality: 0.9,
      align: 'CENTER'
    },
    FULL: {
      name: 'Imagem grande (excepcional)',
      description: 'Para casos especiais que exigem mais detalhe',
      maxWidth: 800,
      maxHeight: 600,
      scale: 1.0,
      quality: 0.95,
      align: 'CENTER'
    }
  };

  /**
   * Processa uma imagem do input file
   * @param {File} file - Arquivo de imagem
   * @param {string} role - Papel semântico (SMALL, MEDIUM, LARGE, FULL)
   * @param {Function} onProgress - Callback de progresso (0-100)
   * @returns {Promise<Object>} Objeto com metadados e base64
   */
  static async processImage(file, role = 'MEDIUM', onProgress = null) {
    return new Promise((resolve, reject) => {
      // Validação inicial
      this.validateFile(file);

      const reader = new FileReader();
      const config = this.ROLES[role] || this.ROLES.MEDIUM;

      reader.onloadstart = () => {
        if (onProgress) onProgress(10);
      };

      reader.onload = async (e) => {
        try {
          if (onProgress) onProgress(30);
          
          const img = new Image();
          img.onload = async () => {
            try {
              if (onProgress) onProgress(50);
              
              // Calcula dimensões mantendo proporção
              const { width, height } = this.calculateDimensions(
                img.width,
                img.height,
                config.maxWidth,
                config.maxHeight
              );

              if (onProgress) onProgress(70);

              // Redimensiona e comprime
              const base64 = await this.resizeAndCompress(
                img,
                width,
                height,
                config.quality
              );

              if (onProgress) onProgress(90);

              // Gera metadados
              const metadata = {
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                filename: file.name,
                context: 'QUESTION_STATEMENT',
                role,
                scale: config.scale,
                align: config.align,
                maxWidth: config.maxWidth,
                originalWidth: img.width,
                originalHeight: img.height,
                processedWidth: width,
                processedHeight: height,
                mimeType: 'image/jpeg',
                size: Math.round((base64.length * 3) / 4), // Tamanho aproximado em bytes
                compression: `${((1 - (base64.length / e.target.result.length)) * 100).toFixed(1)}%`,
                uploadedAt: new Date().toISOString()
              };

              if (onProgress) onProgress(100);

              resolve({
                ...metadata,
                src: base64
              });
            } catch (error) {
              reject(error);
            }
          };

          img.onerror = () => {
            reject(new Error('Erro ao carregar imagem'));
          };

          img.src = e.target.result;
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Valida o arquivo de imagem
   */
  static validateFile(file) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ACCEPTED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    if (!file) {
      throw new Error('Nenhum arquivo selecionado');
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}. Use: JPEG, PNG, GIF, WebP ou SVG`);
    }

    if (file.size > MAX_SIZE) {
      throw new Error(`Imagem muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 5MB`);
    }

    return true;
  }

  /**
   * Calcula dimensões mantendo proporção
   */
  static calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth;
    let height = originalHeight;

    // Redimensiona se maior que maxWidth
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.round(height * ratio);
    }

    // Redimensiona se maior que maxHeight
    if (height > maxHeight) {
      const ratio = maxHeight / height;
      height = maxHeight;
      width = Math.round(width * ratio);
    }

    return { width, height };
  }

  /**
   * Redimensiona e comprime imagem usando Canvas
   */
  static resizeAndCompress(img, width, height, quality = 0.8) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        
        // Configurações de qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Desenha a imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converte para base64 com compressão
        // Para PNG mantém transparência, para outros usa JPEG
        const mimeType = img.src.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);

        resolve(base64);
      } catch (error) {
        reject(new Error(`Erro ao processar imagem: ${error.message}`));
      }
    });
  }

  /**
   * Obtém informações básicas da imagem sem processar
   */
  static async getImageInfo(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            filename: file.name,
            type: file.type,
            size: file.size,
            dimensions: {
              width: img.width,
              height: img.height
            },
            aspectRatio: (img.width / img.height).toFixed(2)
          });
        };
        img.onerror = () => reject(new Error('Erro ao carregar imagem'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sugere papel semântico baseado nas dimensões
   */
  static suggestRole(width, height) {
    const area = width * height;
    
    if (area < 80000) return 'SMALL';      // Até ~300x300
    if (area < 180000) return 'MEDIUM';    // Até ~600x300
    if (area < 320000) return 'LARGE';     // Até ~800x400
    return 'FULL';                         // Acima disso
  }

  /**
   * Formata bytes para string legível
   */
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Valida se a imagem tem proporção adequada para provas
   */
  static validateAspectRatio(width, height) {
    const ratio = width / height;
    
    // Proporções extremas podem quebrar layout
    if (ratio < 0.3 || ratio > 3.0) {
      return {
        valid: false,
        warning: `Proporção extrema (${ratio.toFixed(2)}:1). Ideal entre 0.5 e 2.0`
      };
    }
    
    return { valid: true };
  }
}

export default ImageProcessor;