import React from "react";

import styles from "./Cards.module.css";
export default function Cards({
  titulo,
  valor,
  cor,
  Icon,
  imagem,
  onClick,
}) {
  return (
    <div
      className={`${styles.card} ${styles[cor]}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {imagem ? (
        <img src={imagem} alt={titulo} className={styles.imagemCard} />
      ) : (
        Icon && <Icon className={styles.iconCard} />
      )}

      <h3>{titulo}</h3>

      <span className={styles.valorCard}>{valor}</span>
    </div>
  );
}