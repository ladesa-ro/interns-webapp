import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Titulo from "../icons_Components/Icon_Logo_Comp";
import Painel from "../icons_Components/Icon_Painel_Comp";
import CadastrarEmpresa from "../icons_Components/Icon_Cadastrar_Empresa_Comp";
import CadastrarVaga from "../icons_Components/Icon_Cadastrar_Vaga_Comp";
import ListaEspera from "../icons_Components/Icon_Lista_Espera_Comp";
import Sair from "../icons_Components/Icon_Sair_Comp";
import { Menu } from "lucide-react"; {/*Teste*/}

export default function Sidebar() {
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
        <button className="toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu size={24} color="white" />
        </button>
        {isMenuOpen && <Titulo className="logo" />}
      </div>
      <nav>
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          <Painel size={24} />
          <span>Painel</span>
        </Link>

        <Link
          to="/empresa"
          className={location.pathname === "/empresa" ? "active" : ""}
        >
          <CadastrarEmpresa size={24}/>
          <span>Cadastrar Empresa</span>
        </Link>

        <Link
          to="/vaga"
          className={location.pathname === "/vaga" ? "active" : ""}
        >
          <CadastrarVaga size={24}/>
          <span>Cadastrar Vaga</span>
        </Link>

        <Link
          to="/lista"
          className={location.pathname === "/lista" ? "active" : ""}
        >
          <ListaEspera size={24}/>
          <span>Lista de espera</span>
        </Link>

        {/*<Link
          to="/perfil"
          className={location.pathname === "/perfil" ? "active" : ""}
        >
          <Perfil size={24}/>
          <span>Perfil</span>
        </Link>*/}
      </nav>


      
      <button className="logout" onClick={handleLogout}>
        <Sair size={24}/>
        <span>Sair</span>
      </button>
    </div>
  );
}
