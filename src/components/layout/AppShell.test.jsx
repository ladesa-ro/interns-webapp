import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppShell from "./AppShell";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  alternarTema: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ logout: mocks.logout }),
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({ escuro: false, alternarTema: mocks.alternarTema }),
}));

function IconeTeste(props) {
  return <svg {...props} />;
}

const ITENS = [
  { to: "/", label: "Início", icon: IconeTeste, end: true },
  { to: "/perfil", label: "Perfil", icon: IconeTeste },
];

function renderizar() {
  return render(
    <MemoryRouter>
      <AppShell navItems={ITENS} titulo="Portal de teste">
        <button type="button">Ação do conteúdo</button>
      </AppShell>
    </MemoryRouter>
  );
}

describe("AppShell", () => {
  it("marca a rota atual e expõe o controle do menu", () => {
    renderizar();

    expect(screen.getByRole("link", { name: "Início" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(
      screen.getByRole("button", { name: "Abrir menu de navegação" })
    ).toHaveAttribute("aria-controls", "navegacao-principal");
  });

  it("abre o drawer como diálogo, move o foco e torna o fundo inerte", async () => {
    const user = userEvent.setup();
    renderizar();

    const abrir = screen.getByRole("button", {
      name: "Abrir menu de navegação",
    });
    await user.click(abrir);

    const dialogo = screen.getByRole("dialog", { name: "Menu de navegação" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    await waitFor(() => expect(dialogo).toContainElement(document.activeElement));
    expect(screen.getByRole("banner").parentElement).toHaveProperty("inert", true);
    expect(
      screen.getAllByRole("button", { name: "Fechar menu de navegação" })
    ).toHaveLength(1);
  });

  it("fecha com Escape, remove inert e devolve o foco ao acionador", async () => {
    const user = userEvent.setup();
    renderizar();

    const abrir = screen.getByRole("button", {
      name: "Abrir menu de navegação",
    });
    await user.click(abrir);
    await user.keyboard("{Escape}");

    await waitFor(() => expect(abrir).toHaveFocus());
    expect(abrir).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("banner").parentElement).toHaveProperty("inert", false);
  });

  it("fecha o drawer ao navegar", async () => {
    const user = userEvent.setup();
    renderizar();

    await user.click(
      screen.getByRole("button", { name: "Abrir menu de navegação" })
    );
    await user.click(screen.getByRole("link", { name: "Perfil" }));

    expect(
      screen.getByRole("button", { name: "Abrir menu de navegação" })
    ).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
