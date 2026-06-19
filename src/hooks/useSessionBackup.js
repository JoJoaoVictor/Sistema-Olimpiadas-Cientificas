import { useEffect } from 'react';

/**
 * Salva dados em sessionStorage quando a sessão expirar (evento 'session-expired').
 * @param {string} key - Chave usada no sessionStorage.
 * @param {object} data - Dados atuais a serem salvos.
 * @param {boolean} enabled - Se true, o hook fica ativo.
 */
export default function useSessionBackup(key, data, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = () => {
      if (data && Object.keys(data).length > 0) {
        sessionStorage.setItem(key, JSON.stringify(data));
      }
    };

    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, [key, data, enabled]);
}