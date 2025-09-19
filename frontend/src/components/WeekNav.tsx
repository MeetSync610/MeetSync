import "../styles/WeekNav.css";
import { ArrowLeft, ArrowRight, Clock4 } from "lucide-react";

type Props = {
  goToToday?: () => void;
  goPrevWeek?: () => void;
  goNextWeek?: () => void;
};

export default function WeekNav({ goToToday, goPrevWeek, goNextWeek }: Props) {
  return (
    <div className="weeknav">
      <button className="btn-outline" onClick={goPrevWeek}>
        <ArrowLeft size={16} /> Anterior
      </button>
      <button className="btn-outline" onClick={goNextWeek}>
        Próximo <ArrowRight size={16} />
      </button>
      <button className="btn-primary" onClick={goToToday}>
        <Clock4 size={18} /> Hoy
      </button>
    </div>
  );
}
