import { Routes, Route } from "react-router-dom";
import SidebarAluno from "./SidebarAluno";

import Inicio from "../../pages/aluno/inicio/Inicio";
import Perfil from "../../pages/aluno/Perfil";
import ListaEsperaAluno from "../../pages/aluno/ListaEsperaAluno";
import GuiaEstagio from "../../pages/aluno/GuiaEstagio";
import ContatoCIEC from "../../pages/aluno/ContatoCIEC";
import SolicitarEstagio from "../../pages/aluno/inicio/solicitar-estagio/SolicitarEstagio";
import AvaliarEmpresa from "../../pages/aluno/AvaliarEmpresa";
import FolhaDePontos from "../../pages/aluno/FolhaDePontos";

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
          <Route path="contato-ciec" element={<ContatoCIEC />} />
          <Route path="avaliar/:estagioId" element={<AvaliarEmpresa />} />
          <Route path="folha-pontos" element={<FolhaDePontos />} />
          <Route
            path="solicitar-estagio"
            element={<SolicitarEstagio />}
          />
        </Routes>
      </div>
    </div>
  );
}