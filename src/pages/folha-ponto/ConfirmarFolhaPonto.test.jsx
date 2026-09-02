import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ConfirmarFolhaPonto from "./ConfirmarFolhaPonto";

const TOKEN = "token-de-teste-nao-sensivel";

function renderizar(rota) {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/folha-ponto/confirmar/:tokenId" element={<ConfirmarFolhaPonto />} />
        <Route path="/folha-ponto/confirmar" element={<ConfirmarFolhaPonto />} />
      </Routes>
    </MemoryRouter>
  );
}

function instalarResposta(status) {
  const fake = vi.fn(async () => ({ ok: status >= 200 && status < 300, status }));
  vi.stubGlobal("fetch", fake);
  return fake;
}

describe("ConfirmarFolhaPonto", () => {
  it("exige ação explícita: não confirma ao carregar a página", async () => {
    const fake = instalarResposta(200);

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);

    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
    expect(fake).not.toHaveBeenCalled();
  });

  it("confirma e mostra sucesso, sem permitir repetir a ação", async () => {
    const fake = instalarResposta(200);
    const usuario = userEvent.setup();

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByText(/confirmada com sucesso/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    expect(fake).toHaveBeenCalledTimes(1);
  });

  it("informa token inválido sem revelar o token na tela", async () => {
    instalarResposta(404);
    const usuario = userEvent.setup();

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByText(/não é válido/i)).toBeInTheDocument();
    expect(document.body.textContent).not.toContain(TOKEN);
  });

  it("informa token expirado ou já utilizado", async () => {
    instalarResposta(410);
    const usuario = userEvent.setup();

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByText(/já foi utilizado ou expirou/i)).toBeInTheDocument();
  });

  it("não tenta novamente sozinho após falha do servidor", async () => {
    const fake = instalarResposta(500);
    const usuario = userEvent.setup();

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);
    await usuario.click(screen.getByRole("button", { name: "Confirmar" }));

    await screen.findByText(/não foi possível concluir/i);
    await waitFor(() => expect(fake).toHaveBeenCalledTimes(1));
  });

  it("trata link sem token", () => {
    const fake = instalarResposta(200);

    renderizar("/folha-ponto/confirmar");

    expect(screen.getByText(/link de confirmação incompleto/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
    expect(fake).not.toHaveBeenCalled();
  });

  it("é operável pelo teclado", async () => {
    const fake = instalarResposta(200);
    const usuario = userEvent.setup();

    renderizar(`/folha-ponto/confirmar/${TOKEN}`);

    await usuario.tab();
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveFocus();

    await usuario.keyboard("{Enter}");
    await waitFor(() => expect(fake).toHaveBeenCalledTimes(1));
  });
});
