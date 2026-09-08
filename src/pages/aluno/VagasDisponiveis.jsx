import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Building2, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./VagasDisponiveis.module.css";
import { Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader } from "../../components/ui";
import { mensagemDeErro } from "../../utils/api";
import {
  listarEmpresasComVagas,
  localizacaoDaVaga,
  localizacaoDoEndereco,
  nomeDoCurso,
  nomeEmpresa,
  vagaInterna,
} from "../../utils/vagasDisponiveisApi";

export default function VagasDisponiveis() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busca, setBusca] = useState("");
  const [termoBusca, setTermoBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function carregar() {
      setCarregando(true);
      setErro(null);

      try {
        const resultado = await listarEmpresasComVagas({
          page: pagina,
          search: busca,
          signal: controlador.signal,
        });
        if (controlador.signal.aborted) return;
        setItens(resultado.itens);
        setPagina(resultado.pagina);
        setTotal(resultado.total);
        setTotalPaginas(resultado.totalPaginas);
      } catch (error) {
        if (!controlador.signal.aborted) setErro(error);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregar();
    return () => controlador.abort();
  }, [pagina, busca, recarga]);

  const recarregar = useCallback(() => setRecarga((valor) => valor + 1), []);

  function candidatarNaVaga(vaga) {
    navigate("/aluno/solicitar-estagio", { state: { vagaSelecionada: vaga } });
  }

  function solicitarNaEmpresa(empresa) {
    navigate("/aluno/solicitar-estagio", { state: { vagaSelecionada: { empresa } } });
  }

  return (
    <div className={styles.pagina}>
      <PageHeader
        title="Candidatar-se a uma vaga"
        description="As vagas abertas e as empresas parceiras vêm diretamente da API de estágios."
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
          label="Buscar empresa"
          type="search"
          placeholder="Nome da empresa"
          value={termoBusca}
          onChange={(evento) => setTermoBusca(evento.target.value)}
        />
        <Button type="submit" variant="secondary">
          <Search size={18} aria-hidden="true" />
          Buscar
        </Button>
      </form>

      {carregando ? (
        <LoadingState message="Carregando empresas e vagas..." rows={4} />
      ) : erro ? (
        <ErrorState message={mensagemDeErro(erro)} onRetry={recarregar} />
      ) : itens.length === 0 ? (
        <EmptyState
          title="Nenhuma empresa encontrada"
          message="Não há empresas cadastradas para os filtros informados."
        />
      ) : (
        <>
          <ul className={styles.lista}>
            {itens.map((item) => {
              const { empresa, vagaPrincipal, vagasDisponiveis } = item;
              const localizacao = vagaPrincipal
                ? localizacaoDaVaga(vagaPrincipal)
                : localizacaoDoEndereco(empresa.endereco);

              return (
                <li key={empresa.id}>
                  <Card className={styles.vaga} padding="lg">
                    <div className={styles.conteudoVaga}>
                      <Building2 className={styles.icone} size={24} aria-hidden="true" />
                      <div>
                        <h2>{nomeEmpresa(empresa)}</h2>
                        <p>
                          {vagasDisponiveis > 0
                            ? `${vagasDisponiveis} vaga(s) disponível(is)`
                            : "Nenhuma vaga disponível no momento"}
                        </p>
                      </div>
                    </div>

                    <dl className={styles.detalhes}>
                      <div>
                        <dt>Curso</dt>
                        <dd>{vagaPrincipal ? nomeDoCurso(vagaPrincipal) : "Não informado"}</dd>
                      </div>
                      <div>
                        <dt>Localização</dt>
                        <dd>
                          <MapPin size={16} aria-hidden="true" />
                          {localizacao}
                        </dd>
                      </div>
                      {vagaPrincipal && vagaInterna(vagaPrincipal) ? (
                        <div>
                          <dt>Campus</dt>
                          <dd>
                            {vagaPrincipal.campus?.nomeFantasia ?? vagaPrincipal.campus?.razaoSocial ?? "Não informado"}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    {vagasDisponiveis > 0 ? (
                      <Button onClick={() => candidatarNaVaga(vagaPrincipal)}>
                        Candidatar-se
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => solicitarNaEmpresa(empresa)}>
                        Solicitar estágio nesta empresa
                      </Button>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>

          <nav className={styles.paginacao} aria-label="Paginação das empresas">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => atual - 1)}
            >
              Anterior
            </Button>
            <p>Página {pagina} de {totalPaginas} ({total} empresa(s))</p>
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
