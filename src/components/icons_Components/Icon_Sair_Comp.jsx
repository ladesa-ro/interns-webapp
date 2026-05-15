import React from "react";
import SairSvg from "../../assets/icons/icon_Sair.svg?react";

const Sair = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <SairSvg width={width} height={height} className={className} />
  );
};

export default Sair;