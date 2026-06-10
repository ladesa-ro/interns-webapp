import React, { useState, useEffect } from "react";
import Styles from "../../components/registerEmpresa_Components/tabelaRegistros.module.css";
import Pesquisa from "../icons_Components/Icon_Pesquisa_Comp";
import Editar from "../icons_Components/Icon_Editar_Comp";
import Deletar from "../icons_Components/Icon_Deletar_Comp";
import { useNavigate } from "react-router-dom";

export default function TabelaRegistros() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  const empresasFiltradas = empresas.filter(
    (empresa) =>
      (empresa.nomeFantasia || "")
        .toLowerCase()
        .includes(busca.toLowerCase()) ||
      (empresa.cnpj || "").includes(busca)
  );

  useEffect(() => {
    fetch("https://dev.ladesa.com.br/api/v1/empresas")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        return response.json();
      })
      .then((dados) => {
        setEmpresas(dados.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar empresas:", error);
        setEmpresas([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Carregando empresas...</p>;
  }

  return (
    <div className={Styles.container}>
      <div className={Styles.searchContainer}>
        <div className={Styles.searchIcon}>
          <Pesquisa size={28} />
        </div>

        <input
          type="text"
          placeholder="Buscar por nome ou CNPJ..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <table>
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
          {empresasFiltradas.map((empresa) => (
            <tr key={empresa.id}>
              <td>{empresa.nomeFantasia}</td>
              <td>{empresa.cnpj}</td>
              <td>{empresa.telefone}</td>
              <td>{empresa.email}</td>
              <td>{empresa.endereco?.cidade?.nome}</td>

              <td>
                <div className={Styles.acoes}>
                  <button
                    title="Editar"
                    onClick={() => navigate("/editar-empresa")}
                  >
                    <Editar />
                  </button>

                  <button title="Excluir">
                    <Deletar />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {empresasFiltradas.length === 0 && (
            <tr>
              <td colSpan="6">
                Nenhuma empresa encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}