import "../styles/CalendarGrid.css";

type Props = {
  startHour?: number; // 8
  endHour?: number;   // 22
};

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function CalendarGrid({ startHour = 8, endHour = 22 }: Props) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="calendar">
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
        <div key={i} className="calendar__cell" />
      ))}
    </>
  );
}
