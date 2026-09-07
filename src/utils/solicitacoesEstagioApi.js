import { apiJson } from "./api";

export const SITUACAO_CANDIDATURA = Object.freeze({
  PENDING: "PENDING",
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
});

export const ROTULOS_CANDIDATURA = new Map([
  [SITUACAO_CANDIDATURA.PENDING, "Na lista de espera"],
  [SITUACAO_CANDIDATURA.OFFERED, "Vaga disponível para você"],
  [SITUACAO_CANDIDATURA.ACCEPTED, "Vaga aceita"],
  [SITUACAO_CANDIDATURA.REJECTED, "Não selecionada"],
  [SITUACAO_CANDIDATURA.CANCELLED, "Cancelada"],
  [SITUACAO_CANDIDATURA.EXPIRED, "Oferta expirada"],
]);

export const TONS_CANDIDATURA = new Map([
  [SITUACAO_CANDIDATURA.PENDING, "warning"],
  [SITUACAO_CANDIDATURA.OFFERED, "success"],
  [SITUACAO_CANDIDATURA.ACCEPTED, "success"],
  [SITUACAO_CANDIDATURA.REJECTED, "danger"],
  [SITUACAO_CANDIDATURA.CANCELLED, "neutral"],
  [SITUACAO_CANDIDATURA.EXPIRED, "danger"],
]);

export function candidatarSe(estagioId, { signal } = {}) {
  return apiJson(`/estagios/${encodeURIComponent(estagioId)}/candidaturas`, {
    method: "POST",
    signal,
  });
}

export async function listarMinhasCandidaturas({
  page = 1,
  limit = 10,
  search = "",
  situacao = "",
  signal,
} = {}) {
  const parametros = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) parametros.set("search", search.trim());
  if (situacao) parametros.set("filter.situacao", situacao);

  const resposta = await apiJson(`/minhas-candidaturas?${parametros.toString()}`, { signal });
  const candidaturas = Array.isArray(resposta?.data) ? resposta.data : [];

  return {
    candidaturas,
    meta: {
      totalItems: Number.isFinite(resposta?.meta?.totalItems)
        ? resposta.meta.totalItems
        : candidaturas.length,
      currentPage: Number.isInteger(resposta?.meta?.currentPage)
        ? resposta.meta.currentPage
        : page,
      totalPages: Number.isInteger(resposta?.meta?.totalPages)
        ? resposta.meta.totalPages
        : 1,
    },
  };
}

export function aceitarCandidatura(candidaturaId, { signal } = {}) {
  return apiJson(`/minhas-candidaturas/${encodeURIComponent(candidaturaId)}/aceitar`, {
    method: "POST",
    signal,
  });
}

export function cancelarCandidatura(candidaturaId, motivo, { signal } = {}) {
  const texto = motivo?.trim();

  return apiJson(`/minhas-candidaturas/${encodeURIComponent(candidaturaId)}`, {
    method: "DELETE",
    body: texto ? JSON.stringify({ motivo: texto }) : undefined,
    signal,
  });
}

export function solicitarEstagioExterno({ empresa, supervisor }, { signal } = {}) {
  return apiJson("/solicitacoes-estagio/externo", {
    method: "POST",
    body: JSON.stringify({ empresa, supervisor }),
    signal,
  });
}

export const ROTULOS_SOLICITACAO = new Map([
  ["PENDENTE", "Pendente"],
  ["EM_ANALISE", "Em análise"],
  ["DEFERIDA", "Deferida"],
  ["INDEFERIDA", "Indeferida"],
  ["CANCELADA", "Cancelada"],
]);

export const TONS_SOLICITACAO = new Map([
  ["PENDENTE", "warning"],
  ["EM_ANALISE", "info"],
  ["DEFERIDA", "success"],
  ["INDEFERIDA", "danger"],
  ["CANCELADA", "neutral"],
]);

export async function listarMinhasSolicitacoes({ signal } = {}) {
  const resposta = await apiJson("/minhas-solicitacoes", { signal });
  return Array.isArray(resposta) ? resposta : [];
}

export function cancelarSolicitacao(id, { signal } = {}) {
  return apiJson(`/minhas-solicitacoes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  });
}

export function solicitacaoPodeSerCancelada(solicitacao) {
  return ["PENDENTE", "EM_ANALISE"].includes(solicitacao?.situacao);
}

export function validarSolicitacaoExterna({ empresa, supervisor }) {
  const erros = {};
  if (!empresa?.razaoSocial?.trim()) erros.razaoSocial = "Informe a razão social da empresa.";
  if (!empresa?.cnpj?.trim()) erros.cnpj = "Informe o CNPJ da empresa.";
  if (!supervisor?.nome?.trim()) erros.supervisorNome = "Informe o nome do supervisor.";
  return erros;
}
