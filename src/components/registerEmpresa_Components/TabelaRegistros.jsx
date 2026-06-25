import React, { useState, useEffect } from 'react';
import Styles from '../../components/registerEmpresa_Components/tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import Editar from '../icons_Components/Icon_Editar_Comp';
import Deletar from '../icons_Components/Icon_Deletar_Comp';
import { useNavigate } from 'react-router-dom';

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
    setLoading(true);

    // Constrói a URL passando a página atual e o termo de pesquisa formatado
    let url = `https://dev.ladesa.com.br/api/v1/empresas?page=${pagina}`;
    
    if (busca.trim() !== '') {
      url += `&search=${encodeURIComponent(busca.trim())}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((dados) => {
        // Armazena as empresas da página atual
        setEmpresas(dados.data || []);
        
        // Atualiza o total de páginas vindo dos metadados reais da API
        if (dados.meta && dados.meta.totalPages) {
          setTotalPaginas(dados.meta.totalPages);
        } else {
          setTotalPaginas(1);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar empresas:", error);
        setLoading(false);
      });
  }, [pagina, busca]); // O useEffect roda novamente sempre que a página ou a busca mudarem

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
    </div>
  );
}