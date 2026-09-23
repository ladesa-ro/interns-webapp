import { apiJson, requestBaseUrl } from "./api";

export async function buscarEmpresa(empresaId, { signal } = {}) {
  return apiJson(`/empresas/${encodeURIComponent(empresaId)}`, {
    signal,
  });
}

export function urlFotoEmpresa(empresaId) {
  if (!empresaId) return null;
  return `${requestBaseUrl}/empresas/${encodeURIComponent(empresaId)}/imagem/foto-empresa`;
}

export async function avaliarEmpresa(empresaId, payload, { signal } = {}) {
  return apiJson(`/empresas/${encodeURIComponent(empresaId)}/avaliacoes`, {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}
