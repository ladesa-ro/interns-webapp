import React from "react";
import CadastrarEmpresaSvg from "../../assets/icons/icon_Cadastrar_Empresa.svg?react";

const CadastrarEmpresaIcon = ({ size = 24, className = "" }) => {
  return (
    <CadastrarEmpresaSvg width={size} height={size} className={className} />
  );
};

export default CadastrarEmpresaIcon;