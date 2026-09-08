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
} from "../../../../utils/solicitacoesEstagioApi";
import "./SolicitarEstagio.css";

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
  return {
    razaoSocial: vaga?.empresa?.razaoSocial ?? vaga?.empresa?.nomeFantasia ?? "",
    nomeFantasia: vaga?.empresa?.nomeFantasia ?? "",
    cnpj: vaga?.empresa?.cnpj ?? "",
    telefone: vaga?.empresa?.telefone ?? "",
    email: vaga?.empresa?.email ?? "",
    supervisorNome: vaga?.supervisor ?? "",
    supervisorEmail: vaga?.emailSupervisor ?? "",
    supervisorTelefone: vaga?.telefoneSupervisor ?? "",
  };
}

export default function SolicitarEstagio() {
  const location = useLocation();
  const navigate = useNavigate();
  const vagaSelecionada = location.state?.vagaSelecionada;
  const [tipo, setTipo] = useState("externo");
  const [dadosExternos, setDadosExternos] = useState(() => (
    vagaSelecionada?.id ? camposDaVaga(vagaSelecionada) : CAMPOS_EXTERNOS_VAZIOS
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

            {vagaSelecionada?.id ? (
              <div className="vaga-selecionada" role="status">
                <span>Os dados retornados da vaga foram preenchidos quando disponíveis.</span>
                <Button type="button" onClick={candidatarNaVaga} loading={candidaturaEnviando}>
                  Candidatar-se nesta vaga
                </Button>
              </div>
            ) : null}

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
          <section className="form-estagio" aria-labelledby="titulo-interno">
            <div className="cabecalho-formulario">
              <h2 id="titulo-interno">Estágio no IFRO</h2>
            </div>
            <p className="aviso-formulario">
              A lista de professores usa `GET /perfis` filtrado por cargo e campus. O envio permanece aguardando a definição do formato de `professorConselheiro` na API.
            </p>
            {erroProfessores ? <ErrorState message={mensagemDeErro(erroProfessores)} /> : null}
            <label className="campo-interno">
              <span>Professor conselheiro</span>
              <select value={professorId} onChange={(evento) => setProfessorId(evento.target.value)} disabled={carregandoProfessores}>
                <option value="">Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.usuario?.nome ?? professor.usuario?.matricula ?? professor.id}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Local do estágio" value={localInterno} onChange={(evento) => setLocalInterno(evento.target.value)} />
            <Textarea label="Descrição" rows={5} value={descricaoInterna} onChange={(evento) => setDescricaoInterna(evento.target.value)} />
            <p className="aviso-formulario">
              O botão de envio será habilitado quando o backend publicar as propriedades aceitas de `professorConselheiro`.
            </p>
          </section>
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