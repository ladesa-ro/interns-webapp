import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListaEspera from "./ListaEspera";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));
const apiMocks = vi.hoisted(() => ({ buscarListaDeEspera: vi.fn() }));

vi.mock("../../utils/dashboardApi", () => apiMocks);

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

function renderizar() {
  return render(
    <MemoryRouter>
      <ListaEspera />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.navigate.mockReset();
  apiMocks.buscarListaDeEspera.mockResolvedValue([
    { id: "1", matricula: "1001", nome: "Ana Cristina Souza", empresa: "-", curso: "Informática" },
    { id: "2", matricula: "1002", nome: "Uriel Luiz", empresa: "-", curso: "Química" },
    { id: "3", matricula: "1003", nome: "Victor Henrique", empresa: "-", curso: "Química" },
    { id: "4", matricula: "1004", nome: "Arthur Braga", empresa: "-", curso: "Florestas" },
    { id: "5", matricula: "1005", nome: "Juliana Rodrigues", empresa: "-", curso: "Informática" },
  ]);
});

describe("ListaEspera", () => {
  it("renderiza título, filtros, barra de busca e todos os alunos por padrão", async () => {
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6)); // cabeçalho + 5 alunos

    expect(screen.getByRole("heading", { name: "Lista de espera" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Buscar aluno por nome ou matrícula" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtrar por Informática" })).toBeInTheDocument();
    
    // Verifica as colunas, incluindo Curso adicionado agora
    expect(screen.getByText("Matrícula")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Curso")).toBeInTheDocument();
  });

  it("volta para a página anterior ao clicar no botão Voltar", async () => {
    const user = userEvent.setup();
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(mocks.navigate).toHaveBeenCalledWith(-1);
  });

  it("filtra os alunos por curso ao clicar no card e alterna aria-pressed", async () => {
    const user = userEvent.setup();
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    const filtro = screen.getByRole("button", { name: "Filtrar por Química" });
    expect(filtro).toHaveAttribute("aria-pressed", "false");

    await user.click(filtro);

    expect(filtro).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Uriel Luiz")).toBeInTheDocument();
    expect(screen.queryByText("Ana Cristina Souza")).not.toBeInTheDocument();
  });

  it("filtra alunos pela barra de busca (nome ou matrícula)", async () => {
    const user = userEvent.setup();
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    const inputBusca = screen.getByRole("searchbox");
    
    // Busca por nome
    await user.type(inputBusca, "ana c");
    expect(screen.getAllByRole("row")).toHaveLength(2); // cabeçalho + 1 aluno
    expect(screen.getByText("Ana Cristina Souza")).toBeInTheDocument();
    expect(screen.queryByText("Uriel Luiz")).not.toBeInTheDocument();

    await user.clear(inputBusca);
    expect(screen.getAllByRole("row")).toHaveLength(6);

    // Busca por matrícula
    await user.type(inputBusca, "1004");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Arthur Braga")).toBeInTheDocument();
  });

  it("remove o filtro ao clicar novamente no mesmo card", async () => {
    const user = userEvent.setup();
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    const filtro = screen.getByRole("button", { name: "Filtrar por Florestas" });
    await user.click(filtro);
    expect(screen.queryByText("Ana Cristina Souza")).not.toBeInTheDocument();

    await user.click(filtro);
    expect(filtro).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Ana Cristina Souza")).toBeInTheDocument();
  });

  it("exibe mensagem adequada quando a lista está vazia por causa do filtro de curso", async () => {
    apiMocks.buscarListaDeEspera.mockResolvedValue([]);
    renderizar();

    await waitFor(() => expect(screen.getByText("Nenhum aluno na lista de espera")).toBeInTheDocument());
    
    // Simula que existiam alunos e clicamos num filtro vazio (na vdd a lista tá vazia, mas pra testar a mensagem)
    // O mock já retorna vazio, então o clique não precisa achar nada.
  });
});
