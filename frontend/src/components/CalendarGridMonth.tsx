// src/components/CalendarGridMonth.tsx
import "../styles/CalendarGrid.css";
import type { Block } from "../types";
import { getTextColorForBackground } from "../utils/colorUtils";

type Props = {
  blocks?: Block[];
  currentDate: Date;
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function CalendarGridMonth({ blocks = [], currentDate }: Props) {
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const cells = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    const dayNumber = i - startDay + 1;
    if (dayNumber < 1) return null;

    const dateString = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

    const blocksHere = blocks.filter((b) => b.day === dateString);

    return { dayNumber, blocksHere };
  });

  return (
    <div className="calendar-month">
      {DAYS.map((d) => (
        <div key={d} className="calendar__day">
          {d}
        </div>
      ))}
      {cells.map((cell, index) => {
        if (!cell) return <div key={index} className="calendar__cell"></div>;

        return (
          <div key={index} className="calendar__cell">
            <div className="calendar-month-day-number">{cell.dayNumber}</div>

            {cell.blocksHere.map((b, idx) => {
              const textColor = getTextColorForBackground(b.color);
              return (
                <div
                  key={idx}
                  className="block-label"
                  style={{
                    backgroundColor: b.color,
                    color: textColor,
                    borderRadius: "8px",
                  }}
                >
                  {b.summary}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
