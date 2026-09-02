import { useState, useEffect } from 'react';
import Styles from './tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../utils/api';
import { Button, ConfirmDialog, EmptyState, ErrorState, Input, LoadingState } from '../ui';

export default function TabelaRegistros() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  // Força uma nova busca quando o erro ocorre já na página 1, onde setPagina(1)
  // não mudaria o estado nem dispararia o efeito novamente.
  const [tentativa, setTentativa] = useState(0);
  const limite = 10;

  // Modal de confirmação de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [deletando, setDeletando] = useState(false);

  // Busca paginada via server-side
  useEffect(() => {
    let cancelado = false;

    async function carregarEmpresas() {
      setLoading(true);
      setErro(null);

      try {
        const queryParams = new URLSearchParams({
          page: pagina.toString(),
          limit: limite.toString(),
        });

        if (busca.trim()) {
          queryParams.append('search', busca.trim());
        }

        const response = await apiFetch(`/empresas?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error('Falha ao carregar a lista de empresas da API.');
        }

        const dados = await response.json();

        if (cancelado) return;

        const lista = dados.data || (Array.isArray(dados) ? dados : []);
        setEmpresas(lista);

        // Extrai metadados de paginação retornados pela API Ladesa
        const pageCount = dados.meta?.pageCount || dados.meta?.totalPages || dados.pageCount;
        const totalItems = dados.meta?.itemCount || dados.meta?.totalItems || dados.total;

        if (pageCount) {
          setTotalPaginas(Math.max(1, pageCount));
        } else if (totalItems !== undefined) {
          setTotalPaginas(Math.max(1, Math.ceil(totalItems / limite)));
        } else {
          setTotalPaginas(1);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Erro ao carregar empresas:", error);
          setErro(error.message || 'Erro ao carregar empresas. Tente novamente.');
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    carregarEmpresas();

    return () => {
      cancelado = true;
    };
  }, [pagina, busca, tentativa]);

  function tentarNovamente() {
    if (pagina === 1) {
      setTentativa((t) => t + 1);
    } else {
      setPagina(1);
    }
  }

  // Executa exclusão da empresa selecionada
  async function deletarEmpresa() {
    if (!empresaSelecionada) return;

    setDeletando(true);

    try {
      const res = await apiFetch(`/empresas/${empresaSelecionada.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.mensagem || 'Erro ao excluir empresa.');
      }

      setEmpresas((prev) => prev.filter((e) => e.id !== empresaSelecionada.id));
      setModalAberto(false);
      setEmpresaSelecionada(null);

      // Se apagou o único registro da página, volta para a página anterior se possível
      if (empresas.length === 1 && pagina > 1) {
        setPagina((p) => p - 1);
      }
    } catch (error) {
      alert(error.message || 'Erro ao excluir empresa.');
    } finally {
      setDeletando(false);
    }
  }

  const nomeEmpresaSelecionada =
    empresaSelecionada?.nomeFantasia || empresaSelecionada?.razaoSocial || '';

  return (
    <div className={Styles.container}>
      {/* Barra de busca */}
      <div className={Styles.searchContainer}>
        <Pesquisa size={40} aria-hidden="true" />
        <Input
          aria-label="Buscar empresa por nome ou CNPJ"
          placeholder="Buscar por nome ou CNPJ..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1); // Reinicia para a página 1 ao filtrar
          }}
          className={Styles.searchInput}
        />
      </div>

      {/* Tabela de Empresas */}
      {loading ? (
        <LoadingState message="Carregando empresas..." rows={4} />
      ) : erro ? (
        <ErrorState
          title="Não foi possível carregar as empresas"
          message={erro}
          onRetry={tentarNovamente}
          retryLabel="Tentar novamente"
        />
      ) : empresas.length === 0 ? (
        <EmptyState
          title={busca ? `Nenhuma empresa encontrada para "${busca}".` : 'Nenhuma empresa cadastrada.'}
        />
      ) : (
        <>
          <div className={Styles.tableWrapper}>
            <table className={Styles.table}>
              <caption className="sr-only">Lista de empresas cadastradas</caption>
              <thead>
                <tr>
                  <th scope="col">Nome Fantasia</th>
                  <th scope="col">CNPJ</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Email</th>
                  <th scope="col">Cidade</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => {
                  const nome = empresa.nomeFantasia || empresa.razaoSocial || 'empresa';
                  return (
                    <tr key={empresa.id}>
                      <td>{nome}</td>
                      <td>{empresa.cnpj || '-'}</td>
                      <td>{empresa.telefone || '-'}</td>
                      <td>{empresa.email || '-'}</td>
                      <td>{empresa.endereco?.cidade?.nome || 'Não informada'}</td>
                      <td className={Styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Editar ${nome}`}
                          onClick={() => navigate(`/editar-empresa/${empresa.id}`)}
                        >
                          <Editar aria-hidden="true" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Excluir ${nome}`}
                          onClick={() => {
                            setEmpresaSelecionada(empresa);
                            setModalAberto(true);
                          }}
                        >
                          <Deletar aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginação Server-side */}
          <div className={Styles.pagination}>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagina === 1 || loading}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={pagina >= totalPaginas || loading}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        open={modalAberto}
        onCancel={() => {
          setModalAberto(false);
          setEmpresaSelecionada(null);
        }}
        onConfirm={deletarEmpresa}
        title="Excluir empresa"
        description={`Tem certeza que deseja excluir ${nomeEmpresaSelecionada}? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        tone="danger"
        loading={deletando}
      />
    </div>
  );
}
