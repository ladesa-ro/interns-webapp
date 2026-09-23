import { describe, expect, it, vi } from "vitest";

import { ApiError } from "./api";
import { atualizarImagemPerfil, buscarImagemPerfilUrl } from "./imagemPerfilApi";

const ORIGINAL_CREATE_OBJECT_URL = URL.createObjectURL;
const ORIGINAL_REVOKE_OBJECT_URL = URL.revokeObjectURL;

function instalarFetchBinario(handler) {
  const fake = vi.fn(handler);
  vi.stubGlobal("fetch", fake);
  return fake;
}

describe("buscarImagemPerfilUrl", () => {
  it("retorna null sem chamar a API quando não há usuarioId", async () => {
    const fake = instalarFetchBinario(async () => ({ ok: true, status: 200 }));
    await expect(buscarImagemPerfilUrl("")).resolves.toBeNull();
    expect(fake).not.toHaveBeenCalled();
  });

  it("converte a resposta binária em URL local", async () => {
    URL.createObjectURL = vi.fn(() => "blob:foto-teste");
    const blob = new Blob(["foto"], { type: "image/png" });
    instalarFetchBinario(async () => ({ ok: true, status: 200, blob: async () => blob }));

    const url = await buscarImagemPerfilUrl("user-1");

    expect(url).toBe("blob:foto-teste");
    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    URL.createObjectURL = ORIGINAL_CREATE_OBJECT_URL;
  });

  it("retorna null quando o usuário não possui foto (404)", async () => {
    instalarFetchBinario(async () => ({ ok: false, status: 404 }));
    await expect(buscarImagemPerfilUrl("user-1")).resolves.toBeNull();
  });

  it("propaga erro para outros status", async () => {
    instalarFetchBinario(async () => ({ ok: false, status: 403 }));
    await expect(buscarImagemPerfilUrl("user-1")).rejects.toBeInstanceOf(ApiError);
  });

  URL.revokeObjectURL = ORIGINAL_REVOKE_OBJECT_URL;
});

describe("atualizarImagemPerfil", () => {
  it("envia multipart/form-data com o campo file documentado", async () => {
    const fake = instalarFetchBinario(async () => ({ ok: true, status: 200, json: async () => true }));
    const arquivo = new File(["conteudo"], "foto.png", { type: "image/png" });

    const resultado = await atualizarImagemPerfil("user-1", arquivo);

    expect(resultado).toBe(true);
    const [url, opcoes] = fake.mock.calls[0];
    expect(String(url)).toContain("/usuarios/user-1/imagem/perfil");
    expect(opcoes.method).toBe("PUT");
    expect(opcoes.body).toBeInstanceOf(FormData);
    expect(opcoes.body.get("file")).toBe(arquivo);
  });

  it("propaga erro quando o envio falha", async () => {
    instalarFetchBinario(async () => ({ ok: false, status: 403 }));
    const arquivo = new File(["conteudo"], "foto.png", { type: "image/png" });

    await expect(atualizarImagemPerfil("user-1", arquivo)).rejects.toBeInstanceOf(ApiError);
  });
});
