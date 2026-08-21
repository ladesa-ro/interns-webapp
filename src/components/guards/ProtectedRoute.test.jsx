import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../../contexts/AuthContext";
import {
  SESSAO_ANONIMA,
  instalarFetch,
  sessaoAdmin,
  sessaoAluno,
  sessaoSemPapel,
} from "../../test/apiMock";

function montarEm(rotaInicial) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[rotaInicial]}>
        <Routes>
          <Route path="/login" element={<p>tela de login</p>} />
          <Route
            path="/aluno"
            element={
              <ProtectedRoute perfilNecessario="aluno">
                <p>area do aluno</p>
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute perfilNecessario="admin">
                <p>area administrativa</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe("ProtectedRoute", () => {
  it("redireciona usuário anônimo para o login", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: SESSAO_ANONIMA }) });
    montarEm("/");

    expect(await screen.findByText("tela de login")).toBeInTheDocument();
    expect(screen.queryByText("area administrativa")).not.toBeInTheDocument();
  });

  it("impede que aluno acesse a área administrativa", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAluno() }) });
    montarEm("/");

    expect(await screen.findByText("area do aluno")).toBeInTheDocument();
    expect(screen.queryByText("area administrativa")).not.toBeInTheDocument();
  });

  it("nega acesso administrativo a usuário sem papel explícito", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoSemPapel() }) });
    montarEm("/");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("area administrativa")).not.toBeInTheDocument();
    expect(screen.queryByText("area do aluno")).not.toBeInTheDocument();
  });

  it("permite acesso administrativo a perfil autorizado", async () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAdmin() }) });
    montarEm("/");

    expect(await screen.findByText("area administrativa")).toBeInTheDocument();
  });

  it("não renderiza conteúdo protegido antes de conhecer a sessão", () => {
    instalarFetch({ "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAdmin() }) });
    montarEm("/");

    expect(screen.queryByText("area administrativa")).not.toBeInTheDocument();
    expect(screen.queryByText("tela de login")).not.toBeInTheDocument();
  });
});
