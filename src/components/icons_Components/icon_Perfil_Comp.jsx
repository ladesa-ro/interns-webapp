import React from "react";
import { ReactComponent as IconPerfilSvg } from 'src/assets/icons/icon_Perfil.svg';

const IconPerfil = ({ width = "30", height = "30", className = "" }) => {
  return (
    <IconPerfilSvg width={width} height={height} className={className} />
  );
};

export default IconPerfil;