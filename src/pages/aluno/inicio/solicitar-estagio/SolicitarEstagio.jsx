import { useEffect, useState } from "react";
import { Building2, School } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Textarea,
} from "../../../../components/ui";
import { mensagemDeErro } from "../../../../utils/api";
import {
  candidatarSe,
  solicitarEstagioExterno,
  ROTULOS_SOLICITACAO,
  TONS_SOLICITACAO,
  cancelarSolicitacao,
  listarProfessoresElegiveis,
  listarMinhasSolicitacoes,
  solicitacaoPodeSerCancelada,
  validarSolicitacaoExterna,
  validarSolicitacaoInterna,
  solicitarEstagioInterno,
} from "../../../../utils/solicitacoesEstagioApi";
import "./SolicitarEstagio.css";

// O schema de `professorConselheiro` na API ainda é "type: object" sem propriedades
// definidas (ver ISSUE_BACKEND_ESTAGIO_FLUXOS.md §Revisão item 2).
// Mantenha como false até o backend publicar o schema e o formato ser testado
// com sessão autenticada real.
const PROFESSOR_CONSELHEIRO_CONFIRMADO = false;

const CAMPOS_EXTERNOS_VAZIOS = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  telefone: "",
  email: "",
  supervisorNome: "",
  supervisorEmail: "",
  supervisorTelefone: "",
};

function camposDaVaga(vaga) {
  // Aceita tanto uma vaga completa (com .id) quanto um wrapper { empresa }
  const empresa = vaga?.empresa ?? {};
  const supervisor = vaga?.supervisor ?? vaga?.nomeSupervisor ?? "";
  return {
    razaoSocial: empresa.razaoSocial ?? empresa.nomeFantasia ?? "",
    nomeFantasia: empresa.nomeFantasia ?? "",
    cnpj: empresa.cnpj ?? "",
    telefone: empresa.telefone ?? "",
    email: empresa.email ?? "",
    supervisorNome: supervisor,
    supervisorEmail: vaga?.emailSupervisor ?? empresa.emailSupervisor ?? "",
    supervisorTelefone: vaga?.telefoneSupervisor ?? empresa.telefoneSupervisor ?? "",
  };
}

export default function SolicitarEstagio() {
  const location = useLocation();
  const navigate = useNavigate();
  const vagaSelecionada = location.state?.vagaSelecionada;

  // O aluno escolhe manualmente a modalidade — não inferimos tipo pelo schema da API
  // (ver ISSUE_BACKEND_ESTAGIO_FLUXOS.md §Revisão item 1: campus não é garantia de INTERNO)
  const [tipo, setTipo] = useState("externo");

  // Pré-preenche com dados disponíveis da vaga/empresa, independente de ter .id
  const [dadosExternos, setDadosExternos] = useState(() => (
    vagaSelecionada ? camposDaVaga(vagaSelecionada) : CAMPOS_EXTERNOS_VAZIOS
  ));
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [candidaturaEnviando, setCandidaturaEnviando] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregandoSolicitacoes, setCarregandoSolicitacoes] = useState(true);
  const [erroSolicitacoes, setErroSolicitacoes] = useState(null);
  const [solicitacaoParaCancelar, setSolicitacaoParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const [professores, setProfessores] = useState([]);
  const [professorId, setProfessorId] = useState("");
  const [localInterno, setLocalInterno] = useState("");
  const [descricaoInterna, setDescricaoInterna] = useState("");
  const [carregandoProfessores, setCarregandoProfessores] = useState(true);
  const [erroProfessores, setErroProfessores] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarSolicitacoes() {
      setCarregandoSolicitacoes(true);
      setErroSolicitacoes(null);
      try {
        const lista = await listarMinhasSolicitacoes({ signal: controlador.signal });
        if (!controlador.signal.aborted) setSolicitacoes(lista);
      } catch (error) {
        if (!controlador.signal.aborted) setErroSolicitacoes(error);
      } finally {
        if (!controlador.signal.aborted) setCarregandoSolicitacoes(false);
      }
    }

    carregarSolicitacoes();
    return () => controlador.abort();
  }, [recarga]);

  useEffect(() => {
    const controlador = new AbortController();
    async function carregarProfessores() {
      try {
        const lista = await listarProfessoresElegiveis({ signal: controlador.signal });
        if (!controlador.signal.aborted) setProfessores(lista);
      } catch (error) {
        if (!controlador.signal.aborted) setErroProfessores(error);
      } finally {
        if (!controlador.signal.aborted) setCarregandoProfessores(false);
      }
    }
    carregarProfessores();
    return () => controlador.abort();
  }, []);

  function atualizar(campo, valor) {
    setDadosExternos((atual) => ({ ...atual, [campo]: valor }));
  }

  async function enviarExterno(evento) {
    evento.preventDefault();
    if (enviando) return;

    const empresa = {
      razaoSocial: dadosExternos.razaoSocial,
      nomeFantasia: dadosExternos.nomeFantasia || undefined,
      cnpj: dadosExternos.cnpj,
      telefone: dadosExternos.telefone || undefined,
      email: dadosExternos.email || undefined,
    };
    const supervisor = {
      nome: dadosExternos.supervisorNome,
      email: dadosExternos.supervisorEmail || undefined,
      telefone: dadosExternos.supervisorTelefone || undefined,
    };
    const novosErros = validarSolicitacaoExterna({ empresa, supervisor });
    setErros(novosErros);
    setMensagem("");
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    try {
      await solicitarEstagioExterno({ empresa, supervisor });
      setMensagem("Solicitação externa enviada para análise do CIEC.");
      setDadosExternos(CAMPOS_EXTERNOS_VAZIOS);
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  }

  async function enviarInterno(evento) {
    evento.preventDefault();
    if (enviando) return;

    // Bloqueio: formato de professorConselheiro nao confirmado pelo backend.
    // (ver ISSUE_BACKEND_ESTAGIO_FLUXOS.md §Revisão item 2)
    if (!PROFESSOR_CONSELHEIRO_CONFIRMADO) {
      setMensagem(
        "Envio de soliçitação interna aguardando confirmação do backend: " +
        "o formato do campo \u2018professorConselheiro\u2019 ainda não está documentado na API. " +
        "Entre em contato com o CIEC para prosseguir."
      );
      return;
    }

    const professorConselheiro = professorId ? { id: professorId } : undefined;
    const payload = { professorConselheiro, local: localInterno, descricao: descricaoInterna };
    
    const novosErros = validarSolicitacaoInterna(payload);
    setErros(novosErros);
    setMensagem("");
    if (Object.keys(novosErros).length) return;

    setEnviando(true);
    try {
      await solicitarEstagioInterno(payload);
      setMensagem("Solicitação interna enviada para análise do CIEC.");
      setProfessorId("");
      setLocalInterno("");
      setDescricaoInterna("");
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  }

  async function candidatarNaVaga() {
    if (!vagaSelecionada?.id || candidaturaEnviando) return;
    setCandidaturaEnviando(true);
    setMensagem("");
    try {
      await candidatarSe(vagaSelecionada.id);
      setMensagem("Candidatura enviada. Acompanhe sua posição na Lista de espera.");
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setCandidaturaEnviando(false);
    }
  }

  async function confirmarCancelamento() {
    if (!solicitacaoParaCancelar || cancelando) return;

    setCancelando(true);
    try {
      await cancelarSolicitacao(solicitacaoParaCancelar.id);
      setMensagem("Solicitação cancelada.");
      setSolicitacaoParaCancelar(null);
      setRecarga((valor) => valor + 1);
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="solicitacao-container">
      <PageHeader
        title="Solicitar estágio"
        description="Candidate-se a uma vaga aberta ou solicite análise de uma nova empresa."
      />

      <section className="conteudo-centralizado" aria-label="Modalidade de estágio">
        {/* Banner de vaga: aparece em qualquer aba, pois o aluno escolhe a modalidade */}
        {vagaSelecionada ? (
          <div className="vaga-selecionada" role="status">
            <span>
              {vagaSelecionada.id
                ? "Dados disponíveis da vaga foram pré-preenchidos no formulário."
                : `Dados disponíveis de ${vagaSelecionada.empresa?.nomeFantasia ?? vagaSelecionada.empresa?.razaoSocial ?? "empresa selecionada"} foram pré-preenchidos.`}
            </span>
            {vagaSelecionada.id ? (
              <Button type="button" onClick={candidatarNaVaga} loading={candidaturaEnviando}>
                Candidatar-se nesta vaga
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="tipo-estagio" role="group" aria-label="Tipo de estágio">
          <button
            className={`tipo-card ${tipo === "interno" ? "ativo" : ""}`}
            onClick={() => setTipo("interno")}
            type="button"
            aria-pressed={tipo === "interno"}
          >
            <School size={30} aria-hidden="true" />
            <span>Estágio interno</span>
          </button>

          <button
            className={`tipo-card ${tipo === "externo" ? "ativo" : ""}`}
            onClick={() => setTipo("externo")}
            type="button"
            aria-pressed={tipo === "externo"}
          >
            <Building2 size={30} aria-hidden="true" />
            <span>Estágio externo</span>
          </button>
        </div>

        {tipo === "externo" ? (
          <form className="form-estagio" aria-labelledby="titulo-externo" onSubmit={enviarExterno} noValidate>
            <div className="cabecalho-formulario">
              <h2 id="titulo-externo">Solicitar empresa externa</h2>
              <Button onClick={() => navigate("/aluno/vagas-disponiveis")}>
                Candidatar-se a uma vaga
              </Button>
            </div>

            <Input label="Razão social" required value={dadosExternos.razaoSocial} error={erros.razaoSocial} onChange={(e) => atualizar("razaoSocial", e.target.value)} />
            <Input label="Nome fantasia" value={dadosExternos.nomeFantasia} onChange={(e) => atualizar("nomeFantasia", e.target.value)} />
            <Input label="CNPJ" required value={dadosExternos.cnpj} error={erros.cnpj} onChange={(e) => atualizar("cnpj", e.target.value)} />
            <Input label="Telefone da empresa" value={dadosExternos.telefone} onChange={(e) => atualizar("telefone", e.target.value)} />
            <Input label="E-mail da empresa" type="email" value={dadosExternos.email} onChange={(e) => atualizar("email", e.target.value)} />
            <Input label="Nome do supervisor" required value={dadosExternos.supervisorNome} error={erros.supervisorNome} onChange={(e) => atualizar("supervisorNome", e.target.value)} />
            <Input label="E-mail do supervisor" type="email" value={dadosExternos.supervisorEmail} onChange={(e) => atualizar("supervisorEmail", e.target.value)} />
            <Input label="Telefone do supervisor" value={dadosExternos.supervisorTelefone} onChange={(e) => atualizar("supervisorTelefone", e.target.value)} />
            <div className="acoes-formulario">
              <Button type="submit" loading={enviando}>Enviar solicitação externa</Button>
            </div>
            <div className="mensagem-formulario" aria-live="polite">{mensagem}</div>
          </form>
        ) : (
          <form className="form-estagio" aria-labelledby="titulo-interno" onSubmit={enviarInterno} noValidate>
            <div className="cabecalho-formulario">
              <h2 id="titulo-interno">Estágio no IFRO</h2>
            </div>
            {erroProfessores ? <ErrorState message={mensagemDeErro(erroProfessores)} /> : null}
            <label className={`campo-interno ${erros.professorId ? "com-erro" : ""}`}>
              <span>Professor conselheiro</span>
              <select value={professorId} required onChange={(evento) => setProfessorId(evento.target.value)} disabled={carregandoProfessores}>
                <option value="">Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.usuario?.nome ?? professor.usuario?.matricula ?? professor.id}
                  </option>
                ))}
              </select>
              {erros.professorId && <span className="mensagem-erro">{erros.professorId}</span>}
            </label>
            <Input label="Local do estágio" required maxLength={255} error={erros.local} value={localInterno} onChange={(evento) => setLocalInterno(evento.target.value)} />
            <Textarea label="Descrição" required rows={5} maxLength={500} error={erros.descricao} value={descricaoInterna} onChange={(evento) => setDescricaoInterna(evento.target.value)} />
            
            <div className="acoes-formulario">
              <Button type="submit" loading={enviando}>Enviar solicitação interna</Button>
            </div>
            <div className="mensagem-formulario" aria-live="polite">{mensagem}</div>
          </form>
        )}

        {tipo === "externo" && !vagaSelecionada?.id ? (
          <p className="aviso-formulario">
            Já encontrou uma vaga? Candidate-se pelo catálogo. Caso contrário, informe uma nova empresa para análise do CIEC.
          </p>
        ) : null}

        <section className="historico-solicitacoes" aria-labelledby="titulo-historico">
          <h2 id="titulo-historico">Minhas solicitações</h2>
          {carregandoSolicitacoes ? (
            <LoadingState message="Carregando solicitações..." rows={2} />
          ) : erroSolicitacoes ? (
            <ErrorState
              message={mensagemDeErro(erroSolicitacoes)}
              onRetry={() => setRecarga((valor) => valor + 1)}
            />
          ) : solicitacoes.length === 0 ? (
            <EmptyState title="Nenhuma solicitação enviada" />
          ) : (
            <ul className="lista-solicitacoes">
              {solicitacoes.map((solicitacao) => (
                <li key={solicitacao.id}>
                  <div>
                    <strong>{solicitacao.tipo === "INTERNO" ? "Estágio interno" : solicitacao.empresaNomeFantasia ?? solicitacao.empresaRazaoSocial ?? "Estágio externo"}</strong>
                    <Badge tone={TONS_SOLICITACAO.get(solicitacao.situacao) ?? "neutral"}>
                      {ROTULOS_SOLICITACAO.get(solicitacao.situacao) ?? solicitacao.situacao}
                    </Badge>
                  </div>
                  {solicitacaoPodeSerCancelada(solicitacao) ? (
                    <Button variant="danger" size="sm" onClick={() => setSolicitacaoParaCancelar(solicitacao)}>
                      Cancelar solicitação
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      <ConfirmDialog
        open={Boolean(solicitacaoParaCancelar)}
        title="Cancelar solicitação"
        description="Confirme que deseja cancelar esta solicitação de estágio."
        confirmLabel="Cancelar solicitação"
        tone="danger"
        loading={cancelando}
        onCancel={() => (cancelando ? undefined : setSolicitacaoParaCancelar(null))}
        onConfirm={confirmarCancelamento}
      />
    </div>
  );
}