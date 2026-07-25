import React, { useState, useEffect } from 'react';
import Styles from './tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';

export default function TabelaRegistros() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null); // Error state para falha de rede

  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const limite = 20;

  // Modal de confirmação de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [deletando, setDeletando] = useState(false);

  // Busca todas as empresas — extraída em função para permitir "Tentar novamente"
  function carregarEmpresas() {
    setLoading(true);
    setErro(null);

    const token = localStorage.getItem('token');

    fetch('https://dev.ladesa.com.br/api/v1/empresas?limit=200', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar empresas.');
        return res.json();
      })
      .then((dados) => {
        setEmpresas(dados.data || []);
      })
      .catch((error) => {
        setErro(error.message || 'Erro de rede. Verifique sua conexão.');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    carregarEmpresas();
  }, []);

  // DELETE — remove empresa pelo ID e atualiza a lista local
  async function deletarEmpresa() {
    if (!empresaSelecionada) return;

    setDeletando(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `https://dev.ladesa.com.br/api/v1/empresas/${empresaSelecionada.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao excluir empresa.');
      }

      // Remove da lista local sem recarregar tudo
      setEmpresas((prev) => prev.filter((e) => e.id !== empresaSelecionada.id));
      setModalAberto(false);
      setEmpresaSelecionada(null);

      // Volta para a página anterior se a atual ficar vazia
      const novasFiltradas = empresasFiltradas.filter(
        (e) => e.id !== empresaSelecionada.id
      );
      const novoTotal = Math.ceil(novasFiltradas.length / limite);
      if (pagina > Math.max(1, novoTotal)) {
        setPagina(Math.max(1, novoTotal));
      }
    } catch (error) {
      alert(error.message || 'Erro ao excluir empresa.');
    } finally {
      setDeletando(false);
    }
  }

  // Filtro local por nome fantasia ou CNPJ
  const empresasFiltradas = empresas.filter((empresa) => {
    const nome = empresa.nomeFantasia?.toLowerCase() || '';
    const cnpj = empresa.cnpj || '';
    return nome.includes(busca.toLowerCase()) || cnpj.includes(busca);
  });

  // Paginação local — totalPaginas mínimo de 1 para evitar divisão por zero
  const totalPaginas = Math.max(1, Math.ceil(empresasFiltradas.length / limite));
  const inicio = (pagina - 1) * limite;
  const empresasPagina = empresasFiltradas.slice(inicio, inicio + limite);

  // Estados de loading e erro
  if (loading) {
    return <p className={Styles.mensagem}>Carregando empresas...</p>;
  }

  if (erro) {
    return (
      <div className={Styles.erroContainer}>
        <p className={Styles.mensagem}>{erro}</p>
        <button className={Styles.btnTentar} onClick={carregarEmpresas}>
          Tentar novamente
        </button>
      </div>
    );
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
            setPagina(1);
          }}
        />
      </div>

      {/* Tabela */}
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
          {empresasPagina.length === 0 ? (
            <tr>
              <td colSpan={6} className={Styles.semResultados}>
                {busca
                  ? `Nenhuma empresa encontrada para "${busca}".`
                  : 'Nenhuma empresa cadastrada.'}
              </td>
            </tr>
          ) : (
            empresasPagina.map((empresa) => (
              <tr key={empresa.id}>
                <td>{empresa.nomeFantasia}</td>
                <td>{empresa.cnpj}</td>
                <td>{empresa.telefone}</td>
                <td>{empresa.email}</td>
                <td>{empresa.endereco?.cidade?.nome}</td>
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

      {/* Paginação */}
      <div className={Styles.pagination}>
        <button
          disabled={pagina === 1}
          onClick={() => setPagina(pagina - 1)}
        >
          Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          disabled={pagina === totalPaginas}
          onClick={() => setPagina(pagina + 1)}
        >
          Próxima
        </button>
      </div>

      {/* Modal de confirmação de exclusão */}
      {modalAberto && (
        <div className={Styles.overlay}>
          <div className={Styles.modal}>
            <h3>Excluir empresa</h3>
            <p>
              Tem certeza que deseja excluir{' '}
              <strong>{empresaSelecionada?.nomeFantasia}</strong>? Essa ação
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