import { describe, expect, it, vi } from "vitest";

import {
  ResultadoToken,
  confirmarFolhaPontoPorToken,
} from "./folhaPontoTokenApi";

const TOKEN = "token-de-teste-nao-sensivel";

function instalarResposta(status) {
  const fake = vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
  }));
  vi.stubGlobal("fetch", fake);
  return fake;
}

describe("confirmarFolhaPontoPorToken", () => {
  it("rejeita token ausente sem chamar a API", async () => {
    const fake = instalarResposta(200);

    await expect(confirmarFolhaPontoPorToken("")).resolves.toBe(ResultadoToken.INVALIDO);
    await expect(confirmarFolhaPontoPorToken(undefined)).resolves.toBe(ResultadoToken.INVALIDO);
    expect(fake).not.toHaveBeenCalled();
  });

  it("confirma via POST no endpoint documentado, sem Bearer nem cookies", async () => {
    const fake = instalarResposta(200);

    const resultado = await confirmarFolhaPontoPorToken(TOKEN);

    expect(resultado).toBe(ResultadoToken.SUCESSO);
    const [url, opcoes] = fake.mock.calls[0];
    expect(String(url)).toContain(`/folha-ponto/tokens/${TOKEN}/confirmar`);
    expect(opcoes.method).toBe("POST");
    expect(opcoes.credentials).toBe("omit");
    expect(opcoes.headers?.Authorization).toBeUndefined();
    expect(opcoes.body).toBeUndefined();
  });

  it("não lê o corpo da resposta de sucesso", async () => {
    const json = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json })));

    await confirmarFolhaPontoPorToken(TOKEN);

    expect(json).not.toHaveBeenCalled();
  });

  it("não repete a requisição automaticamente", async () => {
    const fake = instalarResposta(500);

    await confirmarFolhaPontoPorToken(TOKEN);

    expect(fake).toHaveBeenCalledTimes(1);
  });

  it.each([400, 401, 403, 404, 422])("trata %i como token inválido", async (status) => {
    instalarResposta(status);
    await expect(confirmarFolhaPontoPorToken(TOKEN)).resolves.toBe(ResultadoToken.INVALIDO);
  });

  it.each([409, 410])("trata %i como token expirado ou já utilizado", async (status) => {
    instalarResposta(status);
    await expect(confirmarFolhaPontoPorToken(TOKEN)).resolves.toBe(
      ResultadoToken.INDISPONIVEL
    );
  });

  it("trata falha de rede sem expor detalhes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("failed to fetch");
    }));

    await expect(confirmarFolhaPontoPorToken(TOKEN)).resolves.toBe(ResultadoToken.FALHA);
  });

  it("não registra o token em console", async () => {
    instalarResposta(404);
    const registros = [];
    ["log", "info", "warn", "error", "debug"].forEach((nivel) => {
      vi.spyOn(console, nivel).mockImplementation((...args) => registros.push(args));
    });

    await confirmarFolhaPontoPorToken(TOKEN);

    expect(JSON.stringify(registros)).not.toContain(TOKEN);
  });
});
