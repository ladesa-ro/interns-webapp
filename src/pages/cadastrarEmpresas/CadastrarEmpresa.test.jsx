import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { instalarFetch } from "../../test/apiMock";
import CadastrarEmpresa from "./CadastrarEmpresa";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

beforeEach(() => {
  mocks.navigate.mockReset();
  instalarFetch({ "/empresas": () => ({ status: 200, body: { data: [] } }) });
});

describe("CadastrarEmpresa", () => {
  it("renderiza título, descrição e ação de nova empresa", async () => {
    render(
      <MemoryRouter>
        <CadastrarEmpresa />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Cadastro de Empresas" })).toBeInTheDocument();
    expect(
      screen.getByText("Gerencie as empresas parceiras do IFRO")
    ).toBeInTheDocument();
    await screen.findByText("Nenhuma empresa cadastrada.");
  });

  it("navega para o cadastro de nova empresa", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CadastrarEmpresa />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Nova Empresa" }));
    expect(mocks.navigate).toHaveBeenCalledWith("/nova-empresa");
  });
});
