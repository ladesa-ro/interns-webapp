import React from "react";
import ImagemSvg from "../../assets/mascoteLogin.svg?react";

const Imagem = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <ImagemSvg width={width} height={height} className={className} />
  );
};

export default Imagem;