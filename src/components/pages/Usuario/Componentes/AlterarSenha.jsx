import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../../services/userService';
import styles from './../Usuario.module.css';

const AlterarSenha = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const stored = JSON.parse(localStorage.getItem("user_token"));

    try {
      await userService.changePassword({ current_password: currentPassword, new_password: newPassword }, stored.access_token);
      alert("Senha alterada com Sucesso! Faça login novamente por segurança.");
      // Opcional: Deslogar o usuário
      // localStorage.removeItem("user_token");
      // navigate('/login');
      navigate('/usuario');
      window.location.reload(); // Força recarregar para atualizar estado de autenticação
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Alterar Senha</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '20px auto' }}>
        
        <div className={styles.bordas}>
            <label>Senha Atual:</label>
            <input 
              type="password" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
        </div>

        <div className={styles.bordas}>
            <label>Nova Senha:</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
        </div>

        <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Confirmar Troca
        </button>
        <button type="button" onClick={() => navigate('/usuario')} style={{ padding: '10px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default AlterarSenha;