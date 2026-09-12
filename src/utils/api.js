const BASE_URL = import.meta.env.VITE_API_URL;
const REQUEST_BASE_URL = import.meta.env.DEV ? "/api/v1" : BASE_URL;

if (!BASE_URL) {
  throw new Error(
    "VITE_API_URL não definida. Copie .env.example para .env e configure."
  );
}

// "bearer": token em memória no header Authorization (contrato atual da API).
// "cookie": sessão via cookie httpOnly; exige backend emitindo Set-Cookie e
// Access-Control-Allow-Credentials com origem explícita (hoje a API responde "*").
const AUTH_MODE = import.meta.env.VITE_AUTH_MODE === "cookie" ? "cookie" : "bearer";

export const authMode = AUTH_MODE;

// Exposta para fluxos públicos que não podem passar pelo apiFetch autenticado.
export const requestBaseUrl = REQUEST_BASE_URL;

export const ApiErrorKind = {
  NETWORK: "network",
  TIMEOUT: "timeout",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  INVALID_CREDENTIALS: "invalid_credentials",
  NOT_FOUND: "not_found",
  SERVER: "server",
  UNKNOWN: "unknown",
};

// fetch nao expira sozinho: sem isto uma requisicao pendurada deixaria a
// interface em carregamento indefinido.
export const TIMEOUT_MS = 15000;

const MENSAGENS = new Map([
  [ApiErrorKind.NETWORK, "Não foi possível conectar ao servidor. Verifique sua conexão."],
  [ApiErrorKind.TIMEOUT, "O servidor demorou demais para responder. Tente novamente."],
  [ApiErrorKind.UNAUTHORIZED, "Sua sessão expirou. Faça login novamente."],
  [ApiErrorKind.FORBIDDEN, "Você não tem permissão para acessar este recurso."],
  [ApiErrorKind.INVALID_CREDENTIALS, "Matrícula ou senha inválidos."],
  [ApiErrorKind.NOT_FOUND, "Recurso não encontrado."],
  [ApiErrorKind.SERVER, "O servidor apresentou um erro. Tente novamente mais tarde."],
  [ApiErrorKind.UNKNOWN, "Não foi possível concluir a operação."],
]);

export class ApiError extends Error {
  constructor(kind, status = null) {
    super(MENSAGENS.get(kind) ?? MENSAGENS.get(ApiErrorKind.UNKNOWN));
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function kindFromStatus(status) {
  if (status === 401) return ApiErrorKind.UNAUTHORIZED;
  if (status === 403) return ApiErrorKind.FORBIDDEN;
  if (status === 404) return ApiErrorKind.NOT_FOUND;
  if (status >= 500) return ApiErrorKind.SERVER;
  return ApiErrorKind.UNKNOWN;
}

// Token mantido apenas em memória: nunca em localStorage/sessionStorage.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token ?? null;
}

let onUnauthorized = null;

// O contexto de autenticação registra aqui o encerramento de sessão. A navegação
// fica a cargo do roteador, evitando loop de redirecionamento.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function getCsrfToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}

function isAuthEndpoint(url) {
  return url.includes("/autenticacao/login");
}

// A API retorna 403 com "Credenciais inválidas." quando a matrícula/senha estão
// errados. Traduzimos para INVALID_CREDENTIALS apenas no endpoint de login para
// que endpoints protegidos continuem recebendo FORBIDDEN.
function kindFromStatusForEndpoint(status, url) {
  if (status === 403 && isAuthEndpoint(url)) return ApiErrorKind.INVALID_CREDENTIALS;
  return kindFromStatus(status);
}

async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${REQUEST_BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const method = (options.method || "GET").toLowerCase();
  const ehMutacao = ["post", "put", "patch", "delete"].includes(method);

  if (AUTH_MODE === "bearer") {
    if (accessToken && !isAuthEndpoint(url)) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  } else {
    const csrfToken = getCsrfToken();
    if (csrfToken && ehMutacao) {
      headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
    }
  }

  let response;
  const controller = new AbortController();
  const temporizador = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: AUTH_MODE === "cookie" ? "include" : "omit",
      signal: options.signal ?? controller.signal,
    });
  } catch (erro) {
    if (erro?.name === "AbortError" && !options.signal) {
      throw new ApiError(ApiErrorKind.TIMEOUT);
    }
    throw new ApiError(ApiErrorKind.NETWORK);
  } finally {
    clearTimeout(temporizador);
  }

  if (response.status === 401 && !isAuthEndpoint(url)) {
    setAccessToken(null);
    onUnauthorized?.();
    throw new ApiError(ApiErrorKind.UNAUTHORIZED, 401);
  }

  return response;
}

export async function apiJson(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options);

  if (!response.ok) {
    if (response.status === 422) {
      try {
        const body = await response.json();
        const msg = body.message || body.mensagem || "Dados inválidos";
        const error = new ApiError(ApiErrorKind.UNKNOWN, response.status);
        error.message = msg;
        throw error;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        // Ignore JSON parse error, fallback to default behavior
      }
    }
    throw new ApiError(kindFromStatusForEndpoint(response.status, endpoint), response.status);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError(ApiErrorKind.UNKNOWN, response.status);
  }
}

export function mensagemDeErro(error) {
  return error instanceof ApiError
    ? error.message
    : MENSAGENS.get(ApiErrorKind.UNKNOWN);
}

export default apiFetch;
