import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * LatexText v3.0 - Renderizador focado estritamente em delimitadores LaTeX padrão.
 * * Correções nesta versão:
 * - Desativado o uso de '$' e '$$' como delimitadores matemáticos.
 * - Valores monetários como 'R$ 239,00' agora são processados naturalmente como texto.
 * - Remoção de regexes agressivas de sanitização que injetavam barras invertidas extras.
 */

const LatexText = ({ 
  content, 
  className = '',
  fontSize = 'inherit',
  lineHeight = 1.6
}) => {

  // Configurações padrão do KaTeX
  const katexOptions = useMemo(() => ({
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    strict: false,
    maxSize: Infinity,
    maxExpand: 1000,
    trust: false, 
  }), []);

  // Processa o conteúdo dividindo o que é texto puro do que é LaTeX real \([...]\)
  // Processa o conteúdo dividindo o que é texto puro do que é LaTeX real \([...]\)
  const parts = useMemo(() => {
    if (!content || typeof content !== 'string') return [];

    try {
      // REGEX CORRIGIDA: Sem espaços, captura exatamente \(...\) e \[...\]
      const mathRegex = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;
      
      const result = [];
      let lastIndex = 0;
      let match;

      while ((match = mathRegex.exec(content)) !== null) {
        // 1. Captura o texto puro contido antes da fórmula matemática
        if (match.index > lastIndex) {
          result.push({
            type: 'text',
            content: content.substring(lastIndex, match.index)
          });
        }

        // 2. Captura a fórmula matemática encontrada
        const mathContent = match[0];
        let displayMode = false;
        let formula = mathContent;

        // Extrai o conteúdo interno das tags de bloco ou inline
        if (mathContent.startsWith('\\[') && mathContent.endsWith('\\]')) {
          formula = mathContent.slice(2, -2).trim();
          displayMode = true;
        } else if (mathContent.startsWith('\\(') && mathContent.endsWith('\\)')) {
          formula = mathContent.slice(2, -2).trim();
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
          console.warn('Erro ao renderizar fórmula KaTeX:', formula, error);
          result.push({
            type: 'text',
            content: mathContent
          });
        }

        lastIndex = match.index + mathContent.length;
      }

      // 3. Captura o restante do texto após a última fórmula encontrada
      if (lastIndex < content.length) {
        result.push({
          type: 'text',
          content: content.substring(lastIndex)
        });
      }

      return result;
      
    } catch (error) {
      console.error('Erro ao processar conteúdo no interpretador:', error);
      return [{
        type: 'text',
        content: content
      }];
    }
  }, [content, katexOptions]);
  
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
              key={`math-${index}-${part.content.substring(0, 15)}`}
              className={part.displayMode ? 'katex-display' : 'katex'}
              style={{ fontSize, lineHeight }}
              dangerouslySetInnerHTML={{ __html: part.content }}
            />
          );
        }
        return (
          <span 
            key={`text-${index}-${part.content.substring(0, 15)}`}
            style={{ fontSize, lineHeight }}
          >
            {part.content}
          </span>
        );
      })}
    </div>
  );
};

// Componente utilitário para textos puramente matemáticos inline
export const InlineMathText = ({ children, ...props }) => {
  return (
    <LatexText 
      content={`\\(${children}\\)`}
      fontSize="1em"
      {...props}
    />
  );
};

// Componente utilitário para blocos de matemática isolados
export const BlockMathText = ({ children, ...props }) => {
  return (
    <div style={{ margin: '1em 0' }}>
      <LatexText 
        content={`\\[${children}\\]`}
        {...props}
      />
    </div>
  );
};

export default LatexText;