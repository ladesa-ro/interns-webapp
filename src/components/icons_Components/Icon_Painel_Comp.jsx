import React from "react";
import PainelSvg from "../../assets/icons/icon_Painel.svg?react";

const Painel = ({ size = 24, className = "" }) => {
  return (
    <PainelSvg width={size} height={size} className={className} />
  );
};

export default Painel;