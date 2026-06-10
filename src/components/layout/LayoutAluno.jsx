import { Routes, Route } from "react-router-dom";
import SidebarAluno from "./SidebarAluno";

import Inicio from "../../pages/aluno/inicio/Inicio";
import Perfil from "../../pages/aluno/Perfil";
import ListaEsperaAluno from "../../pages/aluno/ListaEsperaAluno";
import GuiaEstagio from "../../pages/aluno/GuiaEstagio";

export default function LayoutAluno() {
  return (
    <div className="app">
      <SidebarAluno />

      <div className="content">
        <Routes>
          <Route index element={<Inicio />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="lista-espera" element={<ListaEsperaAluno />} />
          <Route path="guia-estagio" element={<GuiaEstagio />} />
        </Routes>
      </div>
    </div>
  );
}