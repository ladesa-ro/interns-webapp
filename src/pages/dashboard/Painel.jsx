import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/cards";

import styles from "./Painel.module.css";

export default function Painel() {
  const navigate = useNavigate();

  return (
    <div className={styles.painel}>
      <h1>Painel CIEC</h1>

      <p className={styles.sub}>
        Visão geral do Sistema de Gerenciamento de Estágios
      </p>

      <div className={styles.cards}>
        <Cards
          titulo="Empresas Cadastradas"
          valor="24"
          cor="green"
          Icon={Building2}
          onClick={() => navigate("/empresa")}
        />

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

      <div className={styles.alertas}>
        <h3>Alertas e Pendências</h3>

        <div className={`${styles.alert} ${styles.redAlert}`}>
          <div className={styles.alertContent}>
            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.vermelho}>
                8 alunos do 3° ano sem estágio
              </p>

              <small>Requer atenção imediata</small>
            </div>
          </div>
        </div>

        <div className={`${styles.alert} ${styles.yellowAlert}`}>
          <div className={styles.alertContent}>
            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.amarelo}>
                12 alunos na lista de espera
              </p>

              <small>Verificar vagas disponíveis</small>
            </div>
          </div>
        </div>

        <div className={`${styles.alert} ${styles.blueAlert}`}>
          <div className={styles.alertContent}>
            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.azul}>
                5 estágios terminam este mês
              </p>

              <small>Preparar documentação</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}