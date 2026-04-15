import { Link, useLocation } from "react-router-dom";
import titulo from "../assets/titulo.svg";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Clock,
  User,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <img src={titulo} alt="Logo" className="logo" />

      <nav>
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          <LayoutDashboard size={18} />
          <span>Painel</span>
        </Link>

        <Link
          to="/empresa"
          className={location.pathname === "/empresa" ? "active" : ""}
        >
          <Building2 size={18} />
          <span>Cadastrar Empresa</span>
        </Link>

        <Link
          to="/vaga"
          className={location.pathname === "/vaga" ? "active" : ""}
        >
          <Briefcase size={18} />
          <span>Cadastrar Vaga</span>
        </Link>

        <Link
          to="/lista"
          className={location.pathname === "/lista" ? "active" : ""}
        >
          <Clock size={18} />
          <span>Lista de espera</span>
        </Link>

        <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? "active" : ""}
        >
          <Icon_Perfil/>
          <span>Perfil</span>
        </Link>
      </nav>

      {/* LINHA BRANCA */}
      {/*}<div className="divider"></div>
      */}
      {/* BOTÃO SAIR */}
      <button className="logout">
        <LogOut size={18} />
        <span>Sair</span>
      </button>
    </div>
  );
}