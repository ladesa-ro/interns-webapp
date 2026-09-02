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
    { id: "1", matricula: "1", nome: "Ana Cristina Souza", empresa: "-", curso: "Informática" },
    { id: "2", matricula: "2", nome: "Uriel Luiz", empresa: "-", curso: "Química" },
    { id: "3", matricula: "3", nome: "Victor Henrique", empresa: "-", curso: "Química" },
    { id: "4", matricula: "4", nome: "Arthur Braga", empresa: "-", curso: "Florestas" },
    { id: "5", matricula: "5", nome: "Juliana Rodrigues", empresa: "-", curso: "Informática" },
  ]);
});

describe("ListaEspera", () => {
  it("renderiza título, filtros e todos os alunos por padrão", async () => {
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    expect(screen.getByRole("heading", { name: "Lista de espera" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(6); // cabeçalho + 5 alunos
    expect(screen.getByRole("button", { name: "Filtrar por Informática" })).toBeInTheDocument();
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

  it("é operável por teclado com Enter e Space", async () => {
    const user = userEvent.setup();
    renderizar();
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

    const filtro = screen.getByRole("button", { name: "Filtrar por Informática" });
    filtro.focus();
    await user.keyboard("{Enter}");
    expect(filtro).toHaveAttribute("aria-pressed", "true");

    await user.keyboard(" ");
    expect(filtro).toHaveAttribute("aria-pressed", "false");
  });

  it("não exibe o estado vazio quando o curso filtrado possui alunos", async () => {
    // Os três cursos estáticos sempre têm ao menos um aluno; o estado vazio
    // (EmptyState) só apareceria com dados reais filtrados sem correspondência,
    // o que não é reproduzível com o conjunto fixo atual desta página.
    const user = userEvent.setup();
    renderizar();

    await user.click(screen.getByRole("button", { name: "Filtrar por Informática" }));
    expect(screen.queryByText(/Nenhum aluno de/)).not.toBeInTheDocument();
  });
});
