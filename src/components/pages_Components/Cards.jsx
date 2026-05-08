import React from "react";

export default function Cards({
  titulo,
  valor,
  cor,
  Icon,
  onClick,
}) {
  return (
    <div
      className={`card ${cor}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Icon className="icon-card" />

      <h3>{titulo}</h3>

      <span>{valor}</span>
    </div>
  );
}