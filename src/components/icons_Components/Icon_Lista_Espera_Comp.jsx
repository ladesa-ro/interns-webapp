import React from "react";
import ListaEsperaSvg from "../../assets/icons/icon_Lista_Espera.svg?react";

const ListaEspera = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <ListaEsperaSvg width={width} height={height} className={className} />
  );
};

export default ListaEspera;