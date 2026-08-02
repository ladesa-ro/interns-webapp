import React, { useState, useEffect } from 'react';
import Styles from './tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../utils/api';

export default function TabelaRegistros() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
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
  }, [pagina, busca]);

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

  return (
    <div className={Styles.container}>
      {/* Barra de busca */}
      <div className={Styles.searchContainer}>
        <Pesquisa size={40} />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1); // Reinicia para a página 1 ao filtrar
          }}
        />
      </div>

      {/* Tabela de Empresas */}
      {loading ? (
        <p className={Styles.mensagem}>Carregando empresas...</p>
      ) : erro ? (
        <div className={Styles.erroContainer}>
          <p className={Styles.mensagem}>{erro}</p>
          <button className={Styles.btnTentar} onClick={() => setPagina(1)}>
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <table className={Styles.table}>
            <thead>
              <tr>
                <th>Nome Fantasia</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Cidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.length === 0 ? (
                <tr>
                  <td colSpan={6} className={Styles.semResultados}>
                    {busca
                      ? `Nenhuma empresa encontrada para "${busca}".`
                      : 'Nenhuma empresa cadastrada.'}
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nomeFantasia || empresa.razaoSocial}</td>
                    <td>{empresa.cnpj || '-'}</td>
                    <td>{empresa.telefone || '-'}</td>
                    <td>{empresa.email || '-'}</td>
                    <td>{empresa.endereco?.cidade?.nome || 'Não informada'}</td>
                    <td className={Styles.actions}>
                      <button
                        title="Editar empresa"
                        onClick={() => navigate(`/editar-empresa/${empresa.id}`)}
                      >
                        <Editar />
                      </button>

                      <button
                        title="Excluir empresa"
                        onClick={() => {
                          setEmpresaSelecionada(empresa);
                          setModalAberto(true);
                        }}
                      >
                        <Deletar />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginação Server-side */}
          <div className={Styles.pagination}>
            <button
              disabled={pagina === 1 || loading}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <button
              disabled={pagina >= totalPaginas || loading}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* Modal de confirmação de exclusão */}
      {modalAberto && (
        <div className={Styles.overlay}>
          <div className={Styles.modal}>
            <h3>Excluir empresa</h3>
            <p>
              Tem certeza que deseja excluir{' '}
              <strong>{empresaSelecionada?.nomeFantasia || empresaSelecionada?.razaoSocial}</strong>? Essa ação
              não pode ser desfeita.
            </p>
            <div className={Styles.modalButtons}>
              <button
                className={Styles.cancelButton}
                onClick={() => {
                  setModalAberto(false);
                  setEmpresaSelecionada(null);
                }}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                className={Styles.deleteButton}
                onClick={deletarEmpresa}
                disabled={deletando}
              >
                {deletando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}