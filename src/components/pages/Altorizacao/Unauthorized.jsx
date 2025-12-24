import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🚫 Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <button onClick={() => navigate(-1)}>Voltar</button>
    </div>
  );
};

export default Unauthorized;