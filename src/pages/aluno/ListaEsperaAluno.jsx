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
  Select,
  Textarea,
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

function formatarDataHora(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data.toLocaleString("pt-BR");
}

export default function ListaEsperaAluno() {
  const [candidaturas, setCandidaturas] = useState([]);
  const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1 });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [processando, setProcessando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  // Filtros e paginação
  const [pagina, setPagina] = useState(1);
  const [situacao, setSituacao] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro(null);
      // FIX BUG 4: Limpa a mensagem anterior ao recarregar a lista
      setMensagem("");
      
      try {
        const resultado = await listarMinhasCandidaturas({
          page: pagina,
          limit: 10,
          situacao: situacao,
          signal: controlador.signal,
        });
        
        if (!controlador.signal.aborted) {
          setCandidaturas(resultado.candidaturas);
          setMeta(resultado.meta);
        }
      } catch (error) {
        if (!controlador.signal.aborted) setErro(error);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    return () => controlador.abort();
  }, [recarga, pagina, situacao]);

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
        await cancelarCandidatura(candidaturaSelecionada.id, motivoCancelamento);
        setMensagem("Candidatura cancelada.");
      }
      setCandidaturaSelecionada(null);
      setMotivoCancelamento("");
      recarregar();
    } catch (error) {
      setMensagem(mensagemDeErro(error));
    } finally {
      setProcessando(false);
    }
  }

  const opcoesSituacao = [
    { value: "", label: "Todas as situações" },
    ...Array.from(ROTULOS_CANDIDATURA.entries()).map(([valor, rotulo]) => ({
      value: valor,
      label: rotulo,
    }))
  ];

  return (
    <div className={styles.pagina}>
      <PageHeader
        title="Minhas Candidaturas"
        description="Acompanhe suas candidaturas e responda às vagas liberadas para você."
      />

      <div className={styles.controles}>
        <div className={styles.filtro}>
          <label htmlFor="filtro-situacao" className="sr-only">Filtrar por situação</label>
          <Select
            id="filtro-situacao"
            value={situacao}
            onChange={(e) => {
              setSituacao(e.target.value);
              setPagina(1); // Volta para a primeira página ao mudar filtro
            }}
            options={opcoesSituacao}
          />
        </div>
      </div>

      <div className={styles.mensagem} aria-live="polite">{mensagem}</div>

      {carregando ? (
        <LoadingState message="Carregando candidaturas..." rows={3} />
      ) : erro ? (
        <ErrorState message={mensagemDeErro(erro)} onRetry={recarregar} />
      ) : candidaturas.length === 0 ? (
        <EmptyState
          title="Nenhuma candidatura encontrada"
          message={situacao ? "Você não possui candidaturas com esta situação." : "Ao candidatar-se a uma vaga disponível, seu acompanhamento aparecerá aqui."}
          icon={Clock3}
        />
      ) : (
        <>
          <ul className={styles.lista}>
            {candidaturas.map((candidatura) => {
              const vaga = candidatura.estagio;
              const podeAceitar = candidatura.acaoDisponivel === true;
              const expiraEm = formatarData(candidatura.expiraEm);
              // Melhoria 3: exibir data de inscrição
              const dataInscricao = formatarDataHora(candidatura.dataInscricao);

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
                    {dataInscricao ? (
                      <div>
                        <dt>Data de inscrição</dt>
                        <dd>{dataInscricao}</dd>
                      </div>
                    ) : null}
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
                    {["PENDING", "OFFERED"].includes(candidatura.situacao) ? (
                      <Button variant="danger" onClick={() => setCandidaturaSelecionada({ ...candidatura, acao: "cancelar" })}>
                        {candidatura.situacao === "OFFERED" ? "Recusar vaga" : "Cancelar candidatura"}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          {meta.totalPages > 1 && (
            <div className={styles.paginacao}>
              <Button 
                variant="ghost" 
                disabled={pagina === 1}
                onClick={() => setPagina(p => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className={styles.paginaAtual}>
                Página {meta.currentPage} de {meta.totalPages}
              </span>
              <Button 
                variant="ghost" 
                disabled={pagina >= meta.totalPages}
                onClick={() => setPagina(p => Math.min(meta.totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(candidaturaSelecionada)}
        title={candidaturaSelecionada?.acao === "aceitar" 
          ? "Aceitar vaga" 
          : candidaturaSelecionada?.situacao === "OFFERED" ? "Recusar vaga" : "Cancelar candidatura"}
        description={candidaturaSelecionada?.acao === "aceitar"
          ? "Confirme que deseja aceitar esta vaga de estágio."
          : candidaturaSelecionada?.situacao === "OFFERED" 
            ? "Confirme que deseja recusar esta vaga de estágio. Essa ação não pode ser desfeita."
            : "Confirme que deseja remover sua candidatura da lista de espera."}
        confirmLabel={candidaturaSelecionada?.acao === "aceitar" 
          ? "Aceitar vaga" 
          : candidaturaSelecionada?.situacao === "OFFERED" ? "Recusar vaga" : "Cancelar candidatura"}
        tone={candidaturaSelecionada?.acao === "cancelar" ? "danger" : "primary"}
        loading={processando}
        confirmDisabled={candidaturaSelecionada?.acao === "cancelar" && !motivoCancelamento.trim()}
        onCancel={() => {
          if (processando) return;
          setCandidaturaSelecionada(null);
          setMotivoCancelamento("");
        }}
        onConfirm={confirmarAcao}
      >
        {candidaturaSelecionada?.acao === "cancelar" && (
          <div style={{ marginTop: "1rem" }}>
            <Textarea
              id="motivo-cancelamento"
              label="Motivo (obrigatório)"
              placeholder="Descreva brevemente o motivo do cancelamento"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              required
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
