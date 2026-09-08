import { describe, expect, it } from "vitest";

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
});
