import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  House,
  CircleUserRound,
  ClipboardList,
  BookOpen,
} from "lucide-react";

import Titulo from "../icons_Components/Icon_Logo_Comp";
import Sair from "../icons_Components/Icon_Sair_Comp";

export default function SidebarAluno() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className={`sidebar ${isMenuOpen ? "" : "collapsed"}`}>
      <div className="sidebar-header">
        <button
          className="toggle-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} color="white" />
        </button>

        {isMenuOpen && <Titulo className="logo" />}
      </div>

      <nav>
        <Link
          to="/aluno"
          className={location.pathname === "/aluno" ? "active" : ""}
        >
          <House size={19} />
          <span>Início</span>
        </Link>

        <Link
          to="/aluno/perfil"
          className={location.pathname === "/aluno/perfil" ? "active" : ""}
        >
          <CircleUserRound size={19} />
          <span>Perfil</span>
        </Link>

        <Link
          to="/aluno/lista-espera"
          className={
            location.pathname === "/aluno/lista-espera" ? "active" : ""
          }
        >
          <ClipboardList size={19} />
          <span>Lista de espera</span>
        </Link>

        <Link
          to="/aluno/guia-estagio"
          className={
            location.pathname === "/aluno/guia-estagio" ? "active" : ""
          }
        >
          <BookOpen size={19} />
          <span>Guia de estágio</span>
        </Link>
      </nav>

      <button className="logout" onClick={handleLogout}>
        <Sair size={19} />
        <span>Sair</span>
      </button>
    </div>
  );
}