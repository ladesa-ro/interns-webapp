import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Painel from "../../pages/dashboard/Painel";
import Empresa from "../../pages/empresas/Empresa";
import Vaga from "../../pages/vagas/Vaga";
import ListaEspera from "../../pages/lista-espera/ListaEspera";
import Perfil from "../../pages/perfil/Perfil";

export default function Layout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="content">
        <Routes>
          <Route index element={<Painel />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="vaga" element={<Vaga />} />
          <Route path="lista" element={<ListaEspera />} />
          <Route path="perfil" element={<Perfil />} />
        </Routes>
      </div>
    </div>
  );
}
