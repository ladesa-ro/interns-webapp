import React from "react";
import PainelSvg from "../../assets/icons/icon_Painel.svg?react";

const Painel = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <PainelSvg width={width} height={height} className={className} />
  );
};

export default Painel;