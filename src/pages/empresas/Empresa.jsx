import styles from "./empresas.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/cards";

export default function Empresas() {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <main className={styles.empresasContainer}>
        <div className={styles.topo}>
          <button className={styles.voltar} onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1>Painel CIEC</h1>
            <p>Empresas Cadastradas</p>
          </div>
        </div>

        <div className={styles.cards}>
         <Cards
            titulo="Quantidade de empresas"
            valor="24"
            cor="green"
          />
          <Cards
          titulo="Empresas com estágio ativo"
          valor="24"
          cor="green"
          />
        </div>

        <div className={styles.tabelaBox}>
          <table>
            <thead>
              <tr>
                <th>Nome da Empresa</th>
                <th>Curso</th>
                <th>Contato</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Tech Solutions</td>
                <td>Informática</td>
                <td>techsolutions@gmail.com</td>
              </tr>

              <tr>
                <td>Inova Digital</td>
                <td>Informática</td>
                <td>inovadigital@gmail.com</td>
              </tr>

              <tr>
                <td>Laboratório BioVida</td>
                <td>Química</td>
                <td>biovida@gmail.com</td>
              </tr>

              <tr>
                <td>QuimLab Análise</td>
                <td>Química</td>
                <td>quimlab@gmail.com</td>
              </tr>

              <tr>
                <td>Floresta Viva</td>
                <td>Floresta</td>
                <td>floresta@gmail.com</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
