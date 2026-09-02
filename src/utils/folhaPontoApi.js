import { apiJson } from "./api";

// Contratos conforme a documentação oficial da API Ladesa (tag folha-ponto).
const ENDPOINT = "/folha-ponto";

export const STATUS_FOLHA_PONTO = Object.freeze({
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
});

export const ROTULOS_STATUS = new Map([
  [STATUS_FOLHA_PONTO.PENDING, "Aguardando supervisor"],
  [STATUS_FOLHA_PONTO.APPROVED, "Aprovada"],
  [STATUS_FOLHA_PONTO.REJECTED, "Rejeitada"],
  [STATUS_FOLHA_PONTO.EXPIRED, "Expirada"],
  [STATUS_FOLHA_PONTO.CANCELLED, "Cancelada"],
]);

export const TONS_STATUS = new Map([
  [STATUS_FOLHA_PONTO.PENDING, "warning"],
  [STATUS_FOLHA_PONTO.APPROVED, "success"],
  [STATUS_FOLHA_PONTO.REJECTED, "danger"],
  [STATUS_FOLHA_PONTO.EXPIRED, "neutral"],
  [STATUS_FOLHA_PONTO.CANCELLED, "neutral"],
]);

export const LIMITE_OBSERVACOES = 2000;

const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const PADRAO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function dataValida(valor) {
  if (!PADRAO_DATA.test(valor ?? "")) return false;

  const [ano, mes, dia] = valor.split("-").map(Number);
  const referencia = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    referencia.getUTCFullYear() === ano &&
    referencia.getUTCMonth() === mes - 1 &&
    referencia.getUTCDate() === dia
  );
}

export function horaValida(valor) {
  return PADRAO_HORA.test(valor ?? "");
}

export function validarFolhaPonto({
  estagioId,
  data,
  horaInicio,
  horaFim,
  observacoes,
} = {}) {
  const erros = {};

  if (!estagioId) erros.estagio = "Selecione o estágio.";
  if (!dataValida(data)) erros.data = "Informe uma data válida (AAAA-MM-DD).";
  if (!horaValida(horaInicio)) erros.horaInicio = "Informe a hora no formato HH:MM.";
  if (!horaValida(horaFim)) erros.horaFim = "Informe a hora no formato HH:MM.";
  if ((observacoes ?? "").length > LIMITE_OBSERVACOES) {
    erros.observacoes = `Use no máximo ${LIMITE_OBSERVACOES} caracteres.`;
  }

  return erros;
}

function inteiro(valor) {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

// meta.totalItems é a autoridade da paginação; data.length só cobre respostas
// incompletas, para a página não afirmar um total que a API não informou.
function normalizarMeta(meta, quantidade) {
  return {
    totalItems: inteiro(meta?.totalItems) ?? quantidade,
    currentPage: inteiro(meta?.currentPage) ?? 1,
    totalPages: inteiro(meta?.totalPages) ?? 1,
    itemsPerPage: inteiro(meta?.itemsPerPage) ?? quantidade,
  };
}

export async function listarFolhasPonto({
  page = 1,
  limit = 10,
  search = "",
  status = [],
  estagioId = "",
  sortBy = [],
  signal,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const termo = search.trim();
  if (termo) params.set("search", termo);

  sortBy.filter(Boolean).forEach((valor) => params.append("sortBy", valor));
  status.filter(Boolean).forEach((valor) => params.append("filter.status", valor));
  if (estagioId) params.append("filter.estagio.id", estagioId);

  const payload = await apiJson(`${ENDPOINT}?${params.toString()}`, { signal });
  const registros = Array.isArray(payload?.data) ? payload.data : [];

  return { registros, meta: normalizarMeta(payload?.meta, registros.length) };
}

export function buscarFolhaPonto(id, { signal } = {}) {
  return apiJson(`${ENDPOINT}/${encodeURIComponent(id)}`, { signal });
}

export function criarFolhaPonto(
  { estagioId, data, horaInicio, horaFim, observacoes },
  { signal } = {}
) {
  const corpo = { estagio: { id: estagioId }, data, horaInicio, horaFim };
  const texto = (observacoes ?? "").trim();
  if (texto) corpo.observacoes = texto;

  return apiJson(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(corpo),
    signal,
  });
}

// A API documenta o cancelamento apenas para folhas com status PENDING.
export function cancelarFolhaPonto(id, { signal } = {}) {
  return apiJson(`${ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    signal,
  });
}

export function podeCancelar(folha) {
  return folha?.status === STATUS_FOLHA_PONTO.PENDING;
}

// A API não expõe "meus estágios": o vínculo é resolvido pelos filtros
// documentados perfil -> estagiário -> estágio.
export async function buscarEstagiosDoAluno({ signal } = {}) {
  const sessao = await apiJson("/autenticacao/quem-sou-eu", { signal });
  const perfis = (sessao?.perfisAtivos ?? []).filter(
    (perfil) => perfil?.id && perfil.ativo !== false
  );

  if (perfis.length === 0) return [];

  const filtroPerfis = new URLSearchParams({ limit: "20" });
  perfis.forEach((perfil) => filtroPerfis.append("filter.perfil.id", perfil.id));

  const estagiarios = await apiJson(`/estagiarios?${filtroPerfis.toString()}`, { signal });
  const idsEstagiarios = (estagiarios?.data ?? [])
    .map((estagiario) => estagiario?.id)
    .filter(Boolean);

  if (idsEstagiarios.length === 0) return [];

  const filtroEstagios = new URLSearchParams({ limit: "50" });
  idsEstagiarios.forEach((id) => filtroEstagios.append("filter.estagiario.id", id));

  const estagios = await apiJson(`/estagios?${filtroEstagios.toString()}`, { signal });

  return (estagios?.data ?? []).filter((estagio) => estagio?.id);
}

export function formatarData(valor) {
  if (!dataValida(valor)) return valor ?? "-";
  const [ano, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarHorario(horaInicio, horaFim) {
  if (!horaInicio || !horaFim) return "-";
  return `${horaInicio} - ${horaFim}`;
}

export function formatarQuantidadeHoras(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return "-";
  return `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} h`;
}
