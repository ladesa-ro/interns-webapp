import { afterEach, describe, expect, it, vi } from "vitest";
import apiFetch, {
  ApiError,
  ApiErrorKind,
  apiJson,
  authMode,
  setAccessToken,
  setUnauthorizedHandler,
} from "./api";

function respostaFalsa(status, body = {}) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

afterEach(() => {
  setAccessToken(null);
  setUnauthorizedHandler(null);
});

describe("apiFetch", () => {
  it("opera em modo bearer por padrão", () => {
    expect(authMode).toBe("bearer");
  });

  it("não envia credenciais de cookie no modo bearer", async () => {
    const fake = vi.fn(async () => respostaFalsa(200));
    vi.stubGlobal("fetch", fake);

    await apiFetch("/empresas");

    expect(fake.mock.calls[0][1].credentials).toBe("omit");
  });

  it("não envia header CSRF no modo bearer", async () => {
    const fake = vi.fn(async () => respostaFalsa(200));
    vi.stubGlobal("fetch", fake);
    document.cookie = "csrf_token=valor-de-teste";

    await apiFetch("/empresas", { method: "POST", body: "{}" });

    expect(fake.mock.calls[0][1].headers["X-CSRF-Token"]).toBeUndefined();
  });

  it("não anexa Authorization no endpoint de login", async () => {
    const fake = vi.fn(async () => respostaFalsa(201));
    vi.stubGlobal("fetch", fake);
    setAccessToken("token-de-teste");

    await apiFetch("/autenticacao/login", { method: "POST", body: "{}" });

    expect(fake.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("classifica falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }));

    await expect(apiFetch("/empresas")).rejects.toMatchObject({
      kind: ApiErrorKind.NETWORK,
    });
  });

  it("classifica timeout separadamente de falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      const erro = new Error("abortado");
      erro.name = "AbortError";
      throw erro;
    }));

    await expect(apiFetch("/empresas")).rejects.toMatchObject({
      kind: ApiErrorKind.TIMEOUT,
    });
  });

  it("encerra a sessão e notifica quando recebe 401", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(401)));
    const aoExpirar = vi.fn();
    setUnauthorizedHandler(aoExpirar);
    setAccessToken("token-de-teste");

    await expect(apiFetch("/empresas")).rejects.toBeInstanceOf(ApiError);
    expect(aoExpirar).toHaveBeenCalledOnce();
  });

  it("não dispara o encerramento de sessão em 401 do login", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(401)));
    const aoExpirar = vi.fn();
    setUnauthorizedHandler(aoExpirar);

    const resposta = await apiFetch("/autenticacao/login", { method: "POST" });

    expect(resposta.status).toBe(401);
    expect(aoExpirar).not.toHaveBeenCalled();
  });
});

describe("apiJson", () => {
  it.each([
    [403, ApiErrorKind.FORBIDDEN],
    [404, ApiErrorKind.NOT_FOUND],
    [500, ApiErrorKind.SERVER],
    [418, ApiErrorKind.UNKNOWN],
  ])("classifica HTTP %i", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(status)));

    await expect(apiJson("/empresas")).rejects.toMatchObject({ kind });
  });

  it("não repassa a mensagem interna do backend", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(500, {
      message: "SequelizeDatabaseError: coluna secreta",
    })));

    await expect(apiJson("/empresas")).rejects.toThrow(
      "O servidor apresentou um erro. Tente novamente mais tarde."
    );
  });

  it("retorna null em 204", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaFalsa(204)));

    await expect(apiJson("/empresas")).resolves.toBeNull();
  });
});
