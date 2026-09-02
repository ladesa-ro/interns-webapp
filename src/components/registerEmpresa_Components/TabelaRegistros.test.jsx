import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { instalarFetch } from "../../test/apiMock";
import TabelaRegistros from "./TabelaRegistros";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

function empresa(overrides = {}) {
  return {
    id: "1",
    nomeFantasia: "Empresa Alfa",
    cnpj: "00.000.000/0001-00",
    telefone: "(69) 3000-0000",
    email: "contato@alfa.com",
    endereco: { cidade: { nome: "Porto Velho" } },
    ...overrides,
  };
}

function renderizar() {
  return render(
    <MemoryRouter>
      <TabelaRegistros />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.navigate.mockReset();
  vi.spyOn(window, "alert").mockImplementation(() => {});
});

describe("TabelaRegistros", () => {
  it("mostra o estado de carregamento inicial", () => {
    instalarFetch({ "/empresas": () => new Promise(() => {}) });
    renderizar();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza a lista de empresas com tabela semântica e ações nomeadas", async () => {
    instalarFetch({
      "/empresas": () => ({ status: 200, body: { data: [empresa()] } }),
    });
    renderizar();

    const tabela = await screen.findByRole("table", { name: "Lista de empresas cadastradas" });
    expect(within(tabela).getByText("Empresa Alfa")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Nome Fantasia" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Editar Empresa Alfa" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir Empresa Alfa" })
    ).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há empresas cadastradas", async () => {
    instalarFetch({ "/empresas": () => ({ status: 200, body: { data: [] } }) });
    renderizar();

    expect(
      await screen.findByText("Nenhuma empresa cadastrada.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("mostra mensagem específica quando a busca não encontra resultados", async () => {
    const user = userEvent.setup();
    instalarFetch({
      "/empresas": ({ url }) =>
        String(url).includes("search=inexistente")
          ? { status: 200, body: { data: [] } }
          : { status: 200, body: { data: [empresa()] } },
    });
    renderizar();
    await screen.findByRole("table");

    await user.type(
      screen.getByRole("textbox", { name: "Buscar empresa por nome ou CNPJ" }),
      "inexistente"
    );

    expect(
      await screen.findByText('Nenhuma empresa encontrada para "inexistente".')
    ).toBeInTheDocument();
  });

  it("reinicia a paginação ao buscar", async () => {
    const user = userEvent.setup();
    const { chamadas } = instalarFetch({
      "/empresas": () => ({
        status: 200,
        body: { data: [empresa()], meta: { pageCount: 3 } },
      }),
    });
    renderizar();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Próxima" }));
    await screen.findByText("Página 2 de 3");

    await user.type(
      screen.getByRole("textbox", { name: "Buscar empresa por nome ou CNPJ" }),
      "a"
    );

    await waitFor(() => expect(screen.getByText(/Página 1 de/)).toBeInTheDocument());
    const ultimaChamada = chamadas.at(-1);
    expect(String(ultimaChamada.url)).toContain("page=1");
  });

  it("navega entre páginas com Anterior e Próxima respeitando os limites", async () => {
    const user = userEvent.setup();
    instalarFetch({
      "/empresas": () => ({
        status: 200,
        body: { data: [empresa()], meta: { pageCount: 2 } },
      }),
    });
    renderizar();
    await screen.findByRole("table");

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Próxima" }));
    await screen.findByText("Página 2 de 2");
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    await screen.findByText("Página 1 de 2");
  });

  it("navega para a edição da empresa", async () => {
    const user = userEvent.setup();
    instalarFetch({
      "/empresas": () => ({ status: 200, body: { data: [empresa()] } }),
    });
    renderizar();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Editar Empresa Alfa" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/editar-empresa/1");
  });

  it("mostra erro da API e recupera com Tentar novamente mesmo na página 1", async () => {
    const user = userEvent.setup();
    let tentativas = 0;
    instalarFetch({
      "/empresas": () => {
        tentativas += 1;
        if (tentativas === 1) return { status: 500, body: {} };
        return { status: 200, body: { data: [empresa()] } };
      },
    });
    renderizar();

    expect(
      await screen.findByText("Falha ao carregar a lista de empresas da API.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await screen.findByRole("table");
    expect(tentativas).toBe(2);
  });

  describe("exclusão", () => {
    async function abrirModalDeExclusao(user) {
      instalarFetch({
        "/empresas": () => ({ status: 200, body: { data: [empresa()] } }),
      });
      renderizar();
      await screen.findByRole("table");
      await user.click(screen.getByRole("button", { name: "Excluir Empresa Alfa" }));
      return screen.findByRole("dialog", { name: "Excluir empresa" });
    }

    it("abre o ConfirmDialog com nome e descrição acessíveis e foco inicial", async () => {
      const user = userEvent.setup();
      const dialogo = await abrirModalDeExclusao(user);

      expect(dialogo).toHaveAccessibleDescription(/Empresa Alfa/);
      await waitFor(() => expect(dialogo).toContainElement(document.activeElement));
    });

    it("fecha com Escape e restaura o foco ao acionador", async () => {
      const user = userEvent.setup();
      await abrirModalDeExclusao(user);
      const excluirBotao = screen.getByRole("button", { name: "Excluir Empresa Alfa" });

      await user.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await waitFor(() => expect(excluirBotao).toHaveFocus());
    });

    it("cancela a exclusão sem chamar a API de exclusão", async () => {
      const user = userEvent.setup();
      await abrirModalDeExclusao(user);

      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("confirma a exclusão, remove a linha e mostra um único nome acessível durante o loading", async () => {
      const user = userEvent.setup();
      let resolverDelete;
      const { chamadas } = instalarFetch({
        "/empresas/1": () =>
          new Promise((resolve) => {
            resolverDelete = () => resolve({ status: 200, body: {} });
          }),
        "/empresas": () => ({ status: 200, body: { data: [empresa()] } }),
      });
      renderizar();
      await screen.findByRole("table");
      await user.click(screen.getByRole("button", { name: "Excluir Empresa Alfa" }));
      await screen.findByRole("dialog", { name: "Excluir empresa" });

      await user.click(screen.getByRole("button", { name: "Excluir" }));

      const botaoCarregando = screen.getByRole("button", { name: "Carregando" });
      expect(botaoCarregando).not.toHaveTextContent("Excluir");
      expect(botaoCarregando).toBeDisabled();

      resolverDelete();
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.queryByText("Empresa Alfa")).not.toBeInTheDocument();

      const chamadaDelete = chamadas.find((c) => String(c.url).includes("/empresas/1"));
      expect(chamadaDelete.options?.method).toBe("DELETE");
    });
  });
});
