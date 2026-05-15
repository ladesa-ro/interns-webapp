import React from "react";
import ListaEsperaSvg from "../../assets/icons/icon_Lista_Espera.svg?react";

const ListaEspera = ({ size = 24, className = "" }) => {
  return (
    <ListaEsperaSvg width={size} height={size} className={className} />
  );
};

export default ListaEspera;