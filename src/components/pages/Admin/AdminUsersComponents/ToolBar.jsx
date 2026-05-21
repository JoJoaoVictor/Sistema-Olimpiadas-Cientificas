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
  cities, 
  countByRole, 
  roleTabsConfig 
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.search_box}>
        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filtro de Cidade/Polo */}
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
              {t.key === 'ALL' ? users.length : countByRole(t.key)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToolBar;
