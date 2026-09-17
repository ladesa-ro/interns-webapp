import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../test/apiMock";
import AvaliarEmpresa from "./AvaliarEmpresa";

const mockEmpresa = {
  id: "00000000-0000-0000-0000-000000000000",
  razaoSocial: "Empresa Teste SA",
  nomeFantasia: "Empresa Teste",
};

function renderizar(initialPath = "/aluno/avaliar/00000000-0000-0000-0000-000000000000") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/aluno/avaliar/:empresaId" element={<AvaliarEmpresa />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AvaliarEmpresa", () => {
  it("mostra loading e busca os dados da empresa na montagem", async () => {
    const { chamadas } = instalarFetch({
      "/empresas/00000000-0000-0000-0000-000000000000": () => ({ status: 200, body: mockEmpresa }),
    });

    renderizar();

    expect(screen.getByRole("status", { name: /Carregando dados/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: /Carregando dados/i })).not.toBeInTheDocument();
    });

    expect(screen.getByText("Empresa Teste")).toBeInTheDocument();
    
    // Verifica a chamada da api
    const chamada = chamadas.find((c) => String(c.url).includes("/empresas/00000000-0000-0000-0000-000000000000"));
    expect(chamada).toBeDefined();
  });

  it("exibe mensagem de erro se a empresa não for encontrada (404)", async () => {
    instalarFetch({
      "/empresas/00000000-0000-0000-0000-000000000000": () => ({ status: 404, body: {} }),
    });

    renderizar();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/Recurso não encontrado/i);
    });
  });

  it("envia a avaliação com sucesso e bloqueia o formulário", async () => {
    const { chamadas } = instalarFetch({
      "/empresas/00000000-0000-0000-0000-000000000000": () => ({ status: 200, body: mockEmpresa }),
      "/empresas/00000000-0000-0000-0000-000000000000/avaliacoes": () => ({ status: 201, body: { id: "aval-1" } }),
    });

    const user = userEvent.setup();
    renderizar();

    await waitFor(() => {
      expect(screen.getByText("Empresa Teste")).toBeInTheDocument();
    });

    // Simulando o StarRating: pegando o radio button com value 5
    const estrela = screen.getAllByRole("radio")[4];
    await user.click(estrela);

    const comentarioInput = screen.getByLabelText(/O que você achou/i);
    await user.type(comentarioInput, "Ótima empresa!");

    const enviarBtn = screen.getByRole("button", { name: /Enviar avaliação/i });
    await user.click(enviarBtn);

    // Mensagem de sucesso
    expect(await screen.findByRole("status")).toHaveTextContent(/enviada com sucesso/i);

    // Verifica se os campos foram bloqueados (readonly) ou desabilitados
    expect(comentarioInput).toBeDisabled();
    expect(enviarBtn).toBeDisabled();

    // Verifica o payload que foi enviado
    const chamadaPost = chamadas.find((c) => String(c.url).includes("/avaliacoes"));
    expect(chamadaPost.options.method).toBe("POST");
    expect(JSON.parse(chamadaPost.options.body)).toEqual({
      rating: 5,
      comentario: "Ótima empresa!"
    });
  });

  it("não envia se o rating for 0", async () => {
    instalarFetch({
      "/empresas/00000000-0000-0000-0000-000000000000": () => ({ status: 200, body: mockEmpresa }),
    });

    renderizar();

    await waitFor(() => {
      expect(screen.getByText("Empresa Teste")).toBeInTheDocument();
    });

    const enviarBtn = screen.getByRole("button", { name: /Enviar avaliação/i });
    
    // O botão deve iniciar desabilitado se o rating for 0
    expect(enviarBtn).toBeDisabled();
  });
});
