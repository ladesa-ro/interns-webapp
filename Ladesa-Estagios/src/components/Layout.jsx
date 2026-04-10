import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";

import Painel from "../pages/Painel";
import Empresa from "../pages/Empresa";
import Vaga from "../pages/Vaga";
import ListaEspera from "../pages/ListaEspera";
import Perfil from "../pages/Perfil";

export default function Layout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="content">
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/empresa" element={<Empresa />} />
          <Route path="/vaga" element={<Vaga />} />
          <Route path="/lista" element={<ListaEspera />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </div>
    </div>
  );
}