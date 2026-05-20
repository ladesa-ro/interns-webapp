import React from "react";
import PerfilSvg from "../../assets/icons/icon_Perfil.svg?react";

const Perfil = ({ size = 24, className = "" }) => {
  return (
    <PerfilSvg width={size} height={size} className={className} />
  );
};

export default Perfil;