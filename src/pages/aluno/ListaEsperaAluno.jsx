import { useCallback, useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

import styles from "./ListaEsperaAluno.module.css";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../../components/ui";
import { mensagemDeErro } from "../../utils/api";
import {
  ROTULOS_CANDIDATURA,
  TONS_CANDIDATURA,
  aceitarCandidatura,
  cancelarCandidatura,
  listarMinhasCandidaturas,
} from "../../utils/solicitacoesEstagioApi";
import { nomeDaEmpresa, nomeDoCurso } from "../../utils/vagasDisponiveisApi";

function formatarData(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data.toLocaleDateString("pt-BR");
}

export default function ListaEsperaAluno() {
  const [candidaturas, setCandidaturas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await listarMinhasCandidaturas({ signal: controlador.signal });
        if (!controlador.signal.aborted) setCandidaturas(resultado.candidaturas);
      } catch (error) {
        if (!controlador.signal.aborted) setErro(error);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    return () => controlador.abort();
  }, [recarga]);

  const recarregar = useCallback(() => setRecarga((valor) => valor + 1), []);

  async function confirmarAcao() {
    if (!candidaturaSelecionada || processando) return;

    setProcessando(true);
    setMensagem("");
    try {
      if (candidaturaSelecionada.acao === "aceitar") {
        await aceitarCandidatura(candidaturaSelecionada.id);
        setMensagem("Vaga aceita com sucesso.");
      } else {
        await cancelarCandidatura(candidaturaSelecionada.id);
        setMensagem("Candidatura cancelada.");
      }
      setCandidaturaSelecionada(null);
      recarregar();
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className={styles.pagina}>
      <PageHeader
        title="Lista de espera"
        description="Acompanhe suas candidaturas e responda às vagas liberadas para você."
      />

      <div className={styles.mensagem} aria-live="polite">{mensagem}</div>

      {carregando ? (
        <LoadingState message="Carregando candidaturas..." rows={3} />
      ) : erro ? (
        <ErrorState message={mensagemDeErro(erro)} onRetry={recarregar} />
      ) : candidaturas.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura em andamento"
          message="Ao candidatar-se a uma vaga disponível, seu acompanhamento aparecerá aqui."
          icon={Clock3}
        />
      ) : (
        <ul className={styles.lista}>
          {candidaturas.map((candidatura) => {
            const vaga = candidatura.estagio;
            const podeAceitar = candidatura.acaoDisponivel === true;
            const expiraEm = formatarData(candidatura.expiraEm);

            return (
              <li key={candidatura.id} className={styles.item}>
                <div className={styles.topo}>
                  <div>
                    <h2>{nomeDaEmpresa(vaga)}</h2>
                    <p>{nomeDoCurso(vaga)}</p>
                  </div>
                  <Badge tone={TONS_CANDIDATURA.get(candidatura.situacao) ?? "neutral"}>
                    {ROTULOS_CANDIDATURA.get(candidatura.situacao) ?? candidatura.situacao}
                  </Badge>
                </div>

                <dl className={styles.detalhes}>
                  <div>
                    <dt>Posição na fila</dt>
                    <dd>{candidatura.posicaoFila ?? "Não se aplica"}</dd>
                  </div>
                  <div>
                    <dt>Carga horária semanal</dt>
                    <dd>{vaga?.cargaHoraria ? `${vaga.cargaHoraria} horas` : "Não informada"}</dd>
                  </div>
                  {expiraEm ? (
                    <div>
                      <dt>Prazo para resposta</dt>
                      <dd>{expiraEm}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className={styles.acoes}>
                  {podeAceitar ? (
                    <Button onClick={() => setCandidaturaSelecionada({ ...candidatura, acao: "aceitar" })}>
                      Aceitar vaga
                    </Button>
                  ) : null}
                  {candidatura.situacao === "PENDING" ? (
                    <Button variant="danger" onClick={() => setCandidaturaSelecionada({ ...candidatura, acao: "cancelar" })}>
                      Cancelar candidatura
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(candidaturaSelecionada)}
        title={candidaturaSelecionada?.acao === "aceitar" ? "Aceitar vaga" : "Cancelar candidatura"}
        description={candidaturaSelecionada?.acao === "aceitar"
          ? "Confirme que deseja aceitar esta vaga de estágio."
          : "Confirme que deseja remover sua candidatura da lista de espera."}
        confirmLabel={candidaturaSelecionada?.acao === "aceitar" ? "Aceitar vaga" : "Cancelar candidatura"}
        tone={candidaturaSelecionada?.acao === "cancelar" ? "danger" : "primary"}
        loading={processando}
        onCancel={() => (processando ? undefined : setCandidaturaSelecionada(null))}
        onConfirm={confirmarAcao}
      />
    </div>
  );
}
