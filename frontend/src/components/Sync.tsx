import { useState } from "react";
import "../styles/Sync.css";
import "../styles/PersonPickItem.css";
import { Link } from "react-router-dom";
import SectionCard from "./SectionCard";
import Schedule from "./Schedule";
import { useAuthContext } from "../contexts/AuthContext";
import { Calendar as CalendarIcon } from "lucide-react";

export default function Sync() {
  const [show, setShow] = useState<boolean>(false);
  const [toSyncMany, setToSyncMany] = useState<string[]>([]);
  const [toSync, setToSync] = useState<string>();
  const {
    friends,
    syncBlocks,
    sync,
  } = useAuthContext();

  const handleSyncMany = (userId: string) => {
    const newToSync = toSyncMany.includes(userId)
      ? toSyncMany.filter((e) => e !== userId)
      : [...toSyncMany, userId];

    setToSyncMany(newToSync);
    if (newToSync[0]) {
      sync(newToSync); // Usamos la copia actualizada
      setShow(true);
    } else if(toSync) sync([toSync]);
    else setShow(false);
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
                {friends.map((frn, i) => (
                  <label className="ppick" key={i + "l"}>
                    <input type="radio" name="1to1" value={frn.id} onChange={() => { sync([frn.id]); setToSync(frn.id); setShow(true) }} key={i + "i"}/>
                    <div className="ppick__avatar" key={i + "d"}/>
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
                {friends.map((frn, i) => (
                  <label className="ppick" key={-i + "l"}>
                    <input type="checkbox" name="many" value={frn.id} onChange={() => handleSyncMany(frn.id)} key={-i + "i"}/>
                    <div className="ppick__avatar" key={-i + "d"}/>
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
        {show && (<Schedule syncBlocks={syncBlocks}></Schedule>)}
      </div>
    </section>
  );
}
