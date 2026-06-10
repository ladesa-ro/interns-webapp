import React from "react";
import EditarSvg from "../../assets/icons/icon_Editar.svg?react";

const Editar = ({ size = 24, className = "" }) => {
  return (
    <EditarSvg width={size} height={size} className={className} />
  );
};

export default Editar;