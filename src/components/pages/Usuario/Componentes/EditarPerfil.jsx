import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../../../services/userService';
import styles from './../Usuario.module.css'; // Reutilizando seu CSS

const EditarPerfil = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar dados ao abrir a tela
  useEffect(() => {
    const loadData = async () => {
      const stored = JSON.parse(localStorage.getItem("user_token"));
      if (stored && stored.access_token) {
        // Puxa do backend para garantir que está atualizado
        try {
            const userData = await userService.getMe(stored.access_token);
            setName(userData.name);
            setAvatarUrl(userData.avatar_url || "");
        } catch (error) {
            console.error(error);
        }
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const stored = JSON.parse(localStorage.getItem("user_token"));
    
    try {
      const updatedUser = await userService.updateProfile({ name, avatar_url: avatarUrl }, stored.access_token);
      
      // Atualiza o localStorage para refletir a mudança instantaneamente
      stored.user = { ...stored.user, ...updatedUser };
      localStorage.setItem("user_token", JSON.stringify(stored));

      alert("Perfil atualizado com sucesso!");
      navigate('/usuario');
      window.location.reload(); // Força recarregar para atualizar dados na tela de perfil
    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Editar Perfil</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '20px auto' }}>
        
        <div className={styles.bordas}>
            <label>Nome:</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            />
        </div>

        <div className={styles.bordas}>
            <label>URL da Imagem:</label>
            <input 
              type="text" 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            />
        </div>

        {/* Preview */}
        {avatarUrl && (
            <div style={{textAlign: 'center'}}>
                <img src={avatarUrl} alt="Preview" style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover'}} onError={(e) => e.target.style.display='none'}/>
            </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
        <button type="button" onClick={() => navigate('/usuario')} style={{ padding: '10px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default EditarPerfil;