import React from "react";
import PerfilSvg from "../../assets/icons/icon_Perfil.svg?react";

const Perfil = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <PerfilSvg width={width} height={height} className={className} />
  );
};

export default Perfil;