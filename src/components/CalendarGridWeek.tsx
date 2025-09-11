import "../styles/CalendarGrid.css";

type Props = {
  startHour?: number; // 0
  endHour?: number;   // 24
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarGridWeek({ startHour = 0, endHour = 24 }: Props) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="calendar-week">
      {/* fila 0: esquina vacía + nombres de días */}
      <div className="calendar__corner" />
      {DAYS.map((d) => (
        <div key={d} className="calendar__day">{d}</div>
      ))}

      {/* filas de horas */}
      {hours.map((h) => (
        <HourRow key={h} hour={h} />
      ))}
    </div>
  );
}

function HourRow({ hour }: { hour: number }) {
  const label = `${hour.toString().padStart(2, "0")}:00`;
  return (
    <>
      <div className="calendar__hour">{label}</div>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} id={i + "-" + hour} className="calendar__cell" />
      ))}
    </>
  );
}
