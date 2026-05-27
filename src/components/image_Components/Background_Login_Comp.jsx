import React from "react";
import BackgroundSvg from "../../assets/background.svg?react";

const Background = ({className = "" }) => {
  return (
    <BackgroundSvg 
    className={className}
    preserveAspectRatio="xMidYMid slice" />
  );
};

export default Background;