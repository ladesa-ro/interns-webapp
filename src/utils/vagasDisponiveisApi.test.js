import { describe, expect, it } from "vitest";

import { instalarFetch } from "../test/apiMock";
import {
  dadosDaVagaParaSolicitacao,
  listarVagasDisponiveis,
  localizacaoDaVaga,
  nomeDaEmpresa,
  nomeDoCurso,
  vagaInterna,
} from "./vagasDisponiveisApi";

const vaga = {
  id: "est-1",
  empresa: { id: "emp-1", nomeFantasia: "Empresa Teste" },
  campus: { id: "camp-1", nomeFantasia: "Campus Teste" },
  CursoReferencia: { id: "curso-1", nome: "Informática" },
  cargaHoraria: 20,
  nomeSupervisor: "Supervisor Teste",
  emailSupervisor: "supervisor@example.test",
  telefoneSupervisor: "69000000000",
};

describe("listarVagasDisponiveis", () => {
  it("consulta somente estágios com status DISPONIVEL", async () => {
    const { chamadas } = instalarFetch({
      "/estagios": () => ({
        status: 200,
        body: { data: [vaga], total: 24, page: 2, limit: 12 },
      }),
    });

    const resultado = await listarVagasDisponiveis({ page: 2, search: " empresa " });
    const url = new URL(String(chamadas[0].url), "http://localhost");

    expect(url.searchParams.get("filter.status")).toBe("DISPONIVEL");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("limit")).toBe("12");
    expect(url.searchParams.get("search")).toBe("empresa");
    expect(resultado).toMatchObject({ vagas: [vaga], total: 24, pagina: 2, limite: 12 });
  });

  it("tolera uma resposta de listagem incompleta", async () => {
    instalarFetch({ "/estagios": () => ({ status: 200, body: {} }) });

    await expect(listarVagasDisponiveis()).resolves.toEqual({
      vagas: [],
      pagina: 1,
      total: 0,
      limite: 12,
    });
  });
});

describe("dadosDaVagaParaSolicitacao", () => {
  it("retém somente os dados apresentados ao aluno", () => {
    expect(dadosDaVagaParaSolicitacao(vaga)).toEqual({
      id: "est-1",
      empresa: vaga.empresa,
      campus: vaga.campus,
      curso: vaga.CursoReferencia,
      cargaHoraria: 20,
      supervisor: "Supervisor Teste",
      emailSupervisor: "supervisor@example.test",
      telefoneSupervisor: "69000000000",
    });
  });

  it("formata dados ausentes sem quebrar o catálogo", () => {
    expect(nomeDaEmpresa({})).toBe("Empresa não informada");
    expect(nomeDoCurso({})).toBe("Curso não informado");
  });

  it("usa endereço da empresa para vaga externa e campus apenas para interna", () => {
    const externa = {
      empresa: { endereco: { logradouro: "Rua Externa", numero: 10, cidade: { nome: "Porto Velho", estado: { sigla: "RO" } } } },
    };
    const interna = {
      campus: { nomeFantasia: "IFRO", endereco: { logradouro: "Av. Interna", cidade: { nome: "Ariquemes", estado: { sigla: "RO" } } } },
      empresa: { endereco: { logradouro: "Não usar" } },
    };

    expect(vagaInterna(externa)).toBe(false);
    expect(localizacaoDaVaga(externa)).toBe("Rua Externa, 10 · Porto Velho - RO");
    expect(vagaInterna(interna)).toBe(true);
    expect(localizacaoDaVaga(interna)).toBe("Av. Interna · Ariquemes - RO");
  });
});
