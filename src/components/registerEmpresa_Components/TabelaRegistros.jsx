import React, { useState, useEffect } from 'react';
import Styles from '../../components/registerEmpresa_Components/tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../../utils/api';

export default function TabelaRegistros() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [modalAberto, setModalAberto] = useState(false);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  // BUSCA AS EMPRESAS DIRETO NA API REAGINDO À BUSCA E À PÁGINA
  useEffect(() => {
    // Constrói a URL passando a página atual
    let url = `/empresas?page=${pagina}`;

    if (busca.trim() !== '') {
      url += `&search=${encodeURIComponent(busca.trim())}`;
    }

    async function fetchEmpresas() {
      setLoading(true);
      try {
        const res = await apiFetch(url);
        if (!res.ok) {
          throw new Error("Erro ao carregar empresas.");
        }
        const dados = await res.json();
        setEmpresas(dados.data || []);
        setTotalPaginas(dados.meta?.totalPages || 1);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmpresas();
  }, [pagina, busca]); // O useEffect roda novamente sempre que a página ou a busca mudarem

  // DELETA A EMPRESA SELECIONADA
  async function handleDeletar() {
    if (!empresaSelecionada) return;

    try {
      const response = await apiFetch(`/empresas/${empresaSelecionada.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const erroDados = await response.json().catch(() => null);
        throw new Error(erroDados?.message || erroDados?.mensagem || "Não foi possível excluir a empresa.");
      }

      alert("Empresa excluída com sucesso!");
      
      // Remove localmente a empresa excluída
      setEmpresas(empresas.filter(emp => emp.id !== empresaSelecionada.id));
      setModalAberto(false);
      setEmpresaSelecionada(null);

      // Trata transição de página vazia
      if (empresas.length === 1 && pagina > 1) {
        setPagina(pagina - 1);
      }
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      alert(error.message || "Ocorreu um erro ao tentar excluir a empresa.");
      setModalAberto(false);
      setEmpresaSelecionada(null);
    }
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.searchContainer}>
        <Pesquisa size={40} />
        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1); // Volta para a página 1 ao pesquisar algo novo
          }}
        />
      </div>

      {loading ? (
        <p>Carregando empresas...</p>
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
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nomeFantasia}</td>
                    <td>{empresa.cnpj}</td>
                    <td>{empresa.telefone}</td>
                    <td>{empresa.email}</td>
                    <td>{empresa.endereco?.cidade?.nome || "Não informado"}</td>
                    <td className={Styles.actions}>
                      <button onClick={() => navigate(`/editar-empresa/${empresa.id}`)}>
                        <Editar />
                      </button>

                      <button
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
              disabled={pagina === totalPaginas || totalPaginas === 0}
              onClick={() => setPagina(pagina + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* MODAL VISUAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {modalAberto && (
        <div className={Styles.overlay}>
          <div className={Styles.modal}>
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza de que deseja excluir a empresa{" "}
              <strong>{empresaSelecionada?.nomeFantasia || empresaSelecionada?.razaoSocial}</strong>? Esta ação é irreversível.
            </p>
            <div className={Styles.modalButtons}>
              <button
                className={Styles.cancelButton}
                onClick={() => {
                  setModalAberto(false);
                  setEmpresaSelecionada(null);
                }}
              >
                Cancelar
              </button>
              <button
                className={Styles.deleteButton}
                onClick={handleDeletar}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}