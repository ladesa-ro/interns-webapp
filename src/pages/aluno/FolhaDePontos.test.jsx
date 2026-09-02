import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import FolhaDePontos from "./FolhaDePontos";
import { instalarFetch } from "../../test/apiMock";

const SESSAO = {
  usuario: { id: "u-1", nome: "Aluno Teste" },
  perfisAtivos: [{ id: "perf-1", ativo: true, cargo: "aluno" }],
};

function folha(extra = {}) {
  return {
    id: "fp-1",
    estagio: { id: "est-1" },
    data: "2026-06-15",
    horaInicio: "13:30",
    horaFim: "17:30",
    quantidadeHoras: 4,
    status: "PENDING",
    dataSolicitacao: "2026-06-15T13:30:00Z",
    ...extra,
  };
}

function rotasBase(sobrescreve = {}) {
  return {
    "/autenticacao/quem-sou-eu": () => ({ status: 200, body: SESSAO }),
    "/estagiarios": () => ({ status: 200, body: { data: [{ id: "estg-1" }], meta: {} } }),
    "/estagios": () => ({
      status: 200,
      body: { data: [{ id: "est-1", empresa: { nome: "ACME" } }], meta: {} },
    }),
    "/folha-ponto": () => ({
      status: 200,
      body: { data: [folha()], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 10 } },
    }),
    ...sobrescreve,
  };
}

function renderizar() {
  return render(
    <MemoryRouter>
      <FolhaDePontos />
    </MemoryRouter>
  );
}

describe("FolhaDePontos", () => {
  it("mostra carregamento e depois os registros vindos da API", async () => {
    instalarFetch(rotasBase());

    renderizar();

    expect(screen.getByText(/carregando registros/i)).toBeInTheDocument();

    expect(await screen.findByText("15/06/2026")).toBeInTheDocument();
    expect(screen.getByText("13:30 - 17:30")).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getByText("Aguardando supervisor")).toBeInTheDocument();
  });

  it("usa meta.totalItems na paginação", async () => {
    instalarFetch(
      rotasBase({
        "/folha-ponto": () => ({
          status: 200,
          body: {
            data: [folha()],
            meta: { totalItems: 42, currentPage: 1, totalPages: 5, itemsPerPage: 10 },
          },
        }),
      })
    );

    renderizar();

    expect(await screen.findByText(/página 1 de 5 — 42 registro\(s\)/i)).toBeInTheDocument();
  });

  it("apresenta estado vazio quando a API não retorna registros", async () => {
    instalarFetch(
      rotasBase({
        "/folha-ponto": () => ({ status: 200, body: { data: [], meta: { totalItems: 0, totalPages: 1 } } }),
      })
    );

    renderizar();

    expect(await screen.findByText(/nenhum registro encontrado/i)).toBeInTheDocument();
  });

  it("não trata 403 como lista vazia", async () => {
    instalarFetch(rotasBase({ "/folha-ponto": () => ({ status: 403, body: null }) }));

    renderizar();

    expect(await screen.findByText(/não tem permissão/i)).toBeInTheDocument();
    expect(screen.queryByText(/nenhum registro encontrado/i)).not.toBeInTheDocument();
  });

  it("informa quando o aluno não possui estágio vinculado", async () => {
    instalarFetch(
      rotasBase({ "/estagios": () => ({ status: 200, body: { data: [], meta: {} } }) })
    );

    renderizar();

    expect(await screen.findByText(/nenhum estágio vinculado/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /registrar frequência/i })).not.toBeInTheDocument();
  });

  it("valida data e hora antes de enviar", async () => {
    const { chamadas } = instalarFetch(rotasBase());
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    await usuario.click(screen.getByRole("button", { name: "Registrar frequência" }));

    expect(await screen.findByText(/informe uma data válida/i)).toBeInTheDocument();
    expect(chamadas.some((c) => c.options?.method === "POST")).toBe(false);
  });

  it("bloqueia observações acima do limite documentado", async () => {
    instalarFetch(rotasBase());
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    const observacoes = screen.getByLabelText(/observações/i);
    await usuario.click(observacoes);
    await usuario.paste("a".repeat(2100));

    expect(observacoes).toHaveAttribute("maxlength", "2000");
    expect(observacoes.value).toHaveLength(2000);
  });

  it("cria o registro e recarrega a lista", async () => {
    const { chamadas } = instalarFetch(
      rotasBase({
        "/folha-ponto": ({ options }) =>
          options?.method === "POST"
            ? { status: 201, body: folha({ id: "fp-2" }) }
            : {
                status: 200,
                body: { data: [folha()], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 10 } },
              },
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    await usuario.type(screen.getByLabelText(/^data/i), "2026-06-16");
    await usuario.type(screen.getByLabelText(/hora de início/i), "13:30");
    await usuario.type(screen.getByLabelText(/hora de fim/i), "17:30");
    await usuario.click(screen.getByRole("button", { name: "Registrar frequência" }));

    expect(await screen.findByText(/enviado para confirmação do supervisor/i)).toBeInTheDocument();

    const criacao = chamadas.find((c) => c.options?.method === "POST");
    expect(JSON.parse(criacao.options.body)).toEqual({
      estagio: { id: "est-1" },
      data: "2026-06-16",
      horaInicio: "13:30",
      horaFim: "17:30",
    });
  });

  it("não permite submissão duplicada durante o envio", async () => {
    let liberar;
    const espera = new Promise((resolve) => {
      liberar = resolve;
    });

    const { chamadas } = instalarFetch(
      rotasBase({
        "/folha-ponto": async ({ options }) => {
          if (options?.method === "POST") {
            await espera;
            return { status: 201, body: folha({ id: "fp-2" }) };
          }
          return {
            status: 200,
            body: { data: [folha()], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 10 } },
          };
        },
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    await usuario.type(screen.getByLabelText(/^data/i), "2026-06-16");
    await usuario.type(screen.getByLabelText(/hora de início/i), "13:30");
    await usuario.type(screen.getByLabelText(/hora de fim/i), "17:30");

    const botao = screen.getByRole("button", { name: "Registrar frequência" });
    await usuario.click(botao);
    await waitFor(() => expect(botao).toBeDisabled());
    await usuario.click(botao);

    liberar();

    await waitFor(() =>
      expect(chamadas.filter((c) => c.options?.method === "POST")).toHaveLength(1)
    );
  });

  it("cancela uma folha PENDING somente após confirmação no diálogo", async () => {
    const { chamadas } = instalarFetch(
      rotasBase({
        "/folha-ponto/fp-1": () => ({ status: 200, body: true }),
      })
    );
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    await usuario.click(screen.getByRole("button", { name: /cancelar registro de 15\/06\/2026/i }));

    const dialogo = await screen.findByRole("dialog");
    await usuario.click(within(dialogo).getByRole("button", { name: /manter registro/i }));
    expect(chamadas.some((c) => c.options?.method === "DELETE")).toBe(false);

    await usuario.click(screen.getByRole("button", { name: /cancelar registro de 15\/06\/2026/i }));
    const novoDialogo = await screen.findByRole("dialog");
    await usuario.click(within(novoDialogo).getByRole("button", { name: "Cancelar registro" }));

    await waitFor(() =>
      expect(chamadas.some((c) => c.options?.method === "DELETE")).toBe(true)
    );
    expect(await screen.findByText(/registro cancelado/i)).toBeInTheDocument();
  });

  it("não oferece cancelamento para status diferente de PENDING", async () => {
    instalarFetch(
      rotasBase({
        "/folha-ponto": () => ({
          status: 200,
          body: {
            data: [folha({ status: "APPROVED" })],
            meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 10 },
          },
        }),
      })
    );

    renderizar();

    expect(await screen.findByText("15/06/2026")).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getByText("Aprovada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /cancelar registro de/i })).not.toBeInTheDocument();
  });

  it("aplica o filtro de situação usando o parâmetro documentado", async () => {
    const { chamadas } = instalarFetch(rotasBase());
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    await usuario.selectOptions(screen.getByLabelText(/situação/i), "APPROVED");

    await waitFor(() => {
      const ultima = chamadas.filter((c) => String(c.url).includes("/folha-ponto?")).at(-1);
      expect(new URL(String(ultima.url), "http://localhost").searchParams.getAll("filter.status")).toEqual([
        "APPROVED",
      ]);
    });
  });

  it("envia a busca textual apenas quando aplicada", async () => {
    const { chamadas } = instalarFetch(rotasBase());
    const usuario = userEvent.setup();

    renderizar();
    await screen.findByText("15/06/2026");

    const anteriores = chamadas.filter((c) => String(c.url).includes("/folha-ponto?")).length;
    await usuario.type(screen.getByLabelText(/buscar/i), "turno");
    expect(chamadas.filter((c) => String(c.url).includes("/folha-ponto?"))).toHaveLength(anteriores);

    await usuario.click(screen.getByRole("button", { name: /aplicar busca/i }));

    await waitFor(() => {
      const ultima = chamadas.filter((c) => String(c.url).includes("/folha-ponto?")).at(-1);
      expect(new URL(String(ultima.url), "http://localhost").searchParams.get("search")).toBe("turno");
    });
  });

  it("permite tentar novamente após erro de rede", async () => {
    let falhar = true;
    instalarFetch(
      rotasBase({
        "/folha-ponto": () =>
          falhar
            ? { status: 500, body: null }
            : {
                status: 200,
                body: { data: [folha()], meta: { totalItems: 1, currentPage: 1, totalPages: 1, itemsPerPage: 10 } },
              },
      })
    );
    const usuario = userEvent.setup();

    renderizar();

    const tentar = await screen.findByRole("button", { name: /tentar novamente/i });
    falhar = false;
    await usuario.click(tentar);

    expect(await screen.findByText("15/06/2026")).toBeInTheDocument();
  });

  it("não emite avisos de key do React ao renderizar a lista", async () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    instalarFetch(
      rotasBase({
        "/folha-ponto": () => ({
          status: 200,
          body: {
            data: [folha(), folha({ id: "fp-2", data: "2026-06-17" })],
            meta: { totalItems: 2, currentPage: 1, totalPages: 1, itemsPerPage: 10 },
          },
        }),
      })
    );

    renderizar();
    await screen.findByText("17/06/2026");

    expect(erro.mock.calls.flat().join(" ")).not.toMatch(/unique "key"/i);
  });
});
