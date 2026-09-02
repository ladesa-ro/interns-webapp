import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  navigate: vi.fn(),
  alternarTema: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ login: mocks.login }),
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ escuro: false, alternarTema: mocks.alternarTema }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

beforeEach(() => {
  mocks.login.mockReset();
  mocks.navigate.mockReset();
  mocks.alternarTema.mockReset();
});

async function preencherCredenciais(user) {
  await user.type(screen.getByLabelText("Matrícula"), "  2025102020039  ");
  await user.type(screen.getByLabelText("Senha"), "segredo-de-teste");
}

describe("Login", () => {
  it("oferece campos e controles com nomes acessíveis e ordem de foco coerente", async () => {
    const user = userEvent.setup();
    render(<Login />);

    expect(screen.getByRole("heading", { name: "Acessar o sistema de estágios" })).toBeInTheDocument();
    expect(screen.getByLabelText("Matrícula")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("autocomplete", "current-password");

    await user.tab();
    expect(screen.getByRole("button", { name: "Ativar tema escuro" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Matrícula")).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Senha")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toHaveFocus();
  });

  it("alterna a visibilidade da senha por um botão operável", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const senha = screen.getByLabelText("Senha");
    expect(senha).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(senha).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("associa o erro obrigatório aos campos sem chamar login", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(mocks.login).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Matrícula")).toHaveAccessibleDescription(
      "Informe matrícula e senha."
    );
    expect(screen.getByLabelText("Senha")).toHaveAccessibleDescription(
      "Informe matrícula e senha."
    );
  });

  it("preserva o payload e anuncia o estado de loading", async () => {
    const user = userEvent.setup();
    let concluirLogin;
    mocks.login.mockReturnValue(
      new Promise((resolve) => {
        concluirLogin = resolve;
      })
    );
    render(<Login />);
    await preencherCredenciais(user);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(mocks.login).toHaveBeenCalledWith("2025102020039", "segredo-de-teste");
    expect(screen.getByRole("button", { name: "Entrando" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Entrando" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
    expect(screen.getByLabelText("Matrícula")).toBeDisabled();
    expect(screen.getByLabelText("Senha")).toBeDisabled();

    concluirLogin({ autenticado: true, perfil: "aluno" });
    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith("/aluno", { replace: true })
    );
  });

  it("apresenta erro de credenciais associado aos controles", async () => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValue({ autenticado: false, perfil: null });
    render(<Login />);
    await preencherCredenciais(user);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("Matrícula ou senha inválidos.");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByLabelText("Matrícula")).toHaveAccessibleDescription(
      "Matrícula ou senha inválidos."
    );
    expect(screen.getByLabelText("Senha")).toHaveAccessibleDescription(
      "Matrícula ou senha inválidos."
    );
    expect(screen.getByLabelText("Matrícula")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Senha")).toHaveAttribute("aria-invalid", "true");
  });

  it("limpa o erro global e o aria-invalid ao tentar novamente com sucesso", async () => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValueOnce({ autenticado: false, perfil: null });
    render(<Login />);
    await preencherCredenciais(user);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await screen.findByRole("alert");

    mocks.login.mockResolvedValueOnce({ autenticado: true, perfil: "aluno" });
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith("/aluno", { replace: true })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Matrícula")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Senha")).not.toHaveAttribute("aria-invalid");
  });

  it.each([
    ["aluno", "/aluno"],
    ["admin", "/"],
  ])("redireciona o perfil %s para %s", async (perfil, destino) => {
    const user = userEvent.setup();
    mocks.login.mockResolvedValue({ autenticado: true, perfil });
    render(<Login />);
    await preencherCredenciais(user);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith(destino, { replace: true })
    );
  });
});
