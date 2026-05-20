import React from "react";
import CadastrarVagaSvg from "../../assets/icons/icon_Cadastrar_Vaga.svg?react";

const CadastrarVaga = ({ size = 24, className = "" }) => {
  return (
    <CadastrarVagaSvg width={size} height={size} className={className} />
  );
};

export default CadastrarVaga;