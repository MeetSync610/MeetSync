import "../styles/Features.css";
import { Sparkles, AlarmClock, ChartBarBig, Users, Lock} from "lucide-react"

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features__inner">
        <h2> <Sparkles className="icon-sky"/> Beneficios</h2>

        <div className="features__grid">
          <div className="card"><h3> <AlarmClock className="icon-sky" size={20}/> Rápido</h3><p>Armá todo en minutos.</p></div>
          <div className="card"><h3> <ChartBarBig className="icon-sky"size={20}/> Claro</h3><p>Vista semanal minimalista.</p></div>
          <div className="card"><h3><Users className="icon-sky"size={20}/> En equipo</h3><p>Sincronizá 1 a 1 o en grupo.</p></div>
          <div className="card"><h3><Lock className="icon-sky"size={20}/> Privado</h3><p>Compartís solo lo necesario.</p></div>
        </div>

        <div className="features__actions">
          <a href="/schedule" className="btn-primary">Crear horario</a>
          <a href="/sync" className="btn-secondary">Crear sincronización</a>
        </div>
      </div>
    </section>
  );
}