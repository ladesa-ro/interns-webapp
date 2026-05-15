import React from "react";
import CadastrarVagaSvg from "../../assets/icons/icon_Cadastrar_Vaga.svg?react";

const CadastrarVaga = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <CadastrarVagaSvg width={width} height={height} className={className} />
  );
};

export default CadastrarVaga;