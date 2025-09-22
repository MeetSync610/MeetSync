import { useState, useEffect } from "react";
import "../styles/Sync.css";
import { Link } from "react-router-dom";
import { Link as LinkIcon, Link2, UserPlus, Calendar } from "lucide-react";
import SectionCard from "./SectionCard";
import PersonPickItem from "./PersonPickItem";
import type { user } from "./Friends";

export default function Sync() {

  const [friends, setFriends] = useState([]);

  useEffect( () => {
    fetch(`http://localhost:3000/api/friends`)
     .then((res) => res.json())
     .then((data) => setFriends(data))
     .catch((err) => console.error("Error al traer amigos:", err));
  }, [])

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
                {friends && friends.map((frn: user, i) => (
                  <PersonPickItem key={i} name={frn.name} mode="radio" group="peer" />
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
                {friends && friends.map((frn: user, i) => (
                  <PersonPickItem key={-i} name={frn.name} mode="checkbox" />
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
