import "../styles/WeekNav.css";
import { ArrowLeft, ArrowRight, Clock4 } from "lucide-react";

export default function WeekNav() {
  return (
    <div className="weeknav">
      <button className="btn-outline">
        <ArrowLeft size={16} /> Semana anterior
      </button>
      <button className="btn-outline">
        Próxima semana <ArrowRight size={16} />
      </button>
      <button className="btn-primary">
        <Clock4 size={18} /> Hoy
      </button>
    </div>
  );
}
