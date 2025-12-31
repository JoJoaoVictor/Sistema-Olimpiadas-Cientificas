import styles from "./Usuario.module.css"; 
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// Ícones
import { FiLogOut, FiCalendar, FiUser, FiMail, FiCheckCircle } from "react-icons/fi";
import { RiLock2Line } from "react-icons/ri";
import { BsPencil } from 'react-icons/bs';

function Usuario() {
  const { signout } = useAuth();
  const navigate = useNavigate();

  // Imagem padrão caso tudo falhe
  const DEFAULT_IMAGE = "https://placehold.co/150?text=Foto";

  // --- Estados de Exibição (Dados do Usuário) ---
  const [name, setName] = useState("Usuário");
  const [email, setEmail] = useState("Carregando...");
  const [profilePic, setProfilePic] = useState(DEFAULT_IMAGE); 
  const [role, setRole] = useState("Estudante"); 
  const [createdAt, setCreatedAt] = useState("..."); 
  const [hasPassword, setHasPassword] = useState(false); 
  
  // --- Estados dos Modais ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // --- Estados do Formulário de Edição ---
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  
  // --- Estados do Formulário de Senha ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================================
  // 1. CARREGAR DADOS INICIAIS (DO LOCALSTORAGE)
  // =========================================================
  useEffect(() => {
    const storedData = localStorage.getItem("user_token");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        if (parsedData.user) {
          const user = parsedData.user;
          const userName = user.name || "Usuário";

          // Preenche os dados visuais
          setName(userName);
          setEmail(user.email || "Email não disponível");
          setRole(user.role || "Estudante");
          setHasPassword(user.has_password); 

          // Preenche o formulário de edição
          setEditName(userName);
          
          // Lógica de Prioridade da Imagem
          let currentUrl = "";
          if (user.avatar_url) {
            setProfilePic(user.avatar_url);
            currentUrl = user.avatar_url;
          } else if (user.picture) {
             setProfilePic(user.picture);
             currentUrl = user.picture;
          } else {
            // Gerador de avatar com iniciais
            const autoAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=150`;
            setProfilePic(autoAvatar);
          }
          setEditAvatarUrl(currentUrl);

          // Formata a data
          if (user.created_at) {
            const date = new Date(user.created_at);
            setCreatedAt(date.toLocaleDateString('pt-BR'));
          }
        } 
      } catch (error) {
        console.error("Erro ao ler dados locais:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    signout();
    navigate("/login");
  };

  // =========================================================
  // 2. FUNÇÃO DE SALVAR PERFIL 
  // =========================================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Recupera o Token atual
    const storedData = JSON.parse(localStorage.getItem("user_token"));
    const token = storedData?.token || storedData?.access_token; // Garante pegar o token certo
    
    if (!token) {
        alert("Sessão expirada. Faça login novamente.");
        return;
    }

    // Define a imagem final (se vazio, gera automático)
    let finalAvatarUrl = editAvatarUrl;
    if (!finalAvatarUrl || finalAvatarUrl.trim() === "") {
        finalAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}&background=random&size=150`;
    }

    try {
      // Requisição para atualizar o perfil
        const response = await fetch(`http://127.0.0.1:8000/api/v1/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: editName,
                avatar_url: finalAvatarUrl
            })
        });

        if (response.ok) {
            // 1. Atualiza a tela imediatamente (Feedback visual)
            setName(editName); 
            setProfilePic(finalAvatarUrl);

            // 2. Atualiza o LocalStorage (Para persistir se der F5)
            // Mantemos os dados antigos e só mudamos o que foi editado
            const updatedUser = { 
                ...storedData.user, 
                name: editName, 
                avatar_url: finalAvatarUrl, 
                picture: finalAvatarUrl 
            };
            
            localStorage.setItem("user_token", JSON.stringify({ ...storedData, user: updatedUser }));

            setShowEditModal(false);
            alert("Perfil atualizado com sucesso!");
        } else {
            const errorData = await response.json();
            alert(`Erro ao salvar: ${errorData.detail || errorData.message || 'Erro desconhecido'}`);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão com o servidor.");
    }
  };
  // =========================================================
  // 3. FUNÇÃO DE ALTERAR SENHA
  // =========================================================
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não conferem.");
      return;
    }

    const storedData = JSON.parse(localStorage.getItem("user_token"));
    const token = storedData?.token || storedData?.access_token;

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/users/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                current_password: currentPassword, // Senha atual (obrigatória se tiver senha)
                new_password: newPassword
            })
        });

        if (response.ok) {
            alert("Senha alterada com sucesso!");
            // Limpa os campos e fecha modal
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordModal(false);
        } else {
            const errorData = await response.json();
            alert(`Erro: ${errorData.detail || 'Falha ao alterar senha'}`);
        }
    } catch (error) {
        alert("Erro de conexão ao tentar alterar senha.");
    }
  };

  return (
    <div className={styles.page_wrapper}>
      <div className={styles.container}>
        
        {/* === CARD DA ESQUERDA (FOTO E BOTÕES) === */}
        <aside className={styles.profile_card}>
          <div className={styles.profile_header}>
            <img 
              className={styles.avatar}
              src={profilePic} 
              alt="Perfil"
              // Handler de erro robusto para imagens quebradas
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }} 
            />
            <h2 className={styles.user_name}>{name}</h2>
            <span className={styles.user_badge}>{role}</span>
          </div>

          <div className={styles.action_buttons}>
            <button className={styles.btn_outline} onClick={() => setShowEditModal(true)}>
              <BsPencil /> Editar Perfil
            </button>
            <button className={styles.btn_outline} onClick={() => setShowPasswordModal(true)}>
              <RiLock2Line /> {hasPassword ? "Alterar Senha" : "Criar Senha"}
            </button>
            <button className={`${styles.btn_outline} ${styles.btn_danger}`} onClick={handleLogout}>
              <FiLogOut /> Sair
            </button>
          </div>
        </aside>

        {/* === CARD DA DIREITA (DETALHES) === */}
        <main className={styles.details_section}>
          <div className={styles.section_title}>
            <h3>Informações da Conta</h3>
            <p>Seus dados pessoais cadastrados no sistema.</p>
          </div>

          <div className={styles.info_grid}>
            <div className={styles.info_item}>
              <label><FiUser /> Nome Completo</label>
              <p>{name}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiMail /> Email</label>
              <p>{email}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiCheckCircle /> Cargo</label>
              <p>{role}</p>
            </div>
            <div className={styles.info_item}>
              <label><FiCalendar /> Membro Desde</label>
              <p>{createdAt}</p>
            </div>
            <div className={styles.info_item}>
               <label>Status da Conta</label>
               <span className={styles.status_active}>Ativo</span>
            </div>
          </div>
        </main>
      </div>

      {/* === MODAL: EDITAR PERFIL === */}
      {showEditModal && (
        <div className={styles.modal_overlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Perfil</h3>
            <form onSubmit={handleSaveProfile}>
              
              <div className={styles.form_group}>
                <label>Nome Completo</label>
                <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    required 
                />
              </div>

              <div className={styles.form_group}>
                <label>URL da Imagem (Avatar)</label>
                <input 
                    type="text" 
                    placeholder="Cole o link da sua imagem..."
                    value={editAvatarUrl} 
                    onChange={(e) => setEditAvatarUrl(e.target.value)} 
                />
              </div>  

              {/* Preview da Imagem no Modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                 <span style={{fontSize: '0.8rem', color: '#666'}}>Pré-visualização:</span>
                 <img 
                   src={editAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(editName)}`}
                   alt="Preview"
                   style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }}
                   onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
                 />
              </div>

              <div className={styles.modal_actions}>
                <button type="button" className={styles.btn_cancel} onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn_save}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL: ALTERAR SENHA === */}
      {showPasswordModal && (
        <div className={styles.modal_overlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
            <h3>Segurança</h3>
            <form onSubmit={handleChangePassword}>
              {hasPassword && (
                <div className={styles.form_group}>
                  <label>Senha Atual</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="Digite sua senha atual"
                    required 
                  />
                </div>
              )}
              
              <div className={styles.form_group}>
                <label>Nova Senha</label>
                <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Mínimo 6 caracteres"
                    required 
                    minLength={6}
                />
              </div>
              
              <div className={styles.form_group}>
                <label>Confirmar Nova Senha</label>
                <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Repita a nova senha"
                    required 
                    minLength={6}
                />
              </div>

              <div className={styles.modal_actions}>
                <button type="button" className={styles.btn_cancel} onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btn_save}>Atualizar Senha</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuario;