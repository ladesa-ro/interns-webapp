import React from "react";
import MenuSvg from "../../assets/icons/icon_Menu.svg?react";

const Menu = ({ size = 24, className = "" }) => {
  return (
    <MenuSvg width={size} height={size} className={className} />
  );
};

export default Menu;