import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

function LatexText({ content }) {
  // Se content for undefined ou null, retorne null
  if (content === undefined || content === null) {
    return null;
  }

  // Converta para string caso não seja
  const contentString = String(content);

  const parts = contentString.split(/(\\\(.*?\\\)|\\\[.*?\\\])/);

  return parts.map((part, index) => {
    if (part.startsWith('\\(') && part.endsWith('\\)')) {
      const formula = part.slice(2, -2);
      return <InlineMath key={index} math={formula} />;
    } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
      const formula = part.slice(2, -2);
      return <BlockMath key={index} math={formula} />;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
}

export default LatexText;