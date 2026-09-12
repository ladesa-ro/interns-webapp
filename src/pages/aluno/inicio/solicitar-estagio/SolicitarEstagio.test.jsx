import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { instalarFetch } from "../../../../test/apiMock";
import SolicitarEstagio from "./SolicitarEstagio";

// Fixture única com campus + empresa preenchidos (como pode vir da API).
// O tipo do estágio NÃO é inferido pelo frontend — o aluno escolhe a aba.
// (ver ISSUE_BACKEND_ESTAGIO_FLUXOS.md §Revisão item 1)
const vagaSelecionada = {
  id: "est-1",
  empresa: { nomeFantasia: "Empresa Teste", razaoSocial: "Empresa Teste LTDA", cnpj: "12345678000195" },
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
  it("sem vaga selecionada, inicia na aba externo com aviso e botão para catálogo", () => {
    renderizar();

    // Aba externo ativa por padrão
    expect(screen.getByRole("button", { name: "Estágio externo", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Estágio interno", pressed: false })).toBeInTheDocument();

    // Aviso e atalho para catálogo
    expect(screen.getByRole("button", { name: "Candidatar-se a uma vaga" })).toBeInTheDocument();
    expect(screen.getByText(/informe uma nova empresa para análise/i)).toBeInTheDocument();
  });

  it("com vaga selecionada, exibe banner acima das abas e formulário externo pré-preenchido", () => {
    instalarFetch({ "/minhas-solicitacoes": () => ({ status: 200, body: [] }) });
    renderizar({ vagaSelecionada });

    // Banner independente de aba
    expect(screen.getByText(/dados disponíveis da vaga foram pré-preenchidos/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Candidatar-se nesta vaga" })).toBeInTheDocument();

    // Aba externo ainda é a padrão — aluno decide a modalidade
    expect(screen.getByRole("button", { name: "Estágio externo", pressed: true })).toBeInTheDocument();

    // Formulário externo pré-preenchido com dados da empresa/vaga
    expect(screen.getByLabelText(/^Razão social/)).toHaveValue("Empresa Teste LTDA");
    expect(screen.getByLabelText(/^Nome do supervisor/)).toHaveValue("Supervisor Teste");
  });

  it("ao navegar para aba interna, o banner de vaga permanece visível", async () => {
    instalarFetch({ "/minhas-solicitacoes": () => ({ status: 200, body: [] }) });
    const usuario = userEvent.setup();
    renderizar({ vagaSelecionada });

    await usuario.click(screen.getByRole("button", { name: "Estágio interno" }));

    // Banner ainda presente
    expect(screen.getByText(/dados disponíveis da vaga foram pré-preenchidos/i)).toBeInTheDocument();
    // Aba interna agora ativa
    expect(screen.getByRole("button", { name: "Estágio interno", pressed: true })).toBeInTheDocument();
    // Formulário interno visível
    expect(screen.getByLabelText(/Professor conselheiro/i)).toBeInTheDocument();
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
    expect(await screen.findByText(/candidatura enviada/i)).toBeInTheDocument();
  });

  it("envia solicitação interna com o DTO confirmado e exibe sucesso", async () => {
    // Schema confirmado em 12/09/2026: { professorConselheiro: { id: uuid }, local, descricao }
    const { chamadas } = instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: { perfisAtivos: [{ campus: { id: "camp-1" } }] } }),
      "/perfis": () => ({ status: 200, body: { data: [{ id: "prof-1", usuario: { nome: "Professora Teste" } }] } }),
      "/minhas-solicitacoes": () => ({ status: 200, body: [] }),
      "/solicitacoes-estagio/interno": () => ({ status: 201, body: { id: "sol-interno-1" } }),
    });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole("button", { name: "Estágio interno" }));

    expect(await screen.findByRole("option", { name: "Professora Teste" })).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText(/Professor conselheiro/i), "prof-1");
    await usuario.type(screen.getByLabelText(/Local do estágio/i), "Laboratório de Redes");
    await usuario.type(screen.getByLabelText(/Descrição/i), "Apoio em manutenção de equipamentos.");

    await usuario.click(screen.getByRole("button", { name: /enviar solicitação interna/i }));

    // Confirma mensagem de sucesso
    expect(await screen.findByText(/enviada para análise do CIEC/i)).toBeInTheDocument();

    // Confirma que o corpo enviado bate exatamente com o DTO documentado
    const chamadaEnvio = chamadas.find((c) => String(c.url).includes("/solicitacoes-estagio/interno"));
    expect(chamadaEnvio).toBeDefined();
    expect(chamadaEnvio.options.method).toBe("POST");
    const corpo = JSON.parse(chamadaEnvio.options.body);
    expect(corpo).toEqual({
      professorConselheiro: { id: "prof-1" },
      local: "Laboratório de Redes",
      descricao: "Apoio em manutenção de equipamentos.",
    });
  });

  it("exibe mensagem específica ao aluno quando API retorna 409 (limite de solicitações)", async () => {
    instalarFetch({
      "/autenticacao/quem-sou-eu": () => ({ status: 200, body: { perfisAtivos: [{ campus: { id: "camp-1" } }] } }),
      "/perfis": () => ({ status: 200, body: { data: [{ id: "prof-1", usuario: { nome: "Professora Teste" } }] } }),
      "/minhas-solicitacoes": () => ({ status: 200, body: [] }),
      "/solicitacoes-estagio/interno": () => ({ status: 409, body: { mensagem: "Limite atingido" } }),
    });
    const usuario = userEvent.setup();
    renderizar();

    await usuario.click(screen.getByRole("button", { name: "Estágio interno" }));

    expect(await screen.findByRole("option", { name: "Professora Teste" })).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText(/Professor conselheiro/i), "prof-1");
    await usuario.type(screen.getByLabelText(/Local do estágio/i), "Laboratório de Redes");
    await usuario.type(screen.getByLabelText(/Descrição/i), "Apoio em manutenção de equipamentos.");

    await usuario.click(screen.getByRole("button", { name: /enviar solicitação interna/i }));

    // Mensagem clara e específica para o aluno — não a genérica de "operação não concluída"
    expect(
      await screen.findByText(/você já possui solicitações em análise/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/enviada para análise do CIEC/i)).not.toBeInTheDocument();
  });

  it("envia solicitação externa com o DTO documentado", async () => {
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
    const chamadaEnvio = chamadas.find((c) => String(c.url).includes("/solicitacoes-estagio/externo"));
    const corpo = JSON.parse(chamadaEnvio.options.body);
    expect(corpo).toEqual({
      empresa: { razaoSocial: "Empresa Teste LTDA", cnpj: "12345678000195" },
      supervisor: { nome: "Maria Teste" },
    });
  });
});
