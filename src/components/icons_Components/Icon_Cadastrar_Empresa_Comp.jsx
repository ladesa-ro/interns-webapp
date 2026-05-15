import React from "react";
import CadastrarEmpresaSvg from "../../assets/icons/icon_Cadastrar_Empresa.svg?react";

const CadastrarEmpresa = ({ size = 24, className = "" }) => {
  return (
    <CadastrarEmpresaSvg width={size} height={size} className={className} />
  );
};

export default CadastrarEmpresa;