import styles from "./States.module.css";

/**
 * `rows > 0` troca o spinner por um esqueleto, útil em listas e tabelas.
 */
export default function LoadingState({
  message = "Carregando...",
  rows = 0,
  className = "",
}) {
  if (rows > 0) {
    return (
      <div
        className={[styles.skeletonList, className].filter(Boolean).join(" ")}
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">{message}</span>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className={styles.skeletonRow} aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[styles.state, className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
    >
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
