import { Link, useLocation, useNavigate } from "react-router-dom";
import Titulo from "../icons_Components/Icon_Logo_Comp";
import Painel from "../icons_Components/Icon_Painel_Comp";
import CadastrarEmpresa from "../icons_Components/Icon_Cadastrar_Empresa_Comp";
import CadastrarVaga from "../icons_Components/Icon_Cadastrar_Vaga_Comp";
import ListaEspera from "../icons_Components/Icon_Lista_Espera_Comp";
import Perfil from "../icons_Components/Icon_Perfil_Comp";
import Sair from "../icons_Components/Icon_Sair_Comp";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="sidebar">
      <Titulo className="logo" />

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

        <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? "active" : ""}
        >
          <Perfil size={24}/>
          <span>Perfil</span>
        </Link>
      </nav>

      <button className="logout" onClick={handleLogout}>
        <Sair size={24}/>
        <span>Sair</span>
      </button>
    </div>
  );
}
