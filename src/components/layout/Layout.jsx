import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";

import Painel from "../../pages/dashboard/Painel";
import Empresa from "../../pages/empresas/Empresa";
import Vaga from "../../pages/vagas/Vaga";
import ListaEspera from "../../pages/lista-espera/ListaEspera";
import Perfil from "../../pages/perfil/Perfil";
import AlunosEmEstagio from "../../pages/alunos-em-estagios/Alunos-em-estagio";
import CadastrarEmpresa from "../../pages/cadastrarEmpresas/CadastrarEmpresa";
import NovaEmpresa from "../../pages/novaEmpresa/NovaEmpresa";
import EditarEmpresa from "../../pages/editarEmpresa/EditarEmpresa";

export default function Layout() {
  return (
    <div className="app">
      <Sidebar />

      <div className="content">
        <Routes>
          <Route index element={<Painel />} />

          <Route path="empresa" element={<Empresa />} />

          <Route path="cadastrarempresa" element={<CadastrarEmpresa />} />

          <Route path="nova-empresa" element={<NovaEmpresa />} />

          <Route path="editar-empresa/:id" element={<EditarEmpresa />}/>

          <Route path="vaga" element={<Vaga />} />

          <Route path="lista" element={<ListaEspera />} />

          <Route path="perfil" element={<Perfil />} />

          <Route
            path="alunos-em-estagio"
            element={<AlunosEmEstagio />}
          />

          <Route
            path="alunos-sem-estagio"
            element={<AlunosSemEstagio />}
          />

          <Route
            path="relatorio-segundo-ano"
            element={<RelatorioSegundoAno />}
          />
        </Routes>
      </div>
    </div>
  );
}