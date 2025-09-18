import "../styles/Sync.css";
import { Link } from "react-router-dom";
import { Link as LinkIcon, Link2, UserPlus, Calendar } from "lucide-react";
import SectionCard from "./SectionCard";
import PersonPickItem from "./PersonPickItem";

const MOCK_FRIENDS = ["Billy", "Mati", "Leo"];

export default function Sync() {
  return (
    <section className="sync">
      <div className="container">
        <div className="sync__card">
          <h1 className="sync__title">Crear sincronización</h1>

          <div className="sync__grid">
            {/* 1 a 1 */}
            <SectionCard
              title="1 a 1"
              description="Elegí un amigo para cruzar horarios."
            >
              <div className="sync__list">
                {MOCK_FRIENDS.map((n) => (
                  <PersonPickItem key={n} name={n} mode="radio" group="peer" />
                ))}
              </div>
              <button className="btn-primary sync__btn">
                <LinkIcon size={18} /> Sincronizar 1 a 1
              </button>
            </SectionCard>

            {/* Grupo */}
            <SectionCard
              title="Grupo"
              description="Armá un grupo y cruzá horarios de todos."
            >
              <div className="sync__list">
                {MOCK_FRIENDS.map((n) => (
                  <PersonPickItem key={n} name={n} mode="checkbox" />
                ))}
              </div>

              <div className="sync__actions">
                <button className="btn-outline">
                  <UserPlus size={16} /> Invitar por link
                </button>
                <button className="btn-primary">
                  <Link2 size={18} /> Crear sincronización grupal
                </button>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="sync__back">
          <Link to="/schedule" className="btn-outline">
            <Calendar size={16} /> Volver a tu horario
          </Link>
        </div>
      </div>
    </section>
  );
}
