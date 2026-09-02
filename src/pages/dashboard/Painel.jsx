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

import { Card, PageHeader } from "../../components/ui";

import styles from "./Painel.module.css";

const TONS = new Map(Object.entries(styles));

// Roxo e laranja não têm token semântico dedicado; reaproveitam marca e aviso.
// A distinção entre indicadores não depende só da cor: ícone e título diferem.
const INDICADORES = [
  {
    titulo: "Empresas Cadastradas",
    valor: "24",
    tom: "brandStrong",
    Icon: Building2,
    destino: "/empresa",
  },
  {
    titulo: "Vagas Disponíveis",
    valor: "15",
    tom: "info",
    Icon: Briefcase,
    destino: "/Vaga",
  },
  {
    titulo: "Alunos em Estágio",
    valor: "42",
    tom: "brand",
    Icon: Users,
    destino: "/alunos-em-estagio",
  },
  {
    titulo: "Alunos do 3° ano sem Estágio",
    valor: "8",
    tom: "danger",
    Icon: AlertCircle,
    destino: "/alunos-sem-estagio",
  },
  {
    titulo: "Relatórios 2° ano",
    valor: "8",
    tom: "warning",
    Icon: FileText,
    destino: "/relatorio-segundo-ano",
  },
];

const ALERTAS = [
  {
    tom: "danger",
    titulo: "8 alunos do 3° ano sem estágio",
    subtitulo: "Requer atenção imediata",
  },
  {
    tom: "warning",
    titulo: "12 alunos na lista de espera",
    subtitulo: "Verificar vagas disponíveis",
  },
  {
    tom: "info",
    titulo: "5 estágios terminam este mês",
    subtitulo: "Preparar documentação",
  },
];

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
      <PageHeader
        title="Painel CIEC"
        description="Visão geral do Sistema de Gerenciamento de Estágios"
      />

      {/* WRAPPER */}
      <div className={styles.cardsWrapper}>

        {/* CONTAINER COM SCROLL */}
        <div
          className={styles.cardsContainer}
          ref={scrollRef}
        >
          <div className={styles.cards}>
            {INDICADORES.map(({ titulo, valor, tom, Icon, destino }) => (
              <Card
                key={titulo}
                elevated
                onClick={() => navigate(destino)}
                className={styles.indicadorCard}
              >
                <span
                  className={[styles.indicadorIcone, TONS.get(tom)]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {Icon && <Icon aria-hidden="true" className={styles.iconCard} />}
                </span>

                <h3 className={styles.indicadorTitulo}>{titulo}</h3>

                <span className={styles.indicadorValor}>{valor}</span>
              </Card>
            ))}
          </div>
        </div>

        {/* SETA */}
        {mostrarSeta && !fimScroll && (
          <button
            type="button"
            className={styles.setaScroll}
            onClick={scrollCards}
            aria-label="Ver mais indicadores"
          >
            <ChevronRight size={30} aria-hidden="true" />
          </button>
        )}

      </div>

      {/* ALERTAS */}
      <Card elevated className={styles.alertas}>
        <h3 className={styles.alertasTitulo}>Alertas e Pendências</h3>

        {ALERTAS.map(({ tom, titulo, subtitulo }) => (
          <div
            key={titulo}
            className={[styles.alerta, TONS.get(`alerta-${tom}`)]
              .filter(Boolean)
              .join(" ")}
          >
            <AlertCircle aria-hidden="true" className={styles.alertaIcone} />

            <div>
              <p className={styles.alertaTitulo}>{titulo}</p>
              <p className={styles.alertaSubtitulo}>{subtitulo}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
