import { Link } from "react-router-dom";
import styles from "./PageHeader.module.css";

export default function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  id,
}) {
  return (
    <header className={styles.header}>
      <div>
        {breadcrumbs?.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Trilha de navegação">
            <ol className={styles.breadcrumbList}>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.to ?? crumb.label} className={styles.breadcrumbItem}>
                    {crumb.to && !isLast ? (
                      <Link className={styles.breadcrumbLink} to={crumb.to}>
                        {crumb.label}
                      </Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <h1 className={styles.title} id={id}>
          {title}
        </h1>

        {description && <p className={styles.description}>{description}</p>}
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
