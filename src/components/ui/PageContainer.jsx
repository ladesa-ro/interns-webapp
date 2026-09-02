import styles from "./PageContainer.module.css";

export default function PageContainer({
  children,
  wide = false,
  className = "",
  ...rest
}) {
  return (
    <div
      className={[styles.container, wide ? styles.wide : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
