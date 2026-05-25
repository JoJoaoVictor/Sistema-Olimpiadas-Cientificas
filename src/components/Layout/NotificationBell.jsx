import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import styles from './NotificationBell.module.css';

/**
 * NotificationBell Component
 * Display system notifications with polling every 30s
 * Uses centralized API service (Axios) from project
 */
export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async () => {
    // TRAVA DE SEGURANÇA 1: Garante que há um token salvo antes de disparar
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
      // TRAVA DE SEGURANÇA 2: Se for 401, lida silenciosamente para não poluir o console do navegador
      if (error.response && error.response.status === 401) {
        console.warn('Sessão expirada ou token ausente. Busca de notificações pausada.');
        setError('Sessão expirada. Faça login novamente.');
      } else {
        console.error('Erro ao buscar notificações:', error);
        setError('Erro ao carregar notificações');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Setup polling interval on mount
   */
  useEffect(() => {
    // Inicia fluxo inicial
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!user || !token) return;

    fetchNotifications(); 
    
    // Configura o loop a cada 30 segundos
    const interval = setInterval(() => {
      // Verifica novamente antes de cada ciclo do polling (caso o usuário tenha deslogado em outra aba)
      const currentToken = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (currentToken) {
        fetchNotifications();
      }
    }, 30000); 

    // Limpa o loop ao desmontar o componente
    return () => clearInterval(interval);
  }, [user]); // Monitora a mudança do usuário

  /**
   * Mark single notification as read and navigate to entity
   */
  const handleMarkAsRead = async (notificationId, entityId, entityType) => {
    try {
      await api.patch(`/api/v1/notifications/${notificationId}/read`);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate to entity
      const route =
        entityType === 'QUESTION'
          ? `/projects?id=${entityId}`
          : `/Prova?id=${entityId}`;
      navigate(route);

      // Close dropdown
      setIsOpen(false);

      // Fetch latest to sync with backend
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      alert('Erro ao marcar notificação como lida');
    }
  };

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/read-all');
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setIsOpen(false);

      // Fetch latest to sync
      fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar todos:', error);
      alert('Erro ao marcar notificações como lidas');
    }
  };

  // Only render if user is authenticated
  if (!user) return null;

  return (
    <div className={styles.notificationBell}>
      {/* Bell Button */}
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificações"
      >
        <FiBell size={20} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {/* Dropdown Menu */}
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

/**
 * Format date: "agora", "5m atrás", "2h atrás", "3d atrás", ou data
 */
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