import styles from '../AdminUsers.module.css';

function StatCard({ label, value, icon, color }) {
  return (
    <div className={styles.stat_card} style={{ borderTop: `3px solid ${color}` }}>
      <span className={styles.stat_icon} style={{ color }}>
        {icon}
      </span>
      <div>
        <strong className={styles.stat_value}>{value}</strong>
        <span className={styles.stat_label}>{label}</span>
      </div>
    </div>
  );
}

export default StatCard;
