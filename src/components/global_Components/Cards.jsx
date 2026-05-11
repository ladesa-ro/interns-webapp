import React from "react";

import styles from "./Cards.module.css";

export default function Cards({
  titulo,
  valor,
  cor,
  Icon,
  onClick,
}) {
  return (
    <div
      className={`${styles.card} ${styles[cor]}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {Icon && <Icon className={styles.iconCard} />}

      <h3>{titulo}</h3>

      <span>{valor}</span>
    </div>
  );
}