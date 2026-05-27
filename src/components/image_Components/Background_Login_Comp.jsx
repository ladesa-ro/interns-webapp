import React from "react";
import BackgroundSvg from "../../assets/background.svg?react";

const Background = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <BackgroundSvg width={width} height={height} className={className} />
  );
};

export default Background;