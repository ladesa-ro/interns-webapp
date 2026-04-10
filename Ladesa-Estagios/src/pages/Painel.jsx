import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function Painel() {
  return (
    <div className="painel">
      <h1>Painel CIEC</h1>
      <p className="sub">Visão geral do Sistema de Gerenciamento de Estágios</p>

      {/* CARDS */}
      <div className="cards">
        <div className="card green">
          <Building2 className="icon-card" />
          <h3>Empresas Cadastradas</h3>
          <span>24</span>
        </div>

        <div className="card blue">
          <Briefcase className="icon-card" />
          <h3>Vagas Disponíveis</h3>
          <span>15</span>
        </div>

        <div className="card purple">
          <Users className="icon-card" />
          <h3>Alunos em Estágio</h3>
          <span>42</span>
        </div>

        <div className="card red">
          <AlertCircle className="icon-card" />
          <h3>Alunos do 3° ano sem Estágio</h3>
          <span>8</span>
        </div>

        <div className="card orange">
          <FileText className="icon-card" />
          <h3>Relatórios 2° ano</h3>
          <span>8</span>
        </div>
      </div>

      {/* ALERTAS */}
      <div className="alertas">
        <h3>Alertas e Pendências</h3>

        <div className="alert red-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p>8 alunos do 3° ano sem estágio</p>
              <small>Requer atenção imediata</small>
            </div>
          </div>
        </div>

        <div className="alert yellow-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p>12 alunos na lista de espera</p>
              <small>Verificar vagas disponíveis</small>
            </div>
          </div>
        </div>

        <div className="alert blue-alert">
          <div className="alert-content">
            <span className="icon">⚠</span>
            <div>
              <p>5 estágios terminam este mês</p>
              <small>Preparar documentação</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}