import { TIMEOUT_MS, requestBaseUrl } from "./api";

export const ResultadoToken = Object.freeze({
  SUCESSO: "sucesso",
  INVALIDO: "invalido",
  INDISPONIVEL: "indisponivel",
  FALHA: "falha",
});

const STATUS_INVALIDO = new Set([400, 401, 403, 404, 422]);
const STATUS_INDISPONIVEL = new Set([409, 410]);

/**
 * Fluxo público do supervisor. O tokenId da URL é a própria credencial: a
 * requisição não anexa Bearer nem cookies, o valor nunca é persistido nem
 * registrado, e a resposta não é lida (a API não documenta corpo de retorno).
 */
export async function confirmarFolhaPontoPorToken(tokenId) {
  if (typeof tokenId !== "string" || tokenId.trim() === "") {
    return ResultadoToken.INVALIDO;
  }

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  let resposta;
  try {
    resposta = await fetch(
      `${requestBaseUrl}/folha-ponto/tokens/${encodeURIComponent(tokenId)}/confirmar`,
      { method: "POST", credentials: "omit", signal: controlador.signal }
    );
  } catch {
    return ResultadoToken.FALHA;
  } finally {
    clearTimeout(temporizador);
  }

  if (resposta.ok) return ResultadoToken.SUCESSO;
  if (STATUS_INVALIDO.has(resposta.status)) return ResultadoToken.INVALIDO;
  if (STATUS_INDISPONIVEL.has(resposta.status)) return ResultadoToken.INDISPONIVEL;

  return ResultadoToken.FALHA;
}

export const MENSAGENS_TOKEN = new Map([
  [
    ResultadoToken.SUCESSO,
    "Ação confirmada com sucesso. Você já pode fechar esta página.",
  ],
  [
    ResultadoToken.INVALIDO,
    "Este link de confirmação não é válido. Solicite um novo link ao CIEC.",
  ],
  [
    ResultadoToken.INDISPONIVEL,
    "Este link já foi utilizado ou expirou. Nenhuma nova ação é necessária.",
  ],
  [
    ResultadoToken.FALHA,
    "Não foi possível concluir a confirmação agora. Tente novamente mais tarde.",
  ],
]);
