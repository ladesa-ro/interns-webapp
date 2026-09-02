import styles from "./States.module.css";

export default function EmptyState({
  title = "Nada por aqui",
  message,
  icon: Icon,
  action,
  className = "",
}) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(" ")}>
      {Icon && <Icon className={styles.icon} size={40} aria-hidden="true" />}
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  );
}
