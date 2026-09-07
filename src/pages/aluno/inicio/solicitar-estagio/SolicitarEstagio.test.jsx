import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../../../test/apiMock";
import SolicitarEstagio from "./SolicitarEstagio";

const vagaSelecionada = {
  id: "est-1",
  empresa: { nomeFantasia: "Empresa Teste" },
  campus: { nomeFantasia: "Campus Teste" },
  curso: { nome: "Informática" },
  cargaHoraria: 20,
  supervisor: "Supervisor Teste",
  emailSupervisor: "supervisor@example.test",
  telefoneSupervisor: "69000000000",
};

function renderizar(state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/aluno/solicitar-estagio", state }]}>
      <Routes>
        <Route path="/aluno/solicitar-estagio" element={<SolicitarEstagio />} />
        <Route path="/aluno/vagas-disponiveis" element={<p>Vagas</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SolicitarEstagio", () => {
  it("apresenta a seleção de vagas para estágio externo", () => {
    renderizar();

    expect(screen.getByRole("button", { name: "Candidatar-se a uma vaga" })).toBeInTheDocument();
    expect(screen.getByText(/informe uma nova empresa para análise/i)).toBeInTheDocument();
  });

  it("pré-preenche dados vindos de uma vaga selecionada", () => {
    instalarFetch({ "/minhas-solicitacoes": () => ({ status: 200, body: [] }) });
    renderizar({ vagaSelecionada });

    expect(screen.getByText(/dados retornados da vaga/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Razão social/)).toHaveValue("Empresa Teste");
    expect(screen.getByLabelText(/^Nome do supervisor/)).toHaveValue("Supervisor Teste");
  });

  it("candidata o aluno na vaga pré-selecionada", async () => {
    const { chamadas } = instalarFetch({
      "/minhas-solicitacoes": () => ({ status: 200, body: [] }),
      "/estagios/est-1/candidaturas": () => ({ status: 201, body: { id: "cand-1" } }),
    });
    const usuario = userEvent.setup();
    renderizar({ vagaSelecionada });

    await usuario.click(screen.getByRole("button", { name: "Candidatar-se nesta vaga" }));

    await waitFor(() => expect(
      chamadas.some((item) => String(item.url).includes("/candidaturas"))
    ).toBe(true));
    const chamada = chamadas.find((item) => String(item.url).includes("/candidaturas"));
    expect(chamada.options.method).toBe("POST");
    expect(chamada.options.body).toBeUndefined();
    expect(await screen.findByText(/candidatura enviada/i)).toBeInTheDocument();
  });

  it("mostra a solicitação interna como pendente de contrato de API", async () => {
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole("button", { name: "Estágio interno" }));

    expect(screen.getByText(/depende do contrato de API/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Professor conselheiro")).toBeDisabled();
  });

  it("envia uma solicitação externa com o DTO documentado", async () => {
    const { chamadas } = instalarFetch({
      "/solicitacoes-estagio/externo": () => ({ status: 201, body: { id: "sol-1" } }),
      "/minhas-solicitacoes": () => ({ status: 200, body: [] }),
    });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.type(screen.getByLabelText(/^Razão social/), "Empresa Teste LTDA");
    await usuario.type(screen.getByLabelText(/^CNPJ/), "12345678000195");
    await usuario.type(screen.getByLabelText(/^Nome do supervisor/), "Maria Teste");
    await usuario.click(screen.getByRole("button", { name: /enviar solicitação externa/i }));

    expect(await screen.findByText(/enviada para análise do CIEC/i)).toBeInTheDocument();
    const chamadaEnvio = chamadas.find((chamada) => (
      String(chamada.url).includes("/solicitacoes-estagio/externo")
    ));
    const corpo = JSON.parse(chamadaEnvio.options.body);
    expect(corpo).toEqual({
      empresa: { razaoSocial: "Empresa Teste LTDA", cnpj: "12345678000195" },
      supervisor: { nome: "Maria Teste" },
    });
  });
});
