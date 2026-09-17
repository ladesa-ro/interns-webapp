import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../../contexts/AuthContext";
import { setAccessToken } from "../../utils/api";
import { instalarFetch, sessaoAluno } from "../../test/apiMock";
import Perfil from "./Perfil";

const { buscarImagemPerfilUrlMock, atualizarImagemPerfilMock } = vi.hoisted(() => ({
  buscarImagemPerfilUrlMock: vi.fn(),
  atualizarImagemPerfilMock: vi.fn(),
}));

vi.mock("../../utils/imagemPerfilApi", () => ({
  buscarImagemPerfilUrl: buscarImagemPerfilUrlMock,
  atualizarImagemPerfil: atualizarImagemPerfilMock,
}));

function instalarSessaoEPerfil(rotas = {}) {
  return instalarFetch({
    "/autenticacao/quem-sou-eu": () => ({ status: 200, body: sessaoAluno() }),
    "/perfis": () => ({
      status: 200,
      body: {
        data: [{
          usuario: { id: "u-aluno", nome: "Aluno Teste", matricula: "2025102020039", email: "aluno@teste.com" },
          cargo: "aluno",
          campus: {},
        }],
      },
    }),
    ...rotas,
  });
}

function montar() {
  return render(
    <AuthProvider>
      <Perfil />
    </AuthProvider>
  );
}

beforeEach(() => {
  setAccessToken(null);
  buscarImagemPerfilUrlMock.mockReset();
  atualizarImagemPerfilMock.mockReset();
});

describe("Perfil (aluno) — foto de perfil", () => {
  it("mostra um indicador neutro quando o usuário não possui foto cadastrada", async () => {
    buscarImagemPerfilUrlMock.mockResolvedValue(null);
    instalarSessaoEPerfil();

    montar();

    expect(await screen.findByRole("img", { name: "Sem foto de perfil" })).toBeInTheDocument();
    expect(screen.queryByAltText("Foto de perfil")).not.toBeInTheDocument();
  });

  it("exibe a foto real retornada pela API", async () => {
    buscarImagemPerfilUrlMock.mockResolvedValue("blob:foto-real");
    instalarSessaoEPerfil();

    montar();

    const imagem = await screen.findByAltText("Foto de perfil");
    expect(imagem).toHaveAttribute("src", "blob:foto-real");
  });

  it("envia o arquivo selecionado e atualiza a foto exibida", async () => {
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:foto-nova");

    buscarImagemPerfilUrlMock.mockResolvedValueOnce(null);
    atualizarImagemPerfilMock.mockResolvedValue(true);
    instalarSessaoEPerfil();
    const usuario = userEvent.setup();

    montar();
    await screen.findByRole("img", { name: "Sem foto de perfil" });

    const arquivo = new File(["conteudo"], "foto.png", { type: "image/png" });
    await usuario.upload(screen.getByTestId("input-foto-perfil"), arquivo);

    await waitFor(() => expect(atualizarImagemPerfilMock).toHaveBeenCalledWith("u-aluno", arquivo));
    expect(URL.createObjectURL).toHaveBeenCalledWith(arquivo);
    expect(await screen.findByAltText("Foto de perfil")).toHaveAttribute("src", "blob:foto-nova");

    URL.createObjectURL = originalCreateObjectURL;
  });

  it("mostra mensagem de erro quando a foto não pode ser carregada", async () => {
    buscarImagemPerfilUrlMock.mockRejectedValue(new Error("falha de rede"));
    instalarSessaoEPerfil();

    montar();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
