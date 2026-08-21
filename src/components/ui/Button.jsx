import styles from "./Button.module.css";

const VARIANTS = new Map([
  ["primary", styles.primary],
  ["secondary", styles.secondary],
  ["danger", styles.danger],
  ["ghost", styles.ghost],
]);

const SIZES = new Map([
  ["sm", styles.sm],
  ["md", styles.md],
  ["lg", styles.lg],
]);

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  loadingLabel = "Carregando",
  className = "",
  ...rest
}) {
  const classes = [
    styles.button,
    VARIANTS.get(variant) ?? styles.primary,
    SIZES.get(size) ?? styles.md,
    fullWidth ? styles.fullWidth : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
      {children}
    </button>
  );
}
