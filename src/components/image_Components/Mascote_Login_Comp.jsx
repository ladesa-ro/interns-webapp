import React from "react";
import MascoteSvg from "../../assets/mascote.svg?react";

const Mascote = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <MascoteSvg width={width} height={height} className={className} />
  );
};

export default Mascote;