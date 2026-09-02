import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { instalarFetch } from "../../test/apiMock";
import CadastrarVaga from "./CadastrarVaga";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

beforeEach(() => {
  mocks.navigate.mockReset();
  instalarFetch({
    "/estagios": () => ({ status: 200, body: { data: [] } }),
    "/empresas": () => ({ status: 200, body: { data: [] } }),
    "/cursos": () => ({ status: 200, body: { data: [] } }),
    "/campi": () => ({ status: 200, body: { data: [] } }),
  });
});

describe("CadastrarVaga", () => {
  it("renderiza título, descrição e ação de nova vaga", async () => {
    render(
      <MemoryRouter>
        <CadastrarVaga />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Cadastro de Vagas de Estágio" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gerencie as vagas disponíveis para os alunos")
    ).toBeInTheDocument();
    await screen.findByText("Nenhuma vaga cadastrada.");
  });

  it("navega para o cadastro de nova vaga", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CadastrarVaga />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Nova Vaga" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/vagas/nova");
  });
});
