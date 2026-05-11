import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
  ChevronRight,
} from "lucide-react";

import "../../styles/global.css";

import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";

export default function Painel() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const [mostrarSeta, setMostrarSeta] = useState(false);
  const [fimScroll, setFimScroll] = useState(false);

  // SCROLL COM MOUSE
  const handleWheel = (e) => {
    e.preventDefault();

    scrollRef.current.scrollLeft += e.deltaY;
  };

  // VERIFICA SE TEM SCROLL
  useEffect(() => {
    const verificarScroll = () => {
      const el = scrollRef.current;

      if (!el) return;

      // mostra seta se tiver scroll horizontal
      setMostrarSeta(el.scrollWidth > el.clientWidth);

      // esconde seta quando chegar no final
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
    <div className="painel">
      <h1 className="titulo">Painel CIEC</h1>

      <p className="sub">
        Visão geral do Sistema de Gerenciamento de Estágios
      </p>

      {/* WRAPPER */}
      <div className="cards-wrapper">

        {/* CONTAINER COM SCROLL */}
        <div
          className="cards-container"
          ref={scrollRef}
          onWheel={handleWheel}
        >
          <div className="cards">

            <div
              className="card green"
              onClick={() => navigate("/")}
            >
              <Building2 className="icon-card" />

              <h3>Empresas Cadastradas</h3>

              <span>24</span>
            </div>

            <div
              className="card blue"
              onClick={() => navigate("/vaga")}
            >
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
        </div>

        {/* SETA FLUTUANTE */}
        {mostrarSeta && !fimScroll && (
          <button
            className="seta-scroll"
            onClick={scrollCards}
          >
            <ChevronRight size={30} />
          </button>
        )}

      </div>

      {/* ALERTAS */}
      <div className="alertas">

        <h3 className="tituloAlerta">
          Alertas e Pendências
        </h3>

        <div className="alert red-alert">
          <div className="alert-content">

            <span>⚠</span>

            <div>
              <p>8 alunos do 3° ano sem estágio</p>

              <small>
                Requer atenção imediata
              </small>
            </div>

          </div>
        </div>

        <div className="alert yellow-alert">
          <div className="alert-content">

            <span>⚠</span>

            <div>
              <p>12 alunos na lista de espera</p>

              <small>
                Verificar vagas disponíveis
              </small>
            </div>

          </div>
        </div>

        <div className="alert blue-alert">
          <div className="alert-content">

            <span>⚠</span>

            <div>
              <p>5 estágios terminam este mês</p>

              <small>
                Preparar documentação
              </small>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}