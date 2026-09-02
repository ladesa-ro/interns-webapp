import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { instalarFetch } from "../../test/apiMock";
import TabelaVagas from "./TabelaVagas";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

function vaga(overrides = {}) {
  return {
    id: "1",
    empresa: { id: "e1", nomeFantasia: "Empresa Alfa" },
    CursoReferencia: { id: "c1", nomeAbreviado: "Informática" },
    campus: { id: "cp1", nomeFantasia: "Campus Central" },
    cargaHoraria: 20,
    nomeSupervisor: "Maria Souza",
    status: "DISPONIVEL",
    ...overrides,
  };
}

function instalarRotasPadrao(estagios = [vaga()]) {
  return instalarFetch({
    "/estagios": () => ({ status: 200, body: { data: estagios } }),
    "/empresas": () => ({ status: 200, body: { data: [] } }),
    "/cursos": () => ({ status: 200, body: { data: [] } }),
    "/campi": () => ({ status: 200, body: { data: [] } }),
  });
}

function renderizar() {
  return render(
    <MemoryRouter>
      <TabelaVagas />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.navigate.mockReset();
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("TabelaVagas", () => {
  it("mostra o estado de carregamento inicial", () => {
    instalarFetch({ "/estagios": () => new Promise(() => {}) });
    renderizar();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza a tabela com badges de status e ações nomeadas", async () => {
    instalarRotasPadrao();
    renderizar();

    const tabela = await screen.findByRole("table", { name: "Lista de vagas de estágio" });
    expect(within(tabela).getByText("Aberta")).toBeInTheDocument();
    expect(within(tabela).getByText("Empresa Alfa")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Editar vaga de Empresa Alfa" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir vaga de Empresa Alfa" })
    ).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há vagas cadastradas", async () => {
    instalarRotasPadrao([]);
    renderizar();

    expect(await screen.findByText("Nenhuma vaga cadastrada.")).toBeInTheDocument();
  });

  it("filtra vagas pela busca", async () => {
    const user = userEvent.setup();
    instalarRotasPadrao([
      vaga({ id: "1", empresa: { id: "e1", nomeFantasia: "Empresa Alfa" } }),
      vaga({ id: "2", empresa: { id: "e2", nomeFantasia: "Empresa Beta" } }),
    ]);
    renderizar();
    await screen.findByRole("table");

    await user.type(
      screen.getByRole("textbox", { name: "Buscar por empresa, curso, campus ou supervisor" }),
      "Beta"
    );

    await waitFor(() => expect(screen.queryByText("Empresa Alfa")).not.toBeInTheDocument());
    expect(screen.getByText("Empresa Beta")).toBeInTheDocument();
  });

  it("navega para a edição da vaga", async () => {
    const user = userEvent.setup();
    instalarRotasPadrao();
    renderizar();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Editar vaga de Empresa Alfa" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/vagas/editar/1");
  });

  it("mostra erro da API", async () => {
    instalarFetch({ "/estagios": () => ({ status: 500, body: {} }) });
    renderizar();

    expect(await screen.findByText("Erro ao carregar lista de vagas.")).toBeInTheDocument();
  });

  describe("exclusão", () => {
    async function abrirModal(user) {
      instalarRotasPadrao();
      renderizar();
      await screen.findByRole("table");
      await user.click(screen.getByRole("button", { name: "Excluir vaga de Empresa Alfa" }));
      return screen.findByRole("dialog", { name: "Confirmar exclusão" });
    }

    it("abre o ConfirmDialog com nome e descrição acessíveis e foco inicial", async () => {
      const user = userEvent.setup();
      const dialogo = await abrirModal(user);

      expect(dialogo).toHaveAccessibleDescription(/Empresa Alfa/);
      await waitFor(() => expect(dialogo).toContainElement(document.activeElement));
    });

    it("fecha com Escape e restaura o foco ao acionador", async () => {
      const user = userEvent.setup();
      await abrirModal(user);
      const excluirBotao = screen.getByRole("button", { name: "Excluir vaga de Empresa Alfa" });

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await waitFor(() => expect(excluirBotao).toHaveFocus());
    });

    it("cancela a exclusão sem chamar a API", async () => {
      const user = userEvent.setup();
      await abrirModal(user);

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("confirma a exclusão, remove a linha e mostra um único nome acessível durante o loading", async () => {
      const user = userEvent.setup();
      let resolverDelete;
      const { chamadas } = instalarFetch({
        "/estagios/1": () =>
          new Promise((resolve) => {
            resolverDelete = () => resolve({ status: 200, body: {} });
          }),
        "/estagios": () => ({ status: 200, body: { data: [vaga()] } }),
        "/empresas": () => ({ status: 200, body: { data: [] } }),
        "/cursos": () => ({ status: 200, body: { data: [] } }),
        "/campi": () => ({ status: 200, body: { data: [] } }),
      });
      renderizar();
      await screen.findByRole("table");
      await user.click(screen.getByRole("button", { name: "Excluir vaga de Empresa Alfa" }));
      await screen.findByRole("dialog", { name: "Confirmar exclusão" });

      await user.click(screen.getByRole("button", { name: "Excluir" }));

      const botaoCarregando = screen.getByRole("button", { name: "Carregando" });
      expect(botaoCarregando).not.toHaveTextContent("Excluir");

      resolverDelete();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.queryByText("Empresa Alfa")).not.toBeInTheDocument();

      const chamadaDelete = chamadas.find((c) => String(c.url).includes("/estagios/1"));
      expect(chamadaDelete.options?.method).toBe("DELETE");
    });
  });
});
