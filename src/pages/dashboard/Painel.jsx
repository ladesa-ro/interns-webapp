import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";
import "../../styles/global.css";
import { useNavigate } from "react-router-dom";
import Cards from "../../components/pages_Components/cards";

export default function Painel() {
  const navigate = useNavigate();

  return (
    <div className="painel">
      <h1>Painel CIEC</h1>
      <p className="sub">Visão geral do Sistema de Gerenciamento de Estágios</p>

      <div className="cards">
        <Cards
          titulo="Empresas Cadastradas"
          valor="24"
          cor="green"
          Icon={Building2}
          onClick={() => navigate("/empresa")}
          style={{ cursor: "pointer" }}/>

        <Cards
          titulo="Vagas Disponíveis"
          valor="15"
          cor="blue"
          Icon={Briefcase}
          onClick={() => navigate("/vagas")}
        />

        <Cards
        titulo="Alunos em Estágio"
        valor="42"
        cor="purple"
        Icon={Users}
        />

        <Cards
          titulo="Alunos do 3° ano sem Estágio"
          valor="8"
          cor="red"
          Icon={AlertCircle}
        />

        <Cards
          titulo="Relatórios 2° ano"
          valor="8"
          cor="orange"
          Icon={FileText}
        />
      </div>

      <div className="alertas">
        <h3>Alertas e Pendências</h3>

        <div className="alert red-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p className="vermelho">8 alunos do 3° ano sem estágio</p>
              <small>Requer atenção imediata</small>
            </div>
          </div>
        </div>

        <div className="alert yellow-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p className="amarelo">12 alunos na lista de espera</p>
              <small>Verificar vagas disponíveis</small>
            </div>
          </div>
        </div>

        <div className="alert blue-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p className="azul">5 estágios terminam este mês</p>
              <small>Preparar documentação</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
