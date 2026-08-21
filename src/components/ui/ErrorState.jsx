import Button from "./Button";
import styles from "./States.module.css";

export default function ErrorState({
  title = "Não foi possível carregar",
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  className = "",
}) {
  return (
    <div
      className={[styles.state, className].filter(Boolean).join(" ")}
      role="alert"
    >
      <h2 className={[styles.title, styles.errorTitle].join(" ")}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
