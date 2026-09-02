import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Tabela from "./Tabela";

const COLUNAS = [
  { label: "Matrícula", chave: "matricula" },
  { label: "Nome", chave: "nome" },
];

describe("Tabela", () => {
  it("renderiza cabeçalhos e linhas com os dados informados", () => {
    render(
      <Tabela
        colunas={COLUNAS}
        dados={[{ matricula: "123", nome: "Ana" }]}
      />
    );

    expect(screen.getByRole("columnheader", { name: "Matrícula" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ana" })).toBeInTheDocument();
  });

  it("não gera aviso de key ausente quando os itens não possuem id", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <Tabela
        colunas={COLUNAS}
        dados={[
          { matricula: "1", nome: "Ana" },
          { matricula: "2", nome: "Bruno" },
        ]}
      />
    );

    const avisoDeKey = erro.mock.calls.some((chamada) =>
      String(chamada[0]).includes("unique")
    );
    expect(avisoDeKey).toBe(false);

    erro.mockRestore();
  });
});
