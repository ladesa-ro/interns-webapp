import { afterEach, describe, expect, it, vi } from "vitest";

import { instalarFetch } from "../test/apiMock";
import { ApiError, ApiErrorKind, setAccessToken } from "./api";
import {
  LIMITE_OBSERVACOES,
  STATUS_FOLHA_PONTO,
  buscarEstagiosDoAluno,
  cancelarFolhaPonto,
  criarFolhaPonto,
  dataValida,
  formatarData,
  horaValida,
  listarFolhasPonto,
  podeCancelar,
  validarFolhaPonto,
} from "./folhaPontoApi";

function folha(extra = {}) {
  return {
    id: "fp-1",
    estagio: { id: "est-1" },
    data: "2026-06-15",
    horaInicio: "13:30",
    horaFim: "17:30",
    quantidadeHoras: 4,
    status: STATUS_FOLHA_PONTO.PENDING,
    dataSolicitacao: "2026-06-15T13:30:00Z",
    ...extra,
  };
}

function urlDaChamada(chamadas, indice = 0) {
  return new URL(String(chamadas.at(indice).url), "http://localhost");
}

afterEach(() => {
  setAccessToken(null);
});

describe("validação de entrada", () => {
  it("aceita data e horas no formato documentado", () => {
    expect(dataValida("2026-02-28")).toBe(true);
    expect(horaValida("07:05")).toBe(true);
    expect(validarFolhaPonto({
      estagioId: "est-1",
      data: "2026-06-15",
      horaInicio: "13:30",
      horaFim: "17:30",
      observacoes: "",
    })).toEqual({});
  });

  it("rejeita data inexistente ou fora do formato", () => {
    expect(dataValida("2026-02-30")).toBe(false);
    expect(dataValida("15/06/2026")).toBe(false);
    expect(validarFolhaPonto({ estagioId: "est-1", data: "2026-13-01", horaInicio: "13:30", horaFim: "17:30" }).data)
      .toBeTruthy();
  });

  it("rejeita hora fora do formato HH:MM", () => {
    expect(horaValida("25:00")).toBe(false);
    expect(horaValida("7:5")).toBe(false);
    const erros = validarFolhaPonto({ estagioId: "est-1", data: "2026-06-15", horaInicio: "25:00", horaFim: "17:70" });
    expect(erros.horaInicio).toBeTruthy();
    expect(erros.horaFim).toBeTruthy();
  });

  it("rejeita observações acima de 2000 caracteres", () => {
    const erros = validarFolhaPonto({
      estagioId: "est-1",
      data: "2026-06-15",
      horaInicio: "13:30",
      horaFim: "17:30",
      observacoes: "a".repeat(LIMITE_OBSERVACOES + 1),
    });
    expect(erros.observacoes).toBeTruthy();
  });

  it("exige o estágio selecionado", () => {
    expect(validarFolhaPonto({ data: "2026-06-15", horaInicio: "13:30", horaFim: "17:30" }).estagio)
      .toBeTruthy();
  });
});

describe("listarFolhasPonto", () => {
  it("envia apenas os parâmetros documentados", async () => {
    const { chamadas } = instalarFetch({
      "/folha-ponto": () => ({ status: 200, body: { data: [folha()], meta: {} } }),
    });

    await listarFolhasPonto({
      page: 2,
      limit: 10,
      search: " turno ",
      status: [STATUS_FOLHA_PONTO.PENDING],
      estagioId: "est-1",
      sortBy: ["data:DESC"],
    });

    const url = urlDaChamada(chamadas);
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.get("search")).toBe("turno");
    expect(url.searchParams.getAll("filter.status")).toEqual(["PENDING"]);
    expect(url.searchParams.getAll("filter.estagio.id")).toEqual(["est-1"]);
    expect(url.searchParams.getAll("sortBy")).toEqual(["data:DESC"]);

    const parametros = [...url.searchParams.keys()];
    const permitidos = new Set(["page", "limit", "search", "sortBy", "filter.id", "filter.status", "filter.estagio.id"]);
    expect(parametros.every((chave) => permitidos.has(chave))).toBe(true);
  });

  it("usa meta.totalItems como total, não o tamanho da página", async () => {
    instalarFetch({
      "/folha-ponto": () => ({
        status: 200,
        body: {
          data: [folha(), folha({ id: "fp-2" })],
          meta: { totalItems: 37, currentPage: 2, totalPages: 4, itemsPerPage: 10 },
        },
      }),
    });

    const { registros, meta } = await listarFolhasPonto({ page: 2 });

    expect(registros).toHaveLength(2);
    expect(meta.totalItems).toBe(37);
    expect(meta.totalPages).toBe(4);
  });

  it("não quebra quando a resposta vem incompleta", async () => {
    instalarFetch({ "/folha-ponto": () => ({ status: 200, body: {} }) });

    const { registros, meta } = await listarFolhasPonto();

    expect(registros).toEqual([]);
    expect(meta.totalItems).toBe(0);
    expect(meta.totalPages).toBe(1);
  });

  it("propaga 403 como erro em vez de lista vazia", async () => {
    instalarFetch({ "/folha-ponto": () => ({ status: 403, body: null }) });

    await expect(listarFolhasPonto()).rejects.toMatchObject({
      kind: ApiErrorKind.FORBIDDEN,
    });
  });

  it("propaga 401 como sessão expirada", async () => {
    instalarFetch({ "/folha-ponto": () => ({ status: 401, body: null }) });

    await expect(listarFolhasPonto()).rejects.toMatchObject({
      kind: ApiErrorKind.UNAUTHORIZED,
    });
  });

  it("propaga erro de rede", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("failed to fetch");
    }));

    await expect(listarFolhasPonto()).rejects.toMatchObject({
      kind: ApiErrorKind.NETWORK,
    });
  });
});

describe("criarFolhaPonto", () => {
  it("envia somente os campos documentados", async () => {
    const { chamadas } = instalarFetch({
      "/folha-ponto": () => ({ status: 201, body: folha() }),
    });

    await criarFolhaPonto({
      estagioId: "est-1",
      data: "2026-06-15",
      horaInicio: "13:30",
      horaFim: "17:30",
      observacoes: "  ",
    });

    const corpo = JSON.parse(chamadas[0].options.body);
    expect(corpo).toEqual({
      estagio: { id: "est-1" },
      data: "2026-06-15",
      horaInicio: "13:30",
      horaFim: "17:30",
    });
    expect(chamadas[0].options.method).toBe("POST");
  });

  it("inclui observações quando preenchidas", async () => {
    const { chamadas } = instalarFetch({
      "/folha-ponto": () => ({ status: 201, body: folha() }),
    });

    await criarFolhaPonto({
      estagioId: "est-1",
      data: "2026-06-15",
      horaInicio: "13:30",
      horaFim: "17:30",
      observacoes: " atividades de laboratório ",
    });

    expect(JSON.parse(chamadas[0].options.body).observacoes).toBe(
      "atividades de laboratório"
    );
  });
});

describe("cancelarFolhaPonto", () => {
  it("permite cancelar apenas folhas PENDING", () => {
    expect(podeCancelar(folha())).toBe(true);
    expect(podeCancelar(folha({ status: STATUS_FOLHA_PONTO.APPROVED }))).toBe(false);
    expect(podeCancelar(folha({ status: STATUS_FOLHA_PONTO.CANCELLED }))).toBe(false);
    expect(podeCancelar(undefined)).toBe(false);
  });

  it("usa DELETE no recurso identificado", async () => {
    const { chamadas } = instalarFetch({
      "/folha-ponto/fp-1": () => ({ status: 200, body: true }),
    });

    await cancelarFolhaPonto("fp-1");

    expect(chamadas[0].options.method).toBe("DELETE");
    expect(String(chamadas[0].url)).toContain("/folha-ponto/fp-1");
  });

  it("propaga 404 quando a folha não existe", async () => {
    instalarFetch({ "/folha-ponto/": () => ({ status: 404, body: null }) });

    await expect(cancelarFolhaPonto("fp-x")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("buscarEstagiosDoAluno", () => {
  it("resolve perfil -> estagiário -> estágio pelos filtros documentados", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: { usuario: { id: "u-1" }, perfisAtivos: [{ id: "perf-1", ativo: true, cargo: "aluno" }] },
      }),
      "/estagiarios": () => ({ status: 200, body: { data: [{ id: "estg-1" }], meta: {} } }),
      "/estagios": () => ({ status: 200, body: { data: [{ id: "est-1", empresa: { nome: "ACME" } }], meta: {} } }),
    });

    const estagios = await buscarEstagiosDoAluno();

    expect(estagios).toEqual([{ id: "est-1", empresa: { nome: "ACME" } }]);
    expect(urlDaChamada(chamadas, 1).searchParams.getAll("filter.perfil.id")).toEqual(["perf-1"]);
    expect(urlDaChamada(chamadas, 2).searchParams.getAll("filter.estagiario.id")).toEqual(["estg-1"]);
  });

  it("retorna lista vazia quando não há vínculo de estagiário", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: { usuario: { id: "u-1" }, perfisAtivos: [{ id: "perf-1", ativo: true }] },
      }),
      "/estagiarios": () => ({ status: 200, body: { data: [], meta: {} } }),
    });

    await expect(buscarEstagiosDoAluno()).resolves.toEqual([]);
  });
});

describe("formatação", () => {
  it("apresenta a data no padrão brasileiro sem alterar o valor enviado", () => {
    expect(formatarData("2026-06-15")).toBe("15/06/2026");
    expect(formatarData("valor-invalido")).toBe("valor-invalido");
  });
});
