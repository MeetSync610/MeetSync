import "../styles/CalendarGrid.css";
import type { Block } from "../types";

type Props = {
  blocks?: Block[];
  currentDate: Date;
};

export default function CalendarGridMonth({ blocks=[], currentDate }: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="calendar-month">
      {days.map(day => {
        const dateStr = `${year}-${(month+1).toString().padStart(2,"0")}-${day.toString().padStart(2,"0")}`;
        const blocksOfDay = blocks.filter(b => b.day === dateStr);
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

        return (
          <div key={day} className={`calendar__cell ${isToday ? "today" : ""}`} style={{position:"relative"}}>
            <div className="calendar__day-number">{day}</div>
            {blocksOfDay.map((b,i) => (
              <div key={i} style={{backgroundColor:b.color, margin:"2px", padding:"2px", borderRadius:"2px"}}>
                {b.summary}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
