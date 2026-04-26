import { Link, useLocation } from "react-router-dom";
import Titulo from "../components/icons_Components/Icon_Logo_Comp";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate(); 

  function handleLogout() {
    localStorage.removeItem("token"); 
    navigate("/login", { replace: true });
  }

  return (
    <div className="sidebar">
      <Titulo className= 'logo' />

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
          <User size={18} />
          <span>Perfil</span>
        </Link>
      </nav>

      {/* LINHA BRANCA */}
      {/*}<div className="divider"></div>
      */}
      {/* BOTÃO SAIR */}
      <button className="logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Sair</span>
      </button>
    </div>
  );
}