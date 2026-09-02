import styles from "./Badge.module.css";

const TONES = new Map([
  ["neutral", styles.neutral],
  ["success", styles.success],
  ["danger", styles.danger],
  ["warning", styles.warning],
  ["info", styles.info],
]);

export default function Badge({
  children,
  tone = "neutral",
  className = "",
  ...rest
}) {
  const classes = [styles.badge, TONES.get(tone) ?? styles.neutral, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
