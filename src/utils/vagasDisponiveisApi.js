import { apiJson } from "./api";

const ITENS_POR_PAGINA = 12;

export async function listarVagasDisponiveis({ page = 1, search = "", signal } = {}) {
  const parametros = new URLSearchParams({
    page: String(page),
    limit: String(ITENS_POR_PAGINA),
    "filter.status": "DISPONIVEL",
  });

  const termo = search.trim();
  if (termo) parametros.set("search", termo);

  const resposta = await apiJson(`/estagios?${parametros.toString()}`, { signal });
  const vagas = Array.isArray(resposta?.data) ? resposta.data : [];

  return {
    vagas,
    pagina: Number.isInteger(resposta?.page) ? resposta.page : page,
    total: Number.isFinite(resposta?.total) ? resposta.total : vagas.length,
    limite: Number.isInteger(resposta?.limit) ? resposta.limit : ITENS_POR_PAGINA,
  };
}

export function dadosDaVagaParaSolicitacao(vaga) {
  return {
    id: vaga?.id ?? "",
    empresa: vaga?.empresa ?? null,
    campus: vaga?.campus ?? null,
    curso: vaga?.CursoReferencia ?? null,
    cargaHoraria: vaga?.cargaHoraria ?? null,
    supervisor: vaga?.nomeSupervisor ?? "",
    emailSupervisor: vaga?.emailSupervisor ?? "",
    telefoneSupervisor: vaga?.telefoneSupervisor ?? "",
  };
}

export function nomeDaEmpresa(vaga) {
  return vaga?.empresa?.nomeFantasia ?? vaga?.empresa?.razaoSocial ?? "Empresa não informada";
}

export function nomeDoCurso(vaga) {
  return vaga?.CursoReferencia?.nome ?? vaga?.CursoReferencia?.nomeAbreviado ?? "Curso não informado";
}

export function vagaInterna(vaga) {
  return Boolean(vaga?.campus);
}

export function localizacaoDaVaga(vaga) {
  const endereco = vagaInterna(vaga) ? vaga.campus?.endereco : vaga?.empresa?.endereco;
  const cidade = endereco?.cidade?.nome;
  const estado = endereco?.cidade?.estado?.sigla;
  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");
  const logradouro = [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", ");

  return [logradouro, endereco?.bairro, cidadeEstado].filter(Boolean).join(" · ") || "Localização não informada";
}
