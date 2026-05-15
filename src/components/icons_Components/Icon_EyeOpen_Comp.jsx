import React from "react";
import EyeOpenSvg from "../../assets/icons/icon_EyeOpen.svg?react";

const EyeOpen = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <EyeOpenSvg width={width} height={height} className={className} />
  );
};

export default EyeOpen;