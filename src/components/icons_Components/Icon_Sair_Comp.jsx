import React from "react";
import SairSvg from "../../assets/icons/icon_Sair.svg?react";

const Sair = ({ size = 24, className = "" }) => {
  return (
    <SairSvg width={size} height={size} className={className} />
  );
};

export default Sair;