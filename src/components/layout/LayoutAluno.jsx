import { Routes, Route } from "react-router-dom";
import { BookOpen, CircleUserRound, ClipboardList, House } from "lucide-react";
import AppShell from "./AppShell";

import Inicio from "../../pages/aluno/inicio/Inicio";
import Perfil from "../../pages/aluno/Perfil";
import ListaEsperaAluno from "../../pages/aluno/ListaEsperaAluno";
import GuiaEstagio from "../../pages/aluno/GuiaEstagio";
import ContatoCIEC from "../../pages/aluno/ContatoCIEC";
import SolicitarEstagio from "../../pages/aluno/inicio/solicitar-estagio/SolicitarEstagio";
import AvaliarEmpresa from "../../pages/aluno/AvaliarEmpresa";
import FolhaDePontos from "../../pages/aluno/FolhaDePontos";

const NAV_ALUNO = [
  { to: "/aluno", label: "Início", icon: House, end: true },
  { to: "/aluno/perfil", label: "Perfil", icon: CircleUserRound },
  { to: "/aluno/lista-espera", label: "Lista de espera", icon: ClipboardList },
  { to: "/aluno/guia-estagio", label: "Guia de estágio", icon: BookOpen },
];

export default function LayoutAluno() {
  return (
    <AppShell navItems={NAV_ALUNO} titulo="Portal do Aluno">
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
    </AppShell>
  );
}