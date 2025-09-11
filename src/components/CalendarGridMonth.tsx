import "../styles/CalendarGrid.css";

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarGridMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  const days = Array.from({ length: d.getDate() }, (_, i) => i + 1);
  d.setDate(1);
  const prevDays = Array.from({ length: d.getDay() }, (_,i) => i + 1)

  return (
    <div className="calendar-month">
      {/* fila 0: nombres de días */}
      {DAYS.map((d) => (
        <div key={d} className="calendar__day">{d}</div>
      ))}

      {/*  fila 1: días previos  */}
      {prevDays.map((d) => (
        <div key={d} className="calendar__day"></div>
      ))}

      {/* filas de semanas */}
      {days.map((d) => (
        <div className="calendar__hour">{d}</div>
      ))}
    </div>
  );
}
