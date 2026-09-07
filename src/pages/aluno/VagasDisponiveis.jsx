import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Building2, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./VagasDisponiveis.module.css";
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader } from "../../components/ui";
import { mensagemDeErro } from "../../utils/api";
import {
  listarVagasDisponiveis,
  localizacaoDaVaga,
  nomeDaEmpresa,
  nomeDoCurso,
  vagaInterna,
} from "../../utils/vagasDisponiveisApi";

export default function VagasDisponiveis() {
  const navigate = useNavigate();
  const [vagas, setVagas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [limite, setLimite] = useState(12);
  const [busca, setBusca] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarVagas() {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await listarVagasDisponiveis({
          page: pagina,
          search: busca,
          signal: controlador.signal,
        });
        if (controlador.signal.aborted) return;
        setVagas(resultado.vagas);
        setPagina(resultado.pagina);
        setTotal(resultado.total);
        setLimite(resultado.limite);
      } catch (error) {
        if (!controlador.signal.aborted) setErro(error);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarVagas();
    return () => controlador.abort();
  }, [pagina, busca, recarga]);

  const recarregar = useCallback(() => setRecarga((valor) => valor + 1), []);
  const totalPaginas = Math.max(Math.ceil(total / limite), 1);

  function selecionarVaga(vaga) {
    navigate("/aluno/solicitar-estagio", {
      state: { vagaSelecionada: vaga },
    });
  }

  return (
    <div className={styles.pagina}>
      <PageHeader
        title="Vagas disponíveis"
        description="Candidate-se a uma vaga aberta de uma empresa parceira."
        actions={
          <Button variant="ghost" onClick={() => navigate(-1)} aria-label="Voltar">
            <ArrowLeft size={20} aria-hidden="true" />
          </Button>
        }
      />

      <form
        className={styles.busca}
        onSubmit={(evento) => {
          evento.preventDefault();
          setPagina(1);
          setBusca(termoBusca);
        }}
      >
        <Input
          label="Buscar vaga"
          type="search"
          placeholder="Empresa ou termo da vaga"
          value={termoBusca}
          onChange={(evento) => setTermoBusca(evento.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search size={18} aria-hidden="true" />
          Buscar
        </Button>
      </form>

      {carregando ? (
        <LoadingState message="Carregando vagas disponíveis..." rows={4} />
      ) : erro ? (
        <ErrorState message={mensagemDeErro(erro)} onRetry={recarregar} />
      ) : vagas.length === 0 ? (
        <EmptyState
          title="Nenhuma vaga disponível"
          message="Não há vagas abertas para os filtros informados neste momento."
        />
      ) : (
        <>
          <ul className={styles.lista}>
            {vagas.map((vaga) => (
              <li key={vaga.id}>
                <Card className={styles.vaga} padding="lg">
                  <div className={styles.conteudoVaga}>
                    <Building2 className={styles.icone} size={24} aria-hidden="true" />
                    <div>
                      <h2>{nomeDaEmpresa(vaga)}</h2>
                      <p>Vaga disponível</p>
                    </div>
                  </div>

                  <dl className={styles.detalhes}>
                    <div>
                      <dt>Curso</dt>
                      <dd>{nomeDoCurso(vaga)}</dd>
                    </div>
                    <div>
                      <dt>Carga horária semanal</dt>
                      <dd>{vaga.cargaHoraria ? `${vaga.cargaHoraria} horas` : "Não informada"}</dd>
                    </div>
                    <div>
                      <dt>Localização</dt>
                      <dd>
                        <MapPin size={16} aria-hidden="true" />
                        {localizacaoDaVaga(vaga)}
                      </dd>
                    </div>
                    {vagaInterna(vaga) ? (
                      <div>
                        <dt>Campus</dt>
                        <dd>{vaga.campus?.nomeFantasia ?? vaga.campus?.razaoSocial ?? "Não informado"}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt>Supervisor</dt>
                      <dd>{vaga.nomeSupervisor ?? "Não informado"}</dd>
                    </div>
                  </dl>

                  <Button
                    onClick={() => selecionarVaga(vaga)}
                  >
                    Candidatar-se
                  </Button>
                </Card>
              </li>
            ))}
          </ul>

          <nav className={styles.paginacao} aria-label="Paginação das vagas">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => atual - 1)}
            >
              Anterior
            </Button>
            <p>Página {pagina} de {totalPaginas} ({total} vaga(s))</p>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((atual) => atual + 1)}
            >
              Próxima
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
