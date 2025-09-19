import "../styles/WeekNav.css";
import { ArrowLeft, ArrowRight, Clock4 } from "lucide-react";

type Props = {
  goToToday?: () => void;
  goPrevMonth?: () => void;
  goNextMonth?: () => void;
};

export default function MonthNav({ goToToday, goPrevMonth, goNextMonth }: Props) {
  return (
    <div className="weeknav">
      <button className="btn-outline" onClick={goPrevMonth}>
        <ArrowLeft size={16} /> Mes anterior
      </button>
      <button className="btn-outline" onClick={goNextMonth}>
        Próximo mes <ArrowRight size={16} />
      </button>
      <button className="btn-primary" onClick={goToToday}>
        <Clock4 size={18} /> Hoy
      </button>
    </div>
  );
}
