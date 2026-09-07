import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../test/apiMock";
import VagasDisponiveis from "./VagasDisponiveis";

function renderizar() {
  return render(
    <MemoryRouter initialEntries={["/aluno/vagas-disponiveis"]}>
      <Routes>
        <Route path="/aluno/vagas-disponiveis" element={<VagasDisponiveis />} />
        <Route path="/aluno/solicitar-estagio" element={<Destino />} />
      </Routes>
    </MemoryRouter>
  );
}

function Destino() {
  const location = useLocation();
  return <output>{JSON.stringify(location.state)}</output>;
}

describe("VagasDisponiveis", () => {
  it("lista dados retornados pela API e navega com a vaga pré-preenchida", async () => {
    instalarFetch({
      "/estagios": () => ({
        status: 200,
        body: {
          data: [{
            id: "est-1",
            empresa: { nomeFantasia: "Empresa Teste", endereco: { logradouro: "Rua das Flores", numero: 100, cidade: { nome: "Porto Velho", estado: { sigla: "RO" } } } },
            CursoReferencia: { nome: "Informática" },
            cargaHoraria: 20,
            nomeSupervisor: "Supervisor Teste",
          }],
          total: 1,
          page: 1,
          limit: 12,
        },
      }),
    });
    const usuario = userEvent.setup();

    renderizar();

    expect(await screen.findByRole("heading", { name: "Empresa Teste" })).toBeInTheDocument();
    expect(screen.getByText("Informática")).toBeInTheDocument();
    expect(screen.getByText("Rua das Flores, 100 · Porto Velho - RO")).toBeInTheDocument();
    expect(screen.queryByText("Campus")).not.toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Candidatar-se" }));

    expect(await screen.findByText(/"id":"est-1"/)).toBeInTheDocument();
  });

  it("mostra estado vazio para nenhuma vaga disponível", async () => {
    instalarFetch({
      "/estagios": () => ({ status: 200, body: { data: [], total: 0, page: 1, limit: 12 } }),
    });

    renderizar();

    expect(await screen.findByText(/nenhuma vaga disponível/i)).toBeInTheDocument();
  });

  it("propaga a busca ao endpoint", async () => {
    const { chamadas } = instalarFetch({
      "/estagios": () => ({ status: 200, body: { data: [], total: 0, page: 1, limit: 12 } }),
    });
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText(/nenhuma vaga disponível/i);
    await usuario.type(screen.getByRole("searchbox", { name: "Buscar vaga" }), "empresa");
    await usuario.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      const ultima = chamadas.at(-1);
      expect(new URL(String(ultima.url), "http://localhost").searchParams.get("search")).toBe("empresa");
    });
  });
});
