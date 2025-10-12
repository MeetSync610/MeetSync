import { useState, useEffect } from "react";
import "../styles/Sync.css";
import "../styles/PersonPickItem.css";
import { Link } from "react-router-dom";
import SectionCard from "./SectionCard";
import Schedule from "./Schedule";
import { useAuthContext } from "../contexts/AuthContext";
import { Calendar as CalendarIcon } from "lucide-react";

type User = {
  id: number;
  name: string;
};

export default function Sync() {
  const [friends, setFriends] = useState<User[]>([]);
  const [toSyncMany, setToSyncMany] = useState<number[]>([]);
  const [show, setShow] = useState<boolean>(false);

  const { syncBlocks, sync1to1, syncMany } = useAuthContext();

  useEffect(() => {
    console.log(syncBlocks);
  }, [syncBlocks]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/friends`)
      .then((res) => res.json())
      .then((data: User[]) => setFriends(data))
      .catch((err) => console.error("Error al traer amigos:", err));
  }, []);

  const handleSyncMany = (userId: number) => {
    const newToSync = toSyncMany.includes(userId)
      ? toSyncMany.filter((e) => e !== userId)
      : [...toSyncMany, userId];

    setToSyncMany(newToSync);
    syncMany(newToSync); // Usamos la copia actualizada
    setShow(true);
  };

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
                {friends.map((frn) => (
                  <label className="ppick" key={frn.id}>
                    <input
                      type="radio"
                      name="1to1"
                      value={frn.id}
                      onChange={() => { sync1to1(frn.id); setShow(true); }}
                    />
                    <div className="ppick__avatar" />
                    <span className="ppick__name">{frn.name}</span>
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* Grupo */}
            <SectionCard
              title="Grupo"
              description="Armá un grupo y cruzá horarios de todos."
            >
              <div className="sync__list">
                {friends.map((frn) => (
                  <label className="ppick" key={frn.id}>
                    <input
                      type="checkbox"
                      name="many"
                      value={frn.id}
                      onChange={() => handleSyncMany(frn.id)}
                    />
                    <div className="ppick__avatar" />
                    <span className="ppick__name">{frn.name}</span>
                  </label>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="sync__back">
          <Link to="/schedule" className="btn-outline">
            <CalendarIcon size={16} /> Volver a tu horario
          </Link>
        </div>
      </div>

      {show && <Schedule />}
    </section>
  );
}
