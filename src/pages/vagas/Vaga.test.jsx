import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { instalarFetch } from "../../test/apiMock";
import Vaga from "./Vaga";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

function estagio(overrides = {}) {
  return {
    id: "1",
    empresa: { id: "e1" },
    CursoReferencia: { id: "c1" },
    cargaHoraria: 20,
    ...overrides,
  };
}

function instalarRotasPadrao(estagios = [estagio()]) {
  return instalarFetch({
    "/estagios": () => ({ status: 200, body: { data: estagios } }),
    "/empresas": () => ({
      status: 200,
      body: { data: [{ id: "e1", nomeFantasia: "Empresa Alfa" }] },
    }),
    "/cursos": () => ({
      status: 200,
      body: { data: [{ id: "c1", nomeAbreviado: "Informática" }] },
    }),
  });
}

function renderizar() {
  return render(
    <MemoryRouter>
      <Vaga />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.navigate.mockReset();
});

describe("Vaga", () => {
  it("mostra o estado de carregamento inicial", () => {
    instalarFetch({ "/estagios": () => new Promise(() => {}) });
    renderizar();

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renderiza a tabela com empresa e curso combinados via mapas", async () => {
    instalarRotasPadrao();
    renderizar();

    const tabela = await screen.findByRole("table");
    expect(tabela).toHaveTextContent("Empresa Alfa");
    expect(tabela).toHaveTextContent("Informática");
    expect(tabela).toHaveTextContent("20h");
  });

  it("volta ao painel ao clicar em Voltar", async () => {
    const user = userEvent.setup();
    instalarRotasPadrao();
    renderizar();
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Voltar ao painel" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/");
  });

  it("filtra vagas por curso ao clicar no card e alterna aria-pressed", async () => {
    const user = userEvent.setup();
    instalarFetch({
      "/estagios": () => ({
        status: 200,
        body: {
          data: [
            estagio({ id: "1", CursoReferencia: { id: "c1" } }),
            estagio({ id: "2", CursoReferencia: { id: "c2" } }),
          ],
        },
      }),
      "/empresas": () => ({
        status: 200,
        body: { data: [{ id: "e1", nomeFantasia: "Empresa Alfa" }] },
      }),
      "/cursos": () => ({
        status: 200,
        body: {
          data: [
            { id: "c1", nomeAbreviado: "Informática" },
            { id: "c2", nomeAbreviado: "Química" },
          ],
        },
      }),
    });
    renderizar();
    await screen.findByRole("table");

    const filtro = screen.getByRole("button", { name: "Filtrar por Informática" });
    expect(filtro).toHaveAttribute("aria-pressed", "false");

    await user.click(filtro);

    expect(filtro).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(screen.getByRole("table")).not.toHaveTextContent("Química")
    );
  });

  it("mostra estado vazio quando nenhuma vaga é encontrada", async () => {
    instalarRotasPadrao([]);
    renderizar();

    expect(
      await screen.findByText("Nenhuma vaga encontrada para o curso selecionado.")
    ).toBeInTheDocument();
  });

  it("registra o erro no console quando a API falha, sem quebrar a página", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    instalarFetch({
      "/estagios": () => {
        throw new Error("falha de rede simulada");
      },
    });
    renderizar();

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(erro).toHaveBeenCalled();

    erro.mockRestore();
  });
});
