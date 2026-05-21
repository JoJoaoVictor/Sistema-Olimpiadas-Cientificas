import styles from '../AdminUsers.module.css';

const ROLE_META = {
  ADMIN:     { label: 'Admin',     color: '#6f42c1', bg: '#f0eaff' },
  PROFESSOR: { label: 'Professor', color: '#0d6efd', bg: '#e7f0ff' },
  REVISOR:   { label: 'Revisor',   color: '#0ca678', bg: '#e6fcf5' },
  STUDENT:   { label: 'Estudante', color: '#fd7e14', bg: '#fff4e6' },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role?.toUpperCase()] || { label: role, color: '#888', bg: '#eee' };
  return (
    <span className={styles.role_badge} style={{ color: meta.color, backgroundColor: meta.bg }}>
      {meta.label}
    </span>
  );
}

export default RoleBadge;
