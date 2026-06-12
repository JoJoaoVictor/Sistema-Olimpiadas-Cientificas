import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  //  Sinaliza se a autenticação falhou
  const [authFailed, setAuthFailed] = useState(false);

  const fetchNotifications = async () => {
    // Se a autenticação já falhou antes, nem tenta fazer a requisição
    if (authFailed) return;

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!user || !token) return;

    setLoading(true);
    try {
      const response = await api.get('/api/v1/notifications?limit=50&offset=0');
      
      const data = response.data.data || response.data;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
      setError(null);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.warn('Sessão expirada. Parando o loop de notificações.');
        setError('Sessão expirada. Faça login novamente.');
        // TRAVA FINAL: Altera o estado para parar o loop no useEffect
        setAuthFailed(true);
      } else {
        console.error('Erro ao buscar notificações:', error);
        setError('Erro ao carregar notificações');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    //Condição: Se não tiver usuário/token OU se a auth já tiver falhado, interrompe.
    if (!user || !token || authFailed) return;

    fetchNotifications(); 
    
    const interval = setInterval(() => {
      // Dupla checagem: o loop não vai mais rodar se authFailed for true
      if (!authFailed) {
        fetchNotifications();
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [user, authFailed]); 

  // O resto das suas funções continuam idênticas...
  const handleMarkAsRead = async (notificationId, entityId, entityType) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const route =
        entityType === 'QUESTION'
          ? `/projects?id=${entityId}`
          : `/Prova?id=${entityId}`;
      navigate(route);
      setIsOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      alert('Erro ao marcar notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setIsOpen(false);
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar todos:', error);
      alert('Erro ao marcar notificações como lidas');
    }
  };

  if (!user) return null;

  return (
    <div className={styles.notificationBell}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <FiBell size={20} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.notificationDropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notificações</h3>
            {unreadCount > 0 && (
              <button
                className={styles.markAllBtn}
                onClick={handleMarkAllAsRead}
              >
                Marcar tudo como lido
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {error && (
              <div className={styles.errorMessage}>
                <p>{error}</p>
              </div>
            )}

            {loading && notifications.length === 0 && (
              <div className={styles.loadingMessage}>
                <p>Carregando... Aguarde.</p>
              </div>
            )}

            {!loading && notifications.length === 0 && !error && (
              <div className={styles.emptyMessage}>
                <p>Sem notificações</p>
              </div>
            )}

            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`${styles.notificationItem} ${
                  notif.is_read ? styles.read : styles.unread
                }`}
                onClick={() =>
                  handleMarkAsRead(notif.id, notif.entity_id, notif.entity_type)
                }
              >
                <div className={styles.notifContent}>
                  <strong>{notif.title}</strong>
                  <p>
                    {notif.triggered_by_user?.name && (
                      <span className={styles.editor}>
                        {notif.triggered_by_user.name}:{' '}
                      </span>
                    )}
                    {notif.message}
                  </p>
                  <small>{formatDate(notif.created_at)}</small>
                </div>
                {!notif.is_read && <span className={styles.dot}>●</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}