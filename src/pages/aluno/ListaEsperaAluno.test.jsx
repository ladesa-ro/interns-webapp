import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../test/apiMock";
import ListaEsperaAluno from "./ListaEsperaAluno";

function candidatura(extra = {}) {
  return {
    id: "cand-1",
    situacao: "PENDING",
    posicaoFila: 2,
    dataInscricao: "2026-09-04T10:00:00Z",
    acaoDisponivel: false,
    estagio: {
      id: "est-1",
      status: "DISPONIVEL",
      cargaHoraria: 20,
      empresa: { nomeFantasia: "Empresa Teste" },
      CursoReferencia: { nome: "Informática" },
    },
    ...extra,
  };
}

function renderizar() {
  return render(<MemoryRouter><ListaEsperaAluno /></MemoryRouter>);
}

describe("ListaEsperaAluno", () => {
  it("mostra posição, situação e data de inscrição das candidaturas do aluno", async () => {
    instalarFetch({
      "/minhas-candidaturas": () => ({
        status: 200,
        body: { data: [candidatura()], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } },
      }),
    });

    renderizar();

    expect(await screen.findByText("Empresa Teste")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/04\/09\/2026/)).toBeInTheDocument(); 
    expect(screen.queryByRole("button", { name: "Aceitar vaga" })).not.toBeInTheDocument();
  });

  it("permite filtrar as candidaturas por situação", async () => {
    const { chamadas } = instalarFetch({
      "/minhas-candidaturas": () => ({
        status: 200,
        body: { data: [candidatura()], meta: { totalItems: 1, currentPage: 1, totalPages: 1 } },
      }),
    });
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("Empresa Teste");

    const select = screen.getByRole("combobox", { name: "Filtrar por situação" });
    await usuario.selectOptions(select, "ACCEPTED");

    await waitFor(() => {
      const chamadasFiltro = chamadas.filter(c => String(c.url).includes("filter.situacao=ACCEPTED"));
      expect(chamadasFiltro).toHaveLength(1);
    });
  });

  it("exige confirmação antes de aceitar uma oferta liberada", async () => {
    const { chamadas } = instalarFetch({
      "/minhas-candidaturas": ({ options }) => (
        options?.method === "POST"
          ? { status: 200, body: candidatura({ situacao: "ACCEPTED" }) }
          : { status: 200, body: { data: [candidatura({ situacao: "OFFERED", acaoDisponivel: true })], meta: { totalPages: 1 } } }
      ),
    });
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("Vaga disponível para você");
    await usuario.click(screen.getByRole("button", { name: "Aceitar vaga" }));

    const dialogo = await screen.findByRole("dialog");
    expect(chamadas.filter((chamada) => chamada.options?.method === "POST")).toHaveLength(0);

    await usuario.click(within(dialogo).getByRole("button", { name: "Aceitar vaga" }));

    await waitFor(() =>
      expect(chamadas.some((chamada) => String(chamada.url).includes("/minhas-candidaturas/cand-1/aceitar") && chamada.options?.method === "POST")).toBe(true)
    );
  });

  it("cancela candidatura PENDING apenas após confirmação", async () => {
    const { chamadas } = instalarFetch({
      "/minhas-candidaturas": ({ options }) => (
        options?.method === "DELETE"
          ? { status: 200, body: candidatura({ situacao: "CANCELLED" }) }
          : { status: 200, body: { data: [candidatura()], meta: { totalPages: 1 } } }
      ),
    });
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("Empresa Teste");
    await usuario.click(screen.getByRole("button", { name: "Cancelar candidatura" }));

    const dialogo = await screen.findByRole("dialog");
    const textarea = within(dialogo).getByLabelText(/Motivo \(obrigatório\)/i);
    fireEvent.change(textarea, { target: { value: "Motivo de teste" } });
    await waitFor(() => expect(within(dialogo).getByRole("button", { name: "Cancelar candidatura" })).not.toBeDisabled());

    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar candidatura" }));

    await waitFor(() =>
      expect(chamadas.some((chamada) => chamada.options?.method === "DELETE")).toBe(true)
    );
  });

  it("renderiza botões de paginação quando totalPages > 1 e chama a API corretamente ao navegar", async () => {
    const { chamadas } = instalarFetch({
      "/minhas-candidaturas": ({ url }) => {
        const urlObj = new URL(url, "http://localhost");
        const page = urlObj.searchParams.get("page") || "1";
        return {
          status: 200,
          body: { 
            data: [candidatura({ id: `cand-page-${page}` })], 
            meta: { totalItems: 2, currentPage: Number(page), totalPages: 2 } 
          },
        };
      },
    });
    const usuario = userEvent.setup();

    renderizar();
    
    // Na página 1
    await screen.findByText("Página 1 de 2");
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    const btnProxima = screen.getByRole("button", { name: "Próxima" });
    expect(btnProxima).not.toBeDisabled();

    // Navega para página 2
    await usuario.click(btnProxima);

    await waitFor(() => {
      const chamadasPagina2 = chamadas.filter(c => String(c.url).includes("page=2"));
      expect(chamadasPagina2.length).toBeGreaterThan(0);
    });

    await screen.findByText("Página 2 de 2");
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).not.toBeDisabled();
  });
});
