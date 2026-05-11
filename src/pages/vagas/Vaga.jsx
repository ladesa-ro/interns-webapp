import "./vaga.css";
import "../../styles/global.css";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Vaga() {
  const navigate = useNavigate();

  return (
    <div className="vaga">

      <div className="content">

        {/* TOPO */}
        <div
          className="topo-vaga"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={22} />

          <h2 className="titulo">
            Painel CIEC
          </h2>
        </div>

        <p className="sub">
          Vagas Disponíveis
        </p>

        {/* CARDS */}
        <div className="cards-vagas">

          {/* CARD */}
          <div className="card-vaga">

            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475"
              alt="Informática"
            />

            <div className="card-body">
              <h3>Informática</h3>

              <span>24 vagas</span>
            </div>

          </div>

          {/* CARD */}
          <div className="card-vaga">

            <img
              src="https://static.todamateria.com.br/upload/fi/si/fisicoquimicacke1.jpg"
              alt="Química"
            />

            <div className="card-body">
              <h3>Química</h3>

              <span>24 vagas</span>
            </div>

          </div>

          {/* CARD */}
          <div className="card-vaga">

            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470"
              alt="Florestas"
            />

            <div className="card-body">
              <h3>Florestas</h3>

              <span>24 vagas</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}