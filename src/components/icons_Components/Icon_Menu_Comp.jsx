import React from "react";
import MenuSvg from "../../assets/icons/icon_Menu.svg?react";

const Menu = ({ width = "220", height = "auto", className = "" }) => {
  return (
    <MenuSvg width={width} height={height} className={className} />
  );
};

export default Menu;