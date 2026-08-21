export const PERFIL_ALUNO = "aluno";
export const PERFIL_ADMIN = "admin";

// Valores observados em GET /perfis do ambiente de desenvolvimento.
// A lista é deliberadamente restrita: cargo desconhecido não concede acesso.
const CARGOS_ALUNO = new Set(["aluno"]);
const CARGOS_ADMIN = new Set(["dape", "professor"]);

export const ERRO_PERFIL_INDEFINIDO =
  "Não foi possível identificar seu perfil de acesso. Procure o CIEC.";

function normalizar(cargo) {
  return typeof cargo === "string" ? cargo.trim().toLowerCase() : "";
}

/**
 * Deriva o perfil a partir de dados explícitos do servidor. Nunca infere papel
 * por heurística de texto nem assume administrador como padrão.
 */
export function determinarPerfil(usuario, perfisAtivos) {
  if (usuario?.isSuperUser === true) {
    return { perfil: PERFIL_ADMIN, erro: null };
  }

  const vinculos = Array.isArray(perfisAtivos) ? perfisAtivos : [];
  const cargos = vinculos
    .filter((vinculo) => vinculo?.ativo !== false)
    .map((vinculo) => normalizar(vinculo?.cargo))
    .filter(Boolean);

  if (cargos.some((cargo) => CARGOS_ADMIN.has(cargo))) {
    return { perfil: PERFIL_ADMIN, erro: null };
  }

  if (cargos.some((cargo) => CARGOS_ALUNO.has(cargo))) {
    return { perfil: PERFIL_ALUNO, erro: null };
  }

  return { perfil: null, erro: ERRO_PERFIL_INDEFINIDO };
}
