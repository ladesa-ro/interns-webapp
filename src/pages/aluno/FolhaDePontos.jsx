import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./FolhaDePontos.module.css";
import RegistroPontoCard from "../../components/aluno/RegistroPontoCard";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  Select,
  Textarea,
} from "../../components/ui";
import { mensagemDeErro } from "../../utils/api";
import {
  LIMITE_OBSERVACOES,
  ROTULOS_STATUS,
  STATUS_FOLHA_PONTO,
  buscarEstagiosDoAluno,
  cancelarFolhaPonto,
  criarFolhaPonto,
  formatarData,
  listarFolhasPonto,
  podeCancelar,
  validarFolhaPonto,
} from "../../utils/folhaPontoApi";

const ITENS_POR_PAGINA = 10;
const FORMULARIO_VAZIO = { data: "", horaInicio: "", horaFim: "", observacoes: "" };

const OPCOES_STATUS = [
  { value: "", label: "Todas as situações" },
  ...Object.values(STATUS_FOLHA_PONTO).map((status) => ({
    value: status,
    label: ROTULOS_STATUS.get(status) ?? status,
  })),
];

function descreverEstagio(estagio) {
  const empresa = estagio?.empresa?.nome ?? estagio?.empresa?.razaoSocial;
  return empresa ? `Estágio — ${empresa}` : `Estágio ${estagio.id}`;
}

export default function FolhaDePontos() {
  const navigate = useNavigate();

  const [estagios, setEstagios] = useState([]);
  const [estagioId, setEstagioId] = useState("");
  const [estagiosResolvidos, setEstagiosResolvidos] = useState(false);
  const [erroEstagios, setErroEstagios] = useState(null);

  const [registros, setRegistros] = useState([]);
  const [meta, setMeta] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [busca, setBusca] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [errosFormulario, setErrosFormulario] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erroAcao, setErroAcao] = useState("");

  const [folhaParaCancelar, setFolhaParaCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const [recarga, setRecarga] = useState(0);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();

    async function resolverEstagios() {
      try {
        const lista = await buscarEstagiosDoAluno({ signal: controlador.signal });
        if (controlador.signal.aborted) return;
        setEstagios(lista);
        setEstagioId(lista.length === 1 ? lista[0].id : "");
      } catch (error) {
        if (controlador.signal.aborted) return;
        setErroEstagios(error);
      } finally {
        if (!controlador.signal.aborted) setEstagiosResolvidos(true);
      }
    }

    resolverEstagios();

    return () => controlador.abort();
  }, []);

  useEffect(() => {
    if (!estagiosResolvidos) return undefined;

    const controlador = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await listarFolhasPonto({
          page: pagina,
          limit: ITENS_POR_PAGINA,
          search: busca,
          status: filtroStatus ? [filtroStatus] : [],
          estagioId,
          signal: controlador.signal,
        });

        if (controlador.signal.aborted) return;
        setRegistros(resultado.registros);
        setMeta(resultado.meta);
      } catch (error) {
        if (controlador.signal.aborted) return;
        // Erro não é lista vazia: a página informa a falha em vez de sugerir
        // que o aluno não possui registros.
        setErro(error);
        setRegistros([]);
        setMeta(null);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregar();

    return () => controlador.abort();
  }, [estagiosResolvidos, pagina, busca, filtroStatus, estagioId, recarga]);

  const recarregar = useCallback(() => setRecarga((valor) => valor + 1), []);

  const atualizarCampo = useCallback((campo, valor) => {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }, []);

  const totalPaginas = Math.max(meta?.totalPages ?? 1, 1);
  const totalItens = meta?.totalItems ?? 0;

  const opcoesEstagio = useMemo(
    () => [
      { value: "", label: "Selecione o estágio" },
      ...estagios.map((estagio) => ({
        value: estagio.id,
        label: descreverEstagio(estagio),
      })),
    ],
    [estagios]
  );

  async function enviarFormulario(evento) {
    evento.preventDefault();
    if (enviando) return;

    setMensagemSucesso("");
    setErroAcao("");

    const erros = validarFolhaPonto({ ...formulario, estagioId });
    setErrosFormulario(erros);
    if (Object.keys(erros).length > 0) return;

    setEnviando(true);
    try {
      await criarFolhaPonto({ ...formulario, estagioId });
      if (!montadoRef.current) return;
      setFormulario(FORMULARIO_VAZIO);
      setMensagemSucesso("Registro enviado para confirmação do supervisor.");
      setPagina(1);
      recarregar();
    } catch (error) {
      if (montadoRef.current) setErroAcao(mensagemDeErro(error));
    } finally {
      if (montadoRef.current) setEnviando(false);
    }
  }

  async function confirmarCancelamento() {
    if (!folhaParaCancelar || cancelando) return;

    setCancelando(true);
    setErroAcao("");
    setMensagemSucesso("");

    try {
      await cancelarFolhaPonto(folhaParaCancelar.id);
      if (!montadoRef.current) return;
      setFolhaParaCancelar(null);
      setMensagemSucesso("Registro cancelado.");
      recarregar();
    } catch (error) {
      if (montadoRef.current) setErroAcao(mensagemDeErro(error));
    } finally {
      if (montadoRef.current) setCancelando(false);
    }
  }

  const restanteObservacoes = LIMITE_OBSERVACOES - formulario.observacoes.length;

  return (
    <div className={styles.pagina}>
      <PageHeader
        title="Registrar frequência"
        description="Registre o turno cumprido no estágio e acompanhe a confirmação do supervisor."
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
        }
      />

      {erroEstagios ? (
        <ErrorState
          title="Não foi possível identificar seu estágio"
          message={mensagemDeErro(erroEstagios)}
        />
      ) : null}

      {estagiosResolvidos && !erroEstagios && estagios.length === 0 ? (
        <EmptyState
          title="Nenhum estágio vinculado"
          message="Só é possível registrar frequência quando há um estágio ativo vinculado ao seu perfil. Procure o CIEC."
        />
      ) : null}

      {estagios.length > 0 ? (
        <section className={styles.secao} aria-labelledby="titulo-novo-registro">
          <h2 className={styles.tituloSecao} id="titulo-novo-registro">
            Novo registro
          </h2>

          <form className={styles.formulario} onSubmit={enviarFormulario} noValidate>
            {estagios.length > 1 ? (
              <Select
                label="Estágio"
                required
                value={estagioId}
                options={opcoesEstagio}
                error={errosFormulario.estagio}
                onChange={(evento) => setEstagioId(evento.target.value)}
                fieldClassName={styles.campoLargo}
              />
            ) : null}

            <Input
              label="Data"
              type="date"
              required
              value={formulario.data}
              error={errosFormulario.data}
              onChange={(evento) => atualizarCampo("data", evento.target.value)}
            />

            <Input
              label="Hora de início"
              type="time"
              required
              value={formulario.horaInicio}
              error={errosFormulario.horaInicio}
              onChange={(evento) => atualizarCampo("horaInicio", evento.target.value)}
            />

            <Input
              label="Hora de fim"
              type="time"
              required
              value={formulario.horaFim}
              error={errosFormulario.horaFim}
              onChange={(evento) => atualizarCampo("horaFim", evento.target.value)}
            />

            <Textarea
              label="Observações"
              rows={3}
              maxLength={LIMITE_OBSERVACOES}
              value={formulario.observacoes}
              error={errosFormulario.observacoes}
              hint={`${restanteObservacoes} caracteres restantes`}
              onChange={(evento) => atualizarCampo("observacoes", evento.target.value)}
              fieldClassName={styles.campoLargo}
            />

            <div className={styles.acoesFormulario}>
              <Button type="submit" loading={enviando}>
                Registrar frequência
              </Button>
            </div>
          </form>

          <div aria-live="polite" className={styles.avisos}>
            {mensagemSucesso ? (
              <p className={styles.sucesso}>{mensagemSucesso}</p>
            ) : null}
            {erroAcao ? <p className={styles.erro}>{erroAcao}</p> : null}
          </div>
        </section>
      ) : null}

      <section className={styles.secao} aria-labelledby="titulo-registros">
        <h2 className={styles.tituloSecao} id="titulo-registros">
          Meus registros
        </h2>

        <form
          className={styles.filtros}
          onSubmit={(evento) => {
            evento.preventDefault();
            setPagina(1);
            setBusca(termoBusca);
          }}
        >
          <Input
            label="Buscar"
            type="search"
            value={termoBusca}
            placeholder="Data, observação..."
            onChange={(evento) => setTermoBusca(evento.target.value)}
          />

          <Select
            label="Situação"
            value={filtroStatus}
            options={OPCOES_STATUS}
            onChange={(evento) => {
              setPagina(1);
              setFiltroStatus(evento.target.value);
            }}
          />

          <div className={styles.acoesFiltro}>
            <Button type="submit" variant="secondary">
              Aplicar busca
            </Button>
          </div>
        </form>

        {carregando ? (
          <LoadingState message="Carregando registros de frequência..." rows={3} />
        ) : erro ? (
          <ErrorState message={mensagemDeErro(erro)} onRetry={recarregar} />
        ) : registros.length === 0 ? (
          <EmptyState
            title="Nenhum registro encontrado"
            message="Nenhuma folha de ponto corresponde aos filtros selecionados."
          />
        ) : (
          <>
            <ul className={styles.lista}>
              {registros.map((folha) => (
                <li key={folha.id}>
                  <RegistroPontoCard
                    folha={folha}
                    cancelavel={podeCancelar(folha)}
                    onCancelar={() => setFolhaParaCancelar(folha)}
                  />
                </li>
              ))}
            </ul>

            <nav className={styles.paginacao} aria-label="Paginação dos registros">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagina <= 1}
                onClick={() => setPagina((atual) => Math.max(atual - 1, 1))}
              >
                Anterior
              </Button>

              <p className={styles.infoPaginacao} aria-live="polite">
                Página {pagina} de {totalPaginas} — {totalItens} registro(s)
              </p>

              <Button
                variant="secondary"
                size="sm"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((atual) => Math.min(atual + 1, totalPaginas))}
              >
                Próxima
              </Button>
            </nav>
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(folhaParaCancelar)}
        tone="danger"
        title="Cancelar registro de frequência"
        description={
          folhaParaCancelar
            ? `O registro de ${formatarData(folhaParaCancelar.data)} será cancelado. Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Cancelar registro"
        cancelLabel="Manter registro"
        loading={cancelando}
        onCancel={() => (cancelando ? undefined : setFolhaParaCancelar(null))}
        onConfirm={confirmarCancelamento}
      />
    </div>
  );
}
