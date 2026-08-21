import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { setAccessToken } from "../utils/api";
import {
  SESSAO_ANONIMA,
  instalarFetch,
  sessaoAdmin,
  sessaoAluno,
} from "../test/apiMock";

function Sonda() {
  const { carregando, autenticado, perfil, usuario, login, logout } = useAuth();

  if (carregando) return <p>carregando</p>;

  return (
    <div>
      <p data-testid="estado">{autenticado ? "autenticado" : "anonimo"}</p>
      <p data-testid="perfil">{perfil ?? "sem-perfil"}</p>
      <p data-testid="nome">{usuario?.nome ?? "-"}</p>
      <button type="button" onClick={() => login("2025102020039", "segredo-de-teste")}>
        entrar
      </button>
      <button type="button" onClick={() => logout()}>
        sair
      </button>
    </div>
  );
}

function montar() {
  return render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  );
}

beforeEach(() => {
  setAccessToken(null);
  localStorage.clear();
  sessionStorage.clear();
});

describe("AuthContext", () => {
  it("trata usuario null como sessão anônima, mesmo com HTTP 200", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: SESSAO_ANONIMA }) });
    montar();

    expect(await screen.findByTestId("estado")).toHaveTextContent("anonimo");
    expect(screen.getByTestId("perfil")).toHaveTextContent("sem-perfil");
  });

  it("consulta a sessão uma única vez na inicialização", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: SESSAO_ANONIMA }),
    });
    montar();

    await screen.findByTestId("estado");

    const consultas = chamadas.filter((c) => String(c.url).includes("quem-sou-eu"));
    expect(consultas).toHaveLength(1);
  });

  it("restaura a sessão existente ao montar, simulando reload", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAdmin() }) });
    montar();

    expect(await screen.findByTestId("estado")).toHaveTextContent("autenticado");
    expect(screen.getByTestId("perfil")).toHaveTextContent("admin");
    expect(screen.getByTestId("nome")).toHaveTextContent("Servidor Teste");
  });

  it("faz login e passa a refletir o perfil retornado pela sessão", async () => {
    let autenticada = false;

    instalarFetch({
      "/autenticacao/login": () => {
        autenticada = true;
        return { status: 201, body: { access_token: "token-de-teste" } };
      },
      "/autenticacao/quem-sou-eu": () => ({
        status: 200,
        body: autenticada ? sessaoAluno() : SESSAO_ANONIMA,
      }),
    });

    montar();
    await screen.findByTestId("estado");

    await userEvent.click(screen.getByRole("button", { name: "entrar" }));

    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));
    expect(screen.getByTestId("perfil")).toHaveTextContent("aluno");
  });

  it("não persiste token em localStorage nem sessionStorage", async () => {
    instalarFetch({
      "/autenticacao/login": () => ({ status: 201, body: { access_token: "token-de-teste" } }),
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAluno() }),
    });

    montar();
    await screen.findByTestId("estado");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));

    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(JSON.stringify(localStorage)).not.toContain("token-de-teste");
  });

  it("envia o token no header Authorization sem gravá-lo no navegador", async () => {
    const { chamadas } = instalarFetch({
      "/autenticacao/login": () => ({ status: 201, body: { access_token: "token-de-teste" } }),
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAluno() }),
    });

    montar();
    await screen.findByTestId("estado");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));

    const comAuth = chamadas.filter((c) => c.options?.headers?.Authorization);
    expect(comAuth.length).toBeGreaterThan(0);
    expect(comAuth.at(-1).options.headers.Authorization).toBe("Bearer token-de-teste");

    const login = chamadas.find((c) => String(c.url).includes("/autenticacao/login"));
    expect(login.options?.headers?.Authorization).toBeUndefined();
  });

  it("logout limpa o estado local", async () => {
    instalarFetch({
      "/autenticacao/login": () => ({ status: 201, body: { access_token: "token-de-teste" } }),
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAluno() }),
    });

    montar();
    await screen.findByTestId("estado");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));

    await userEvent.click(screen.getByRole("button", { name: "sair" }));

    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("anonimo"));
    expect(screen.getByTestId("perfil")).toHaveTextContent("sem-perfil");
  });

  it("encerra a sessão quando a API responde 401, sem navegar diretamente", async () => {
    const hrefInicial = window.location.href;

    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 401, body: null }) });
    montar();

    expect(await screen.findByTestId("estado")).toHaveTextContent("anonimo");
    expect(window.location.href).toBe(hrefInicial);
  });

  it("mantém estado anônimo quando a rede falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );

    montar();

    expect(await screen.findByTestId("estado")).toHaveTextContent("anonimo");
  });
});
