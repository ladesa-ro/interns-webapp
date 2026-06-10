import React from "react";
import PesquisaSvg from "../../assets/icons/icon_Pesquisa.svg?react";

const Pesquisa = ({ size = 24, className = "" }) => {
  return (
    <PesquisaSvg width={size} height={size} className={className} />
  );
};

export default Pesquisa;