import "../styles/Schedule.css";
import { Plus, RefreshCcw, Link as LinkIcon } from "lucide-react";
import WeekNav from "./WeekNav";
import CalendarGrid from "./CalendarGrid";
import { Link } from "react-router-dom";

export default function Schedule() {
  return (
    <section className="schedule">
      <div className="container">
        <div className="schedule__head">
          <h1>Tu horario — vista semanal</h1>
          <WeekNav />
        </div>

        <div className="card-like">
          <div className="schedule__toolbar">
            <div className="schedule__weeklabel">Semana del 12–18 Ago</div>
            <div className="schedule__actions">
              <button className="btn-outline">
                <Plus size={16} /> Agregar bloque no disponible
              </button>
              <button className="btn-outline">
                <RefreshCcw size={16} /> Sincronizar con Google Calendar
              </button>
            </div>
          </div>

          <div className="schedule__gridwrap">
            <CalendarGrid startHour={8} endHour={22} />
          </div>

          <p className="schedule__hint">
            Cada bloque representa un horario donde no estás disponible.
          </p>
        </div>

        <div className="schedule__cta">
          <Link to="/sync" className="btn-primary">
            <LinkIcon size={18} /> Crear sincronización
          </Link>
        </div>
      </div>
    </section>
  );
}
