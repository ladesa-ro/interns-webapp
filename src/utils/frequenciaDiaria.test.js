import { describe, expect, it } from "vitest";
import { registrarFrequenciaDiaria } from "./folhaPontoApi";

// Teste 7 — Frequência diária
// O stub deve lançar erro imediatamente quando chamado.
// Isso garante que nenhum elemento da UI pode chamar essa função
// sem que o aluno receba uma falha explícita — jamais uma confirmação falsa.
//
// O endpoint POST /estagios/{estagioId}/frequencia NÃO existe na API atual
// (confirmado por inspeção do openapi.v3.json: nenhum path contém 'frequencia').
// Evidência: curl https://dev.ladesa.com.br/api/v1/docs/openapi.v3.json | python3 -c
//   "import json,sys; spec=json.load(sys.stdin); print([p for p in spec['paths'] if 'frequencia' in p])"
// Resultado: []

describe("registrarFrequenciaDiaria (stub — endpoint ausente na API)", () => {
  it("lança erro imediatamente ao ser chamado, sem fazer chamada de rede", async () => {
    // Não instala mock de fetch: se a função tentar fazer uma chamada HTTP,
    // o fetch padrão do ambiente de teste lançaria TypeError de rede — mas o stub
    // deve lançar ANTES de chegar ao fetch.
    await expect(
      registrarFrequenciaDiaria("estagio-id-qualquer", {
        data: "2026-09-09",
        status: "PRESENTE",
      })
    ).rejects.toThrow("A API ainda não publicou o endpoint de frequência diária.");
  });

  it("não aceita ser chamado silenciosamente — sempre rejeita a Promise", async () => {
    const resultado = registrarFrequenciaDiaria("x", { data: "2026-01-01", status: "AUSENTE" });
    await expect(resultado).rejects.toBeInstanceOf(Error);
  });
});
