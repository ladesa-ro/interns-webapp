import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState, useCallback } from "react";

import { Card, ErrorState, LoadingState, PageHeader } from "../../components/ui";
import { buscarIndicadoresPainel } from "../../utils/dashboardApi";

import styles from "./Painel.module.css";

const TONS = new Map(Object.entries(styles));

function obterValorIndicador(indicadores, chave) {
  if (!indicadores) return 0;
  switch (chave) {
    case "empresas": return indicadores.empresas ?? 0;
    case "vagas": return indicadores.vagas ?? 0;
    case "alunosEmEstagio": return indicadores.alunosEmEstagio ?? 0;
    case "alunosSemEstagio": return indicadores.alunosSemEstagio ?? 0;
    case "relatoriosSegundoAno": return indicadores.relatoriosSegundoAno ?? 0;
    default: return 0;
  }
}

// Roxo e laranja não têm token semântico dedicado; reaproveitam marca e aviso.
// A distinção entre indicadores não depende só da cor: ícone e título diferem.
const INDICADORES = [
  {
    titulo: "Empresas Cadastradas",
    chave: "empresas",
    tom: "brandStrong",
    Icon: Building2,
    destino: "/empresa",
  },
  {
    titulo: "Vagas Disponíveis",
    chave: "vagas",
    tom: "info",
    Icon: Briefcase,
    destino: "/Vaga",
  },
  {
    titulo: "Alunos em Estágio",
    chave: "alunosEmEstagio",
    tom: "brand",
    Icon: Users,
    destino: "/alunos-em-estagio",
  },
  {
    titulo: "Alunos do 3° ano sem Estágio",
    chave: "alunosSemEstagio",
    tom: "danger",
    Icon: AlertCircle,
    destino: "/alunos-sem-estagio",
  },
  {
    titulo: "Relatórios 2° ano",
    chave: "relatoriosSegundoAno",
    tom: "warning",
    Icon: FileText,
    destino: "/relatorio-segundo-ano",
  },
];

export default function Painel() {
  const navigate = useNavigate();
  const [indicadores, setIndicadores] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const scrollRef = useRef(null);
  const ativoRef = useRef(true);

  const [mostrarSeta, setMostrarSeta] = useState(false);
  const [fimScroll, setFimScroll] = useState(false);

  const carregarIndicadores = useCallback(async () => {
    if (!ativoRef.current) return;
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarIndicadoresPainel();
      if (ativoRef.current) setIndicadores(dados);
    } catch (error) {
      if (ativoRef.current) setErro(error);
    } finally {
      if (ativoRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const tarefa = Promise.resolve().then(carregarIndicadores);
    return () => {
      ativoRef.current = false;
      tarefa.catch(() => {});
    };
  }, [carregarIndicadores]);

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
            {INDICADORES.map(({ titulo, chave, tom, Icon, destino }) => (
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

                <span className={styles.indicadorValor} aria-label={carregando ? "Carregando" : undefined}>
                  {carregando ? "..." : erro ? "-" : obterValorIndicador(indicadores, chave)}
                </span>
              </Card>
            ))}
          </div>
        </div>

        {carregando && <LoadingState message="Carregando indicadores..." />}
        {erro && (
          <ErrorState
            title="Não foi possível carregar os indicadores"
            message="Verifique sua conexão e tente novamente."
            onRetry={carregarIndicadores}
          />
        )}

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

        {[
          {
            tom: "danger",
            titulo: `${indicadores?.alunosSemEstagio ?? 0} alunos do 3° ano sem estágio`,
            subtitulo: "Requer atenção imediata",
          },
          {
            tom: "warning",
            titulo: `${indicadores?.alunosListaEspera ?? 0} alunos na lista de espera`,
            subtitulo: "Verificar vagas disponíveis",
          },
          {
            tom: "info",
            titulo: `${indicadores?.estagiosQueTerminamEsteMes ?? 0} estágios terminam este mês`,
            subtitulo: "Preparar documentação",
          },
        ].map(({ tom, titulo, subtitulo }) => (
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
