import React from "react";
import DeletarSvg from "../../assets/icons/icon_Deletar.svg?react";

const Deletar = ({ size = 24, className = "" }) => {
  return (
    <DeletarSvg width={size} height={size} className={className} />
  );
};

export default Deletar;