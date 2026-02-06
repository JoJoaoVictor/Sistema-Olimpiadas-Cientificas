import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * LatexText v2.0 - Renderizador robusto de LaTeX
 * 
 * Melhorias vs v1.0:
 * - Sanitização de R$ antes do parsing (previne bugs)
 * - Regex simplificada e mais confiável
 * - Performance otimizada (useMemo depende apenas de content)
 * - Keys únicas no map (previne bugs de re-render)
 * - Segurança melhorada (trust: false)
 */

const LatexText = ({ 
  content, 
  className = '',
  fontSize = 'inherit',
  lineHeight = 1.6
}) => {
  // Sanitização de LaTeX (camada extra de proteção no frontend)
  const sanitizeLatex = (text) => {
    if (!text) return '';
    
    // 1. Protege R$ (principal problema que quebra layout)
    // "R$ 13,00" → "R\$ 13,00" (escapa o $)
    text = text.replace(/R\$\s*(?=\d)/g, 'R\\$ ');
    
    // 2. Remove fórmulas vazias (geram problemas de renderização)
    text = text.replace(/\$\s{0,3}\$/g, '');
    text = text.replace(/\\\(\s{0,3}\\\)/g, '');
    
    // 3. Balanceia delimitadores $ (remove $ ímpar)
    const dollarCount = (text.match(/\$/g) || []).length - (text.match(/\\\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      const idx = text.lastIndexOf('$');
      if (idx !== -1 && (idx === 0 || text[idx-1] !== '\\')) {
        text = text.substring(0, idx) + text.substring(idx + 1);
      }
    }
    
    return text;
  };

  // Configurações do KaTeX
  const katexOptions = useMemo(() => ({
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    maxSize: Infinity,
    maxExpand: 1000,
    trust: false, // Segurança: não permite comandos perigosos
  }), []);

  // Processa o conteúdo e cria array de parts (OTIMIZADO)
  const parts = useMemo(() => {
    if (!content || typeof content !== 'string') return [];

    try {
      // SANITIZA ANTES de processar
      const sanitized = sanitizeLatex(content);
      
      // Regex SIMPLIFICADA (confiamos na sanitização para proteger R$)
      // Captura: \[...\], $$...$$, \(...\), $...$
      const mathRegex = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([^)]*?\\\)|\$[^$\n]+?\$)/g;
      
      const result = [];
      let lastIndex = 0;
      let match;

      while ((match = mathRegex.exec(sanitized)) !== null) {
        // Texto antes da fórmula
        if (match.index > lastIndex) {
          result.push({
            type: 'text',
            content: sanitized.substring(lastIndex, match.index)
          });
        }

        // Fórmula matemática
        const mathContent = match[0];
        let displayMode = false;
        let formula = mathContent;

        // Determina o tipo de fórmula e extrai conteúdo
        if (mathContent.startsWith('\\[') && mathContent.endsWith('\\]')) {
          formula = mathContent.slice(2, -2).trim();
          displayMode = true;
        } else if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
          formula = mathContent.slice(2, -2).trim();
          displayMode = true;
        } else if (mathContent.startsWith('\\(') && mathContent.endsWith('\\)')) {
          formula = mathContent.slice(2, -2).trim();
        } else if (mathContent.startsWith('$') && mathContent.endsWith('$')) {
          formula = mathContent.slice(1, -1).trim();
        }

        try {
          const html = katex.renderToString(formula, {
            ...katexOptions,
            displayMode
          });
          result.push({
            type: 'math',
            content: html,
            displayMode
          });
        } catch (error) {
          console.warn('Erro ao renderizar fórmula:', formula, error);
          // Fallback: mostra como texto se der erro
          result.push({
            type: 'text',
            content: mathContent
          });
        }

        lastIndex = match.index + mathContent.length;
      }

      // Texto restante após a última fórmula
      if (lastIndex < sanitized.length) {
        result.push({
          type: 'text',
          content: sanitized.substring(lastIndex)
        });
      }

      return result;
      
    } catch (error) {
      console.error('Erro ao processar conteúdo:', error);
      // Fallback: retorna conteúdo original como texto
      return [{
        type: 'text',
        content: content
      }];
    }
  }, [content, katexOptions]); // Depende apenas de content e katexOptions

  // Renderiza (separado do useMemo para aplicar estilos dinâmicos)
  return (
    <div 
      className={`latex-container ${className}`}
      style={{ 
        fontSize,
        lineHeight,
        wordBreak: 'normal',
        whiteSpace: 'normal'
      }}
    >
      {parts.map((part, index) => {
        if (part.type === 'math') {
          return (
            <span
              key={`math-${index}-${part.content.substring(0, 20)}`}
              className={part.displayMode ? 'katex-display' : 'katex'}
              style={{ fontSize, lineHeight }}
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          );
        }
        return (
          <span 
            key={`text-${index}-${part.content.substring(0, 20)}`}
            style={{ fontSize, lineHeight }}
          >
            {part.content}
          </span>
        );
      })}
    </div>
  );
};

// Componente específico para textos com LaTeX inline
export const InlineMathText = ({ children, ...props }) => {
  return (
    <LatexText 
      content={`\\(${children}\\)`}
      fontSize="1em"
      {...props}
    />
  );
};

// Componente para blocos de matemática
export const BlockMathText = ({ children, ...props }) => {
  return (
    <div style={{ margin: '1em 0' }}>
      <LatexText 
        content={`$$${children}$$`}
        {...props}
      />
    </div>
  );
};

export default LatexText;