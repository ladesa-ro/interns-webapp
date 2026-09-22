import apiFetch, { ApiError, ApiErrorKind } from "./api";

const ENDPOINT = (usuarioId) => `/usuarios/${encodeURIComponent(usuarioId)}/imagem/perfil`;

// A API retorna o arquivo binário da foto, não um DTO JSON: o objeto é
// convertido em URL local, e o chamador é responsável por revogá-la.
export async function buscarImagemPerfilUrl(usuarioId, { signal } = {}) {
  if (!usuarioId) return null;

  const resposta = await apiFetch(ENDPOINT(usuarioId), { signal });

  const contentType = resposta?.headers?.get?.("Content-Type") ?? "";

  if (resposta.status === 404) return null;

  if (!resposta.ok) {
    const kind =
      resposta.status === 403
        ? ApiErrorKind.FORBIDDEN
        : resposta.status >= 500
          ? ApiErrorKind.SERVER
          : ApiErrorKind.UNKNOWN;
    throw new ApiError(kind, resposta.status);
  }

  // Garante que a resposta é uma imagem antes de criar a blob URL.
  // Evita exibir <img> quebrado quando a API retorna JSON ou outro conteúdo.
  if (!contentType.startsWith("image/")) {
    return null;
  }

  const blob = await resposta.blob();
  return URL.createObjectURL(blob);
}

export async function atualizarImagemPerfil(usuarioId, arquivo, { signal } = {}) {
  const formulario = new FormData();
  formulario.append("file", arquivo);

  const resposta = await apiFetch(ENDPOINT(usuarioId), {
    method: "PUT",
    body: formulario,
    signal,
  });

  if (!resposta.ok) {
    const kind =
      resposta.status === 403
        ? ApiErrorKind.FORBIDDEN
        : resposta.status === 404
          ? ApiErrorKind.NOT_FOUND
          : resposta.status >= 500
            ? ApiErrorKind.SERVER
            : ApiErrorKind.UNKNOWN;
    throw new ApiError(kind, resposta.status);
  }

  return resposta.json();
}
