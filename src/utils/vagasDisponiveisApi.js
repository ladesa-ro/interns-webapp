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

// Uma página de empresas (/empresas, paginação meta.totalItems) combinada com
// todas as vagas em aberto (/estagios?filter.status=DISPONIVEL) para permitir
// candidatura mesmo a empresas sem vaga aberta no momento (via solicitação).
export async function listarEmpresasComVagas({ page = 1, search = "", signal } = {}) {
  const parametrosEmpresas = new URLSearchParams({
    page: String(page),
    limit: String(ITENS_POR_PAGINA),
  });

  const termo = search.trim();
  if (termo) parametrosEmpresas.set("search", termo);

  const [respostaEmpresas, respostaVagas] = await Promise.all([
    apiJson(`/empresas?${parametrosEmpresas.toString()}`, { signal }),
    apiJson("/estagios?limit=1000&filter.status=DISPONIVEL", { signal }),
  ]);

  const empresas = Array.isArray(respostaEmpresas?.data) ? respostaEmpresas.data : [];
  const vagasAbertas = Array.isArray(respostaVagas?.data) ? respostaVagas.data : [];

  const vagasPorEmpresa = new Map();
  vagasAbertas.forEach((vaga) => {
    const id = vaga?.empresa?.id;
    if (!id) return;
    if (!vagasPorEmpresa.has(id)) vagasPorEmpresa.set(id, []);
    vagasPorEmpresa.get(id).push(vaga);
  });

  const itens = empresas
    .filter((empresa) => empresa?.id)
    .map((empresa) => {
      const vagas = vagasPorEmpresa.get(empresa.id) ?? [];
      return {
        empresa,
        vagas,
        vagasDisponiveis: vagas.length,
        vagaPrincipal: vagas[0] ?? null,
      };
    });

  return {
    itens,
    pagina: Number.isInteger(respostaEmpresas?.meta?.currentPage) ? respostaEmpresas.meta.currentPage : page,
    total: Number.isFinite(respostaEmpresas?.meta?.totalItems) ? respostaEmpresas.meta.totalItems : itens.length,
    totalPaginas: Number.isInteger(respostaEmpresas?.meta?.totalPages) ? respostaEmpresas.meta.totalPages : 1,
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

export function nomeEmpresa(empresa) {
  return empresa?.nomeFantasia ?? empresa?.razaoSocial ?? "Empresa não informada";
}

export function nomeDaEmpresa(vaga) {
  return nomeEmpresa(vaga?.empresa);
}

export function nomeDoCurso(vaga) {
  return vaga?.CursoReferencia?.nome ?? vaga?.CursoReferencia?.nomeAbreviado ?? "Curso não informado";
}

export function vagaInterna(vaga) {
  return Boolean(vaga?.campus);
}

export function localizacaoDoEndereco(endereco) {
  const cidade = endereco?.cidade?.nome;
  const estado = endereco?.cidade?.estado?.sigla;
  const cidadeEstado = [cidade, estado].filter(Boolean).join(" - ");
  const logradouro = [endereco?.logradouro, endereco?.numero].filter(Boolean).join(", ");

  return [logradouro, endereco?.bairro, cidadeEstado].filter(Boolean).join(" · ") || "Localização não informada";
}

export function localizacaoDaVaga(vaga) {
  const endereco = vagaInterna(vaga) ? vaga.campus?.endereco : vaga?.empresa?.endereco;
  return localizacaoDoEndereco(endereco);
}

