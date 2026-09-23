import { describe, expect, it, vi } from "vitest";

import { instalarFetch } from "../test/apiMock";
import { listarProfessoresElegiveis } from "./solicitacoesEstagioApi";

describe("listarProfessoresElegiveis", () => {
  it("resolve o campus da sessão e usa os filtros documentados de perfil", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: { perfisAtivos: [{ campus: { id: "camp-1" } }] },
      }),
      "/perfis": () => ({
        status: 200,
        body: { data: [{ id: "prof-1", cargo: "professor" }] },
      }),
    });

    await expect(listarProfessoresElegiveis()).resolves.toEqual([
      { id: "prof-1", cargo: "professor" },
    ]);

    const url = new URL(String(chamadas[1].url), "http://localhost");
    expect(url.searchParams.get("filter.cargo.nome")).toBe("professor");
    expect(url.searchParams.get("filter.campus.id")).toBe("camp-1");
  });

  it("não inventa campus quando a sessão não retorna vínculo", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: { perfisAtivos: [] } }),
      "/perfis": () => ({ status: 200, body: { data: [] } }),
    });

    await listarProfessoresElegiveis();

    const url = new URL(String(chamadas[1].url), "http://localhost");
    expect(url.searchParams.get("filter.cargo.nome")).toBe("professor");
    expect(url.searchParams.has("filter.campus.id")).toBe(false);
  });

  // Teste 6a: resposta com lista vazia
  it("retorna array vazio quando /perfis não retorna professores", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: { perfisAtivos: [{ campus: { id: "camp-1" } }] } }),
      "/perfis": () => ({ status: 200, body: { data: [] } }),
    });

    const resultado = await listarProfessoresElegiveis();
    expect(resultado).toEqual([]);
  });

  // Teste 6b: retorna array vazio quando data não é array (resposta malformada)
  it("retorna array vazio quando /perfis retorna body sem data", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: { perfisAtivos: [] } }),
      "/perfis": () => ({ status: 200, body: null }),
    });

    const resultado = await listarProfessoresElegiveis();
    expect(resultado).toEqual([]);
  });

  // Teste 6c: erro 401 em /autenticacao/quem-sou-eu propaga exceção
  it("propaga erro quando quem-sou-eu retorna 401", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 401, body: { message: "Unauthorized" } }),
    });

    await expect(listarProfessoresElegiveis()).rejects.toThrow();
  });

  // Teste 6d: erro de rede propaga exceção
  // api.js captura o TypeError e relança como ApiError com mensagem traduzida,
  // portanto verificamos o kind do erro em vez da mensagem interna do browser.
  it("propaga erro de rede", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(listarProfessoresElegiveis()).rejects.toThrow(
      "Não foi possível conectar ao servidor. Verifique sua conexão."
    );
  });

  // Teste 6e: professor na lista tem estrutura compatível com o seletor do formulário
  it("retorna estrutura com id e usuario para uso no seletor", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: { perfisAtivos: [{ campus: { id: "camp-2" } }] },
      }),
      "/perfis": () => ({
        status: 200,
        body: {
          data: [
            { id: "prof-uuid-1", cargo: "professor", usuario: { nome: "Professora Ana", matricula: "1001" } },
            { id: "prof-uuid-2", cargo: "professor", usuario: { nome: "Professor Bruno", matricula: "1002" } },
          ],
        },
      }),
    });

    const lista = await listarProfessoresElegiveis();
    expect(lista).toHaveLength(2);
    expect(lista[0]).toMatchObject({ id: "prof-uuid-1", usuario: { nome: "Professora Ana" } });
    expect(lista[1]).toMatchObject({ id: "prof-uuid-2", usuario: { nome: "Professor Bruno" } });
  });

  // Teste 6f: apenas um perfil por campus é passado como filtro
  it("usa o id do campus do primeiro perfil ativo que tem campus", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: {
          perfisAtivos: [
            { cargo: "aluno" }, // sem campus
            { campus: { id: "camp-correto" }, cargo: "professor" },
          ],
        },
      }),
      "/perfis": () => ({ status: 200, body: { data: [] } }),
    });

    await listarProfessoresElegiveis();

    const url = new URL(String(chamadas[1].url), "http://localhost");
    expect(url.searchParams.get("filter.campus.id")).toBe("camp-correto");
  });
});
