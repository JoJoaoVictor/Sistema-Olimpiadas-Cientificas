import { FiSearch, FiFilter, FiMapPin } from 'react-icons/fi';
import styles from '../AdminUsers.module.css';

function ToolBar({ 
  searchTerm, 
  onSearchChange, 
  roleFilter, 
  onRoleFilterChange, 
  cityFilter, 
  onCityFilterChange, 
  users, 
  filteredUsers, // 🌟 Nova prop para sincronizar os contadores de abas
  cities, 
  roleTabsConfig 
}) {

  // ── Contador Inteligente local ─────────────────────────────────────────────
  // Conta quantos usuários de cada role existem baseando-se no que está atualmente filtrado
  const getCountForTab = (tabKey) => {
    // Lista de referência: se já filtramos por cidade ou texto, calcula em cima dela
    const listToCount = filteredUsers || users; 

    if (tabKey === 'ALL') {
      return listToCount.length;
    }
    return listToCount.filter(u => u.role?.toUpperCase() === tabKey.toUpperCase()).length;
  };

  return (
    <div className={styles.toolbar}>
      
      {/* 1. Campo de Busca por Texto */}
      <div className={styles.search_box}>
        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. Filtro de Cidade/Polo (Alinhado ao Pydantic) */}
      <div className={styles.city_filter_wrapper}>
        <FiMapPin style={{ color: '#888', flexShrink: 0 }} />
        <select
          value={cityFilter}
          onChange={e => onCityFilterChange(e.target.value)}
          className={styles.city_select}
        >
          <option value="ALL">Todas as cidades</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Abas de Cargos (Roles) */}
      <div className={styles.role_tabs}>
        <FiFilter style={{ color: '#888', flexShrink: 0 }} />
        {roleTabsConfig.map(t => (
          <button
            key={t.key}
            className={`${styles.role_tab} ${roleFilter === t.key ? styles.role_tab_active : ''}`}
            onClick={() => onRoleFilterChange(t.key)}
          >
            {t.label}
            <span className={styles.tab_count}>
              {getCountForTab(t.key)} {/* 🌟 Contador dinâmico e reativo */}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToolBar;