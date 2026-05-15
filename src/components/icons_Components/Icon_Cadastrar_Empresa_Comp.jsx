import React from "react";
import CadastrarEmpresaSvg from "../../assets/icon_Cadastrar_Empresa.svg?react";

const CadastrarEmpresa = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <CadastrarEmpresaSvg width={width} height={height} className={className} />
  );
};

export default CadastrarEmpresa;