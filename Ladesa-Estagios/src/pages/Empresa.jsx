import "./empresas.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Empresas() {
  const navigate = useNavigate();

  return (
    <div className="layout">
      

      {/* CONTEÚDO */}
      <main className="empresas-container">

        <div className="topo">
          <button className="voltar" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1>Painel CIEC</h1>
            <p>Empresas Cadastradas</p>
          </div>
        </div>

        {/* CARDS */}
        <div className="cards">
          <div className="card">
            <p>Quantidade de empresas</p>
            <span>24</span>
          </div>

          <div className="card">
            <p>Empresas com estágio ativo</p>
            <span>24</span>
          </div>
        </div>

        {/* TABELA */}
        <div className="tabela-box">
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