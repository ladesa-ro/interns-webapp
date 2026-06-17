import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

import Cards from "../../components/global_Components/Cards.jsx";

import styles from "./Painel.module.css";

export default function Painel() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const [mostrarSeta, setMostrarSeta] = useState(false);
  const [fimScroll, setFimScroll] = useState(false);

  // VERIFICA SCROLL
  useEffect(() => {
    const verificarScroll = () => {
      const el = scrollRef.current;

      if (!el) return;

      // mostra seta se tiver scroll
      setMostrarSeta(el.scrollWidth > el.clientWidth);

      // verifica se chegou no final
      setFimScroll(
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 5
      );
    };

    verificarScroll();

    window.addEventListener("resize", verificarScroll);

    const el = scrollRef.current;

    if (el) {
      el.addEventListener("scroll", verificarScroll);
    }

    return () => {
      window.removeEventListener("resize", verificarScroll);

      if (el) {
        el.removeEventListener("scroll", verificarScroll);
      }
    };
  }, []);

  // BOTÃO DA SETA
  const scrollCards = () => {
    scrollRef.current.scrollBy({
      left: 320,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.painel}>
      <h1>Painel CIEC</h1>

      <p className={styles.sub}>
        Visão geral do Sistema de Gerenciamento de Estágios
      </p>

      {/* WRAPPER */}
      <div className={styles.cardsWrapper}>

        {/* CONTAINER COM SCROLL */}
        <div
          className={styles.cardsContainer}
          ref={scrollRef}
        >
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
              onClick={() => navigate("/Vaga")}
            />

            <Cards
              titulo="Alunos em Estágio"
              valor="42"
              cor="purple"
              Icon={Users}
              onClick={() => navigate("/alunos-em-estagio")}
            />

            <Cards
              titulo="Alunos do 3° ano sem Estágio"
              valor="8"
              cor="red"
              Icon={AlertCircle}
              onClick={() => navigate("/alunos-sem-estagio")}
            />

            <Cards
              titulo="Relatórios 2° ano"
              valor="8"
              cor="orange"
              Icon={FileText}
              onClick={() => navigate("/relatorio-segundo-ano")}
            />

          </div>
        </div>

        {/* SETA */}
        {mostrarSeta && !fimScroll && (
          <button
            className={styles.setaScroll}
            onClick={scrollCards}
          >
            <ChevronRight size={30} />
          </button>
        )}

      </div>

      {/* ALERTAS */}
      <div className={styles.alertas}>

        <h3>Alertas e Pendências</h3>

        <div className={`${styles.alertVermelho} ${styles.redAlert}`}>
          <div className={styles.alertContent}>

            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.vermelhoTitulo}>
                8 alunos do 3° ano sem estágio
              </p>

              <p className={styles.vermelhoSubtitulo}>
                Requer atenção imediata
              </p>
            </div>

          </div>
        </div>

        <div className={`${styles.alertAmarelo} ${styles.yellowAlert}`}>
          <div className={styles.alertContent}>

            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.amareloTitulo}>
                12 alunos na lista de espera
              </p>

              <p className={styles.amareloSubtitulo}>
                Verificar vagas disponíveis
              </p>
            </div>

          </div>
        </div>

        <div className={`${styles.alertAzul} ${styles.blueAlert}`}>
          <div className={styles.alertContent}>

            <span className={styles.icon}>⚠</span>

            <div>
              <p className={styles.azulTitulo}>
                5 estágios terminam este mês
              </p>

              <p className={styles.azulSubtitulo}>
                Preparar documentação
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
} 