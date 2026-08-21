import { describe, expect, it } from "vitest";
import {
  ERRO_PERFIL_INDEFINIDO,
  PERFIL_ADMIN,
  PERFIL_ALUNO,
  determinarPerfil,
} from "./perfis";

describe("determinarPerfil", () => {
  it("reconhece aluno pelo cargo do vínculo ativo", () => {
    const r = determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "aluno" }]);
    expect(r).toEqual({ perfil: PERFIL_ALUNO, erro: null });
  });

  it("reconhece cargos administrativos", () => {
    expect(determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "dape" }]).perfil).toBe(PERFIL_ADMIN);
    expect(determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "professor" }]).perfil).toBe(PERFIL_ADMIN);
  });

  it("trata isSuperUser como administrador", () => {
    expect(determinarPerfil({ id: "1", isSuperUser: true }, []).perfil).toBe(PERFIL_ADMIN);
  });

  it("nega acesso quando não há cargo", () => {
    const r = determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "" }]);
    expect(r.perfil).toBeNull();
    expect(r.erro).toBe(ERRO_PERFIL_INDEFINIDO);
  });

  it("nega acesso para cargo desconhecido, sem cair em admin", () => {
    const r = determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "cargo-inexistente" }]);
    expect(r.perfil).toBeNull();
  });

  it("ignora vínculos inativos", () => {
    const r = determinarPerfil({ id: "1" }, [{ ativo: false, cargo: "dape" }]);
    expect(r.perfil).toBeNull();
  });

  it("nega acesso quando perfisAtivos é ausente ou inválido", () => {
    expect(determinarPerfil({ id: "1" }, undefined).perfil).toBeNull();
    expect(determinarPerfil({ id: "1" }, null).perfil).toBeNull();
    expect(determinarPerfil({ id: "1" }, "aluno").perfil).toBeNull();
  });

  it("prioriza cargo administrativo quando há múltiplos vínculos", () => {
    const r = determinarPerfil({ id: "1" }, [
      { ativo: true, cargo: "aluno" },
      { ativo: true, cargo: "dape" },
    ]);
    expect(r.perfil).toBe(PERFIL_ADMIN);
  });

  it("normaliza espaços e caixa do cargo", () => {
    expect(determinarPerfil({ id: "1" }, [{ ativo: true, cargo: "  ALUNO " }]).perfil).toBe(PERFIL_ALUNO);
  });
});
