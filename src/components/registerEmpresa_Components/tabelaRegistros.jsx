import React, {useState, useEffect} from 'react';
import Styles from '../../components/registerEmpresa_Components/tabelaRegistros.module.css';
import Pesquisa from '../icons_Components/Icon_Pesquisa_Comp';
import { useNavigate } from 'react-router-dom';
export default function TabelaRegistros() {

  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const empresasFiltradas = empresas.filter((empresa) =>
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


  return (
    <div className={Styles.container}>
      <div>
          <div className={Styles.searchContainer}>
            <Pesquisa />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
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
                  <button title="Editar"
                  onClick={() => navigate('/editar-empresa')}>✏️</button>
                  <button title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
            {empresasFiltradas.length === 0 && (
              <tr>
                <td colSpan="7">
                  Nenhuma empresa encontrada.
                </td>
              </tr>
            )}
          </tbody>  
        </table>
    </div>
  );
}