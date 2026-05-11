import "./vaga.css";
import "../../styles/global.css";
export default function Vaga() {
  return (
    <div className="vaga">
      <div className="content">
        <h2 className="titulo">← Painel CIEC</h2>
        <p className="sub">Vagas Disponíveis</p>

        <div className="cards">
          <div className="card">
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475" />
            <div className="card-body">
              <h3>Informática</h3>
              <span>24</span>
            </div>
          </div>

          <div className="card">
            <img src="https://static.todamateria.com.br/upload/fi/si/fisicoquimicacke1.jpg" />
            <div className="card-body">
              <h3>Química</h3>
              <span>24</span>
            </div>
          </div>

          <div className="card">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" />
            <div className="card-body">
              <h3>Florestas</h3>
              <span>24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}