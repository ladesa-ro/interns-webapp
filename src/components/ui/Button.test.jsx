import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "./Button";
import Card from "./Card";
import Input from "./Input";

describe("Button", () => {
  it("é acionável por teclado", async () => {
    const aoClicar = vi.fn();
    render(<Button onClick={aoClicar}>Salvar</Button>);

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("bloqueia o clique e anuncia o carregamento", async () => {
    const aoClicar = vi.fn();
    render(
      <Button loading onClick={aoClicar}>
        Salvar
      </Button>
    );

    const botao = screen.getByRole("button", { name: /carregando/i });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("aria-busy", "true");

    await userEvent.click(botao);
    expect(aoClicar).not.toHaveBeenCalled();
  });

  it("usa type button por padrão para não submeter formulários", () => {
    render(<Button>Cancelar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});

describe("Card", () => {
  it("vira button quando recebe onClick, ficando acessível por teclado", async () => {
    const aoClicar = vi.fn();
    render(<Card onClick={aoClicar}>Empresas</Card>);

    const card = screen.getByRole("button", { name: "Empresas" });
    await userEvent.tab();
    expect(card).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("permanece um elemento não interativo sem onClick", () => {
    render(<Card>Somente leitura</Card>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("Input", () => {
  it("liga rótulo, dica e erro ao controle", () => {
    render(
      <Input
        label="CNPJ"
        hint="Somente números"
        error="CNPJ inválido"
        defaultValue=""
      />
    );

    const campo = screen.getByLabelText(/CNPJ/);
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAccessibleDescription(/Somente números/);
    expect(campo).toHaveAccessibleDescription(/CNPJ inválido/);
    expect(screen.getByRole("alert")).toHaveTextContent("CNPJ inválido");
  });

  it("não marca aria-invalid quando não há erro", () => {
    render(<Input label="Nome" defaultValue="" />);
    expect(screen.getByLabelText("Nome")).not.toHaveAttribute("aria-invalid");
  });
});
