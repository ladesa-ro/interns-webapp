import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../test/apiMock";
import VagasDisponiveis from "./VagasDisponiveis";

function Destino() {
  const location = useLocation();
  return <output>{JSON.stringify(location.state)}</output>;
}

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

const vagaAberta = {
  id: "est-1",
  empresa: { id: "emp-1", nomeFantasia: "Empresa Com Vaga" },
  CursoReferencia: { nome: "Informática" },
  cargaHoraria: 20,
  nomeSupervisor: "Supervisor Teste",
};

function instalarRotasBase(sobrescreve = {}) {
  return instalarFetch({
    "/empresas": () => ({
      status: 200,
      body: {
        data: [
          { id: "emp-1", nomeFantasia: "Empresa Com Vaga" },
          {
            id: "emp-2",
            nomeFantasia: "Empresa Sem Vaga",
            endereco: { logradouro: "Rua Sem Vaga", numero: 5, cidade: { nome: "Ariquemes", estado: { sigla: "RO" } } },
          },
        ],
        meta: { totalItems: 2, currentPage: 1, totalPages: 1 },
      },
    }),
    "/estagios": () => ({
      status: 200,
      body: { data: [vagaAberta], total: 1, page: 1, limit: 1000 },
    }),
    ...sobrescreve,
  });
}

describe("VagasDisponiveis", () => {
  it("agrupa vagas por empresa mostrando nome, contagem, curso e localização", async () => {
    instalarRotasBase();

    renderizar();

    expect(await screen.findByRole("heading", { name: "Empresa Com Vaga" })).toBeInTheDocument();
    expect(screen.getByText("1 vaga(s) disponível(is)")).toBeInTheDocument();
    expect(screen.getByText("Informática")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Empresa Sem Vaga" })).toBeInTheDocument();
    expect(screen.getByText("Nenhuma vaga disponível no momento")).toBeInTheDocument();
    expect(screen.getByText("Rua Sem Vaga, 5 · Ariquemes - RO")).toBeInTheDocument();
  });

  it("candidata-se diretamente à vaga aberta, navegando com o estágio selecionado", async () => {
    instalarRotasBase();
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByRole("heading", { name: "Empresa Com Vaga" });

    await usuario.click(screen.getByRole("button", { name: "Candidatar-se" }));

    expect(await screen.findByText(/"id":"est-1"/)).toBeInTheDocument();
  });

  it("permite solicitar estágio em empresa sem vaga aberta, sem inventar candidatura direta", async () => {
    instalarRotasBase();
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByRole("heading", { name: "Empresa Sem Vaga" });

    await usuario.click(screen.getByRole("button", { name: "Solicitar estágio nesta empresa" }));

    expect(await screen.findByText(/"nomeFantasia":"Empresa Sem Vaga"/)).toBeInTheDocument();
    expect(screen.queryByText(/"id":"est-1"/)).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando não há empresas para os filtros", async () => {
    instalarFetch({
      "/empresas": () => ({ status: 200, body: { data: [], meta: { totalItems: 0, totalPages: 1 } } }),
      "/estagios": () => ({ status: 200, body: { data: [], total: 0, page: 1, limit: 1000 } }),
    });

    renderizar();

    expect(await screen.findByText(/nenhuma empresa encontrada/i)).toBeInTheDocument();
  });

  it("propaga a busca ao endpoint de empresas", async () => {
    const { chamadas } = instalarFetch({
      "/empresas": () => ({ status: 200, body: { data: [], meta: { totalItems: 0, totalPages: 1 } } }),
      "/estagios": () => ({ status: 200, body: { data: [], total: 0, page: 1, limit: 1000 } }),
    });
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText(/nenhuma empresa encontrada/i);
    await usuario.type(screen.getByRole("searchbox", { name: "Buscar empresa" }), "acme");
    await usuario.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => {
      const ultima = chamadas.findLast((chamada) => String(chamada.url).includes("/empresas?"));
      expect(new URL(String(ultima.url), "http://localhost").searchParams.get("search")).toBe("acme");
    });
  });
});
