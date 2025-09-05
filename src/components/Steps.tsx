import "../styles/Steps.css";
import { ListChecks, CalendarDays, Link as LinkIcon, SearchCode } from "lucide-react"
export default function Steps() {
  return (
    <section className="steps" id="how">
      <div className="steps__inner">
        <h2> <ListChecks className="icon-sky" /> Pasos simples</h2>
        <div className="steps__grid">
          <div className="card">
            <div className="card__head">
              <span className="badge">Paso 1</span>
            </div>
            <h3> <CalendarDays className="icon-sky" size={20}/> Creá tu horario</h3>
            <p>Marcá tus no-disponibles en la semana.</p>
          </div>

          <div className="card">
            <div className="card__head">
              <span className="badge">Paso 2</span>
            </div>
            <h3> <LinkIcon className="icon-sky" size={20}/> Sincronizá con amigos</h3>
            <p>Elegí con quién o armá un grupo.</p>
          </div>

          <div className="card">
            <div className="card__head">
              <span className="badge">Paso 3</span>
            </div>
            <h3> <SearchCode className="icon-sky" size={20}/> Encontrá el hueco</h3>
            <p>Listo, <span className="accent">MeetSync</span> encuentra el mejor horario comun</p>
          </div>
        </div>
      </div>
    </section>
  );
}