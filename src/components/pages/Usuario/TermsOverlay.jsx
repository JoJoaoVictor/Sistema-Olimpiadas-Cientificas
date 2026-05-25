import { useState } from 'react';
import { FiShield, FiCheckCircle, FiLock } from 'react-icons/fi';
import api from '../../../services/api'; // Ajuste o caminho do seu serviço de axios/api
import styles from './TermsOverlay.module.css';

function TermsOverlay({ user, onAcceptComplete }) {
  const [loading, setLoading] = useState(false);

  // Fallback seguro de avatar para compor a identidade visual do termo
  const getAvatar = () => {
    if (user?.avatar_url && user.avatar_url.trim() !== "") return user.avatar_url;
    if (user?.avatarUrl && user.avatarUrl.trim() !== "") return user.avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'UNEMAT')}&background=random&color=fff&size=100`;
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Chama o endpoint no backend que criamos no app/api/v1/users.py
      const response = await api.post('/api/v1/users/accept-terms');
      if (response.data?.success) {
        onAcceptComplete(); // Fecha o overlay e atualiza o estado na Home
      }
    } catch (error) {
      console.error("Erro ao registrar aceite dos termos de privacidade:", error);
      alert("Houve um erro ao salvar o seu consentimento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal_box}>
        
        {/* Topo / Perfil Simplificado */}
        <div className={styles.header}>
          <div className={styles.avatar_container}>
            <img src={getAvatar()} alt="User Avatar" className={styles.user_avatar} />
            <div className={styles.shield_badge}><FiShield size={14} /></div>
          </div>
          <h2>Termos de Uso &amp; Privacidade</h2>
          <p>Olá, <strong>{user?.name}</strong>. Para garantir a segurança dos seus dados e a conformidade institucional com a <strong>LGPD</strong>, revise e aceite as diretrizes do nosso ecossistema acadêmico.</p>
        </div>

        {/* Bloco de Termos com Scroll Dinâmico */}
        <div className={styles.terms_content}>
          <h3>1. Objetivo da Plataforma</h3>
          <p>
            Este sistema é um ecossistema educacional de suporte acadêmico voltado à criação, revisão, armazenamento e gerenciamento de banco de questões e exames no âmbito da <strong>UNEMAT</strong>. Ao prosseguir, você concorda em utilizar as ferramentas estritamente para fins institucionais e pedagógicos.
          </p>

          <h3>2. Dados Pessoais Coletados e Finalidade</h3>
          <p>
            Em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), coletamos apenas as informações estritamente necessárias para a execução das atividades do ecossistema:
          </p>
          <ul>
            <li><strong>Perfil Básico:</strong> Nome completo, e-mail e foto/avatar (para identificação e autoria).</li>
            <li><strong>Identificação Acadêmica:</strong> CPF, número de matrícula ou registro funcional, polo/câmpus e curso correlato (para validação do vínculo institucional).</li>
            <li><strong>Histórico de Produção:</strong> Registro de questões cadastradas, alterações efetuadas, logs de auditoria de revisão e provas montadas.</li>
          </ul>

          <h3>3. Uso Seguro e Proteção do CPF</h3>
          <p>
            O seu <strong>CPF</strong> é uma informação pessoal protegida e tratada sob sigilo administrativo. Sua coleta possui base legal fundamentada na prevenção de fraudes, singularidade de contas e, principalmente, para fins de **atribuição legal de autoria e propriedade intelectual** das questões inseridas na base de dados.
          </p>

          <h3>4. Exclusão de Conta e Política de Retenção</h3>
          <p>
            Caso você solicite o encerramento do seu cadastro na plataforma, todas as informações que permitam sua identificação direta (como CPF, e-mail e nome) serão permanentemente excluídas dos nossos servidores em conformidade com o direito ao esquecimento. 
          </p>
          <p>
            Contudo, para preservar a integridade referencial pedagógica do sistema, as questões e provas que você tiver criado serão mantidas no acervo público da UNEMAT de forma totalmente <strong>anonimizada</strong> (atribuídas a um "Autor Removido").
          </p>

          <h3>5. Direitos do Usuário</h3>
          <p>
            Você possui o direito garantido por lei de acessar, atualizar ou retificar seus dados pessoais a qualquer momento. Isto pode ser feito diretamente acessando a aba <strong>"Minha Conta"</strong> em seu painel de perfil.
          </p>
        </div>

        {/* Rodapé de Consentimento */}
        <div className={styles.footer_actions}>
          <div className={styles.notice}>
            <FiLock size={13} style={{ marginRight: '6px', flexShrink: 0 }} />
            <span>Seus dados pessoais trafegam em canais criptografados protegidos por HTTPS.</span>
          </div>
          <button 
            className={styles.btn_accept} 
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.spinner} />
            ) : (
              <>
                <FiCheckCircle style={{ marginRight: '8px' }} /> Aceitar e Continuar
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default TermsOverlay;