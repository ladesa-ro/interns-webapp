import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Painel from "./Painel";

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, useNavigate: () => mocks.navigate };
});

function renderizar() {
  return render(
    <MemoryRouter>
      <Painel />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.navigate.mockReset();
});

describe("Painel", () => {
  it("renderiza título, subtítulo e os cinco indicadores com valores preservados", () => {
    renderizar();

    expect(screen.getByRole("heading", { name: "Painel CIEC" })).toBeInTheDocument();
    expect(
      screen.getByText("Visão geral do Sistema de Gerenciamento de Estágios")
    ).toBeInTheDocument();

    const indicadores = [
      ["Empresas Cadastradas", "24"],
      ["Vagas Disponíveis", "15"],
      ["Alunos em Estágio", "42"],
      ["Alunos do 3° ano sem Estágio", "8"],
      ["Relatórios 2° ano", "8"],
    ];

    indicadores.forEach(([titulo, valor]) => {
      const card = screen.getByRole("button", {
        name: (nome) => nome.startsWith(titulo),
      });
      expect(card).toHaveTextContent(valor);
    });
  });

  it("navega para os destinos exatos ao clicar em cada indicador", async () => {
    const user = userEvent.setup();
    renderizar();

    const destinos = [
      ["Empresas Cadastradas", "/empresa"],
      ["Vagas Disponíveis", "/Vaga"],
      ["Alunos em Estágio", "/alunos-em-estagio"],
      ["Alunos do 3° ano sem Estágio", "/alunos-sem-estagio"],
      ["Relatórios 2° ano", "/relatorio-segundo-ano"],
    ];

    for (const [titulo, destino] of destinos) {
      await user.click(
        screen.getByRole("button", { name: (nome) => nome.startsWith(titulo) })
      );
      expect(mocks.navigate).toHaveBeenCalledWith(destino);
    }

    expect(mocks.navigate).toHaveBeenCalledTimes(destinos.length);
  });

  it("os indicadores são botões focáveis e acionáveis por teclado", async () => {
    const user = userEvent.setup();
    renderizar();

    const primeiro = screen.getByRole("button", { name: /Empresas Cadastradas/ });
    primeiro.focus();
    expect(primeiro).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(mocks.navigate).toHaveBeenCalledWith("/empresa");

    mocks.navigate.mockReset();
    primeiro.focus();
    await user.keyboard(" ");
    expect(mocks.navigate).toHaveBeenCalledWith("/empresa");
  });

  it("os indicadores respondem a toque (clique sintético) como os demais botões", async () => {
    renderizar();

    const card = screen.getByRole("button", { name: /Vagas Disponíveis/ });
    card.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(mocks.navigate).toHaveBeenCalledWith("/Vaga");
  });

  it("renderiza os três alertas com título e subtítulo preservados", () => {
    renderizar();

    expect(screen.getByRole("heading", { name: "Alertas e Pendências" })).toBeInTheDocument();
    expect(screen.getByText("8 alunos do 3° ano sem estágio")).toBeInTheDocument();
    expect(screen.getByText("Requer atenção imediata")).toBeInTheDocument();
    expect(screen.getByText("12 alunos na lista de espera")).toBeInTheDocument();
    expect(screen.getByText("Verificar vagas disponíveis")).toBeInTheDocument();
    expect(screen.getByText("5 estágios terminam este mês")).toBeInTheDocument();
    expect(screen.getByText("Preparar documentação")).toBeInTheDocument();
  });

  it("não exibe a seta de scroll quando o carrossel não transborda", () => {
    renderizar();

    expect(
      screen.queryByRole("button", { name: "Ver mais indicadores" })
    ).not.toBeInTheDocument();
  });

  it("exibe a seta de scroll quando há conteúdo transbordando e a rolagem avança o carrossel", async () => {
    const user = userEvent.setup();
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      get() {
        return this.className?.includes?.("cardsContainer") ? 2000 : 0;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return this.className?.includes?.("cardsContainer") ? 800 : 0;
      },
    });
    const scrollBy = vi.fn();
    HTMLElement.prototype.scrollBy = scrollBy;

    renderizar();

    const seta = await screen.findByRole("button", { name: "Ver mais indicadores" });
    await user.click(seta);

    expect(scrollBy).toHaveBeenCalledWith({ left: 320, behavior: "smooth" });

    delete HTMLElement.prototype.scrollWidth;
    delete HTMLElement.prototype.clientWidth;
    delete HTMLElement.prototype.scrollBy;
  });
});
