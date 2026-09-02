import React from "react";
import TituloSvg from "../../assets/titulo.svg?react";

const Titulo = ({ width = "220", height, className = "" }) => {
  return (
    <TituloSvg width={width} height={height} className={className} />
  );
};

export default Titulo;