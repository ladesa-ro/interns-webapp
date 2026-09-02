import { apiJson } from "./api";

const PAGE_SIZE = 1000;

function validarResposta(dados) {
  if (!dados || !Array.isArray(dados.data)) {
    throw new Error("Resposta da API incompleta.");
  }

  return dados;
}

async function buscarTodasAsPaginas(endpoint, formato = "meta") {
  const separador = endpoint.includes("?") ? "&" : "?";
  const primeiraPagina = validarResposta(
    await apiJson(`${endpoint}${separador}page=1&limit=${PAGE_SIZE}`)
  );
  const registros = [...primeiraPagina.data];
  const totalPaginas = formato === "total"
    ? Math.ceil((Number(primeiraPagina.total) || registros.length) / PAGE_SIZE)
    : Number(primeiraPagina.meta?.totalPages) || 1;

  for (let pagina = 2; pagina <= totalPaginas; pagina += 1) {
    const resposta = validarResposta(
      await apiJson(`${endpoint}${separador}page=${pagina}&limit=${PAGE_SIZE}`)
    );
    registros.push(...resposta.data);
  }

  return {
    data: registros,
    total: formato === "total"
      ? Number(primeiraPagina.total) || registros.length
      : Number(primeiraPagina.meta?.totalItems) || registros.length,
  };
}

function possuiEstagio(estagiarioId, estagios) {
  return estagios.some((estagio) => estagio.estagiario?.id === estagiarioId);
}

function cursoDoEstagiario(estagiario) {
  return estagiario.curso?.nome || estagiario.curso?.nomeAbreviado || "Curso não informado";
}

export async function buscarIndicadoresPainel() {
  const [empresas, estagios, estagiarios, relatorios] =
    await Promise.all([
      buscarTodasAsPaginas("/empresas"),
      buscarTodasAsPaginas("/estagios", "total"),
      buscarTodasAsPaginas("/estagiarios"),
      buscarTodasAsPaginas("/relatorios-estagio"),
    ]);

  const estagiosDisponiveis = estagios.data.filter(
    (estagio) => estagio.status === "DISPONIVEL" && !estagio.estagiario?.id
  );
  const alunosEmEstagio = new Set(
    estagios.data
      .filter((estagio) => estagio.status === "EM_ANDAMENTO")
      .map((estagio) => estagio.estagiario?.id)
      .filter(Boolean)
  );
  const alunosTerceiroAno = estagiarios.data.filter(
    (estagiario) => Number(estagiario.periodo) === 3
  );
  const alunosSemEstagio = alunosTerceiroAno.filter(
    (estagiario) => !possuiEstagio(estagiario.id, estagios.data)
  );
  const idsAlunosSegundoAno = new Set(
    estagiarios.data
      .filter((estagiario) => Number(estagiario.periodo) === 2)
      .map((estagiario) => estagiario.id)
  );
  const estagiosDoSegundoAno = estagios.data.filter(
    (estagio) => idsAlunosSegundoAno.has(estagio.estagiario?.id)
  );
  const idsEstagiosComRelatorio = new Set(
    relatorios.data.map((relatorio) => relatorio.estagio?.id).filter(Boolean)
  );
  const idsAlunosComRelatorio = new Set(
    estagiosDoSegundoAno
      .filter((estagio) => idsEstagiosComRelatorio.has(estagio.id))
      .map((estagio) => estagio.estagiario?.id)
      .filter(Boolean)
  );
  const agora = new Date();
  const estagiosQueTerminamEsteMes = estagios.data.filter((estagio) => {
    if (!estagio.dataFim) return false;
    const dataFim = new Date(`${estagio.dataFim}T00:00:00`);
    return dataFim.getFullYear() === agora.getFullYear() && dataFim.getMonth() === agora.getMonth();
  });

  return {
    empresas: empresas.total,
    vagas: estagiosDisponiveis.length,
    alunosEmEstagio: alunosEmEstagio.size,
    alunosSemEstagio: alunosSemEstagio.length,
    relatoriosSegundoAno: idsAlunosComRelatorio.size,
    alunosListaEspera: alunosSemEstagio.length,
    estagiosQueTerminamEsteMes: estagiosQueTerminamEsteMes.length,
  };
}

export async function buscarListaDeEspera() {
  const [estagiarios, estagios] = await Promise.all([
    buscarTodasAsPaginas("/estagiarios"),
    buscarTodasAsPaginas("/estagios", "total"),
  ]);
  const alunos = estagiarios.data
    .filter((estagiario) => estagiario.ativo !== false)
    .filter((estagiario) => !possuiEstagio(estagiario.id, estagios.data))
    .map((estagiario) => ({
      id: estagiario.id,
      matricula: estagiario.perfil?.usuario?.matricula || "-",
      nome: estagiario.perfil?.usuario?.nome || "-",
      empresa: "-",
      curso: cursoDoEstagiario(estagiario),
    }));

  return alunos;
}