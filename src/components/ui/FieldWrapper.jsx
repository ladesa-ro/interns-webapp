import styles from "./Field.module.css";

/**
 * Envoltório de rótulo, dica e erro compartilhado pelos controles de formulário.
 * `children` recebe os ids já calculados para ligar via aria-describedby.
 */
export default function FieldWrapper({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  children,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children({ describedBy, invalid: Boolean(error) })}

      {hint && (
        <span className={styles.hint} id={hintId}>
          {hint}
        </span>
      )}

      {error && (
        <span className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
