import styles from "./Card.module.css";

const PADDINGS = new Map([
  ["none", styles.none],
  ["md", styles.md],
  ["lg", styles.lg],
]);

/**
 * Renderiza um `button` quando `onClick` é informado, para que o card
 * permaneça focável e acionável por teclado.
 */
export default function Card({
  children,
  padding = "md",
  elevated = false,
  onClick,
  className = "",
  ...rest
}) {
  const classes = [
    styles.card,
    PADDINGS.get(padding) ?? styles.md,
    elevated ? styles.elevated : "",
    onClick ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} {...rest}>
        {children}
      </button>
    );
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
