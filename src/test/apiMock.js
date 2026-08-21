import { vi } from "vitest";

export const SESSAO_ANONIMA = { usuario: null, perfisAtivos: [] };

export function sessaoAluno() {
  return {
    usuario: { id: "u-aluno", nome: "Aluno Teste", matricula: "2025102020039" },
    perfisAtivos: [{ ativo: true, cargo: "aluno" }],
  };
}

export function sessaoAdmin() {
  return {
    usuario: { id: "u-admin", nome: "Servidor Teste", matricula: "1234567" },
    perfisAtivos: [{ ativo: true, cargo: "dape" }],
  };
}

export function sessaoSemPapel() {
  return {
    usuario: { id: "u-sem-papel", nome: "Sem Papel" },
    perfisAtivos: [{ ativo: true, cargo: "" }],
  };
}

function resposta(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

/**
 * Instala um fetch falso roteando por trecho da URL.
 * routes: { "/autenticacao/quem-sou-eu": () => ({ status, body }) }
 */
export function instalarFetch(routes) {
  const chamadas = [];

  const fake = vi.fn(async (url, options = {}) => {
    chamadas.push({ url, options });

    const entrada = Object.entries(routes).find(([rota]) => String(url).includes(rota));

    if (!entrada) {
      return resposta(404, { mensagem: "rota não mapeada no teste" });
    }

    const resultado = await entrada[1]({ url, options });
    return resposta(resultado.status ?? 200, resultado.body ?? null);
  });

  vi.stubGlobal("fetch", fake);

  return { chamadas, fake };
}
