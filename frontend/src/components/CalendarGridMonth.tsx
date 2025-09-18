import "../styles/CalendarGrid.css";
import type { Block } from "../types";
import { Edit2, Trash2 } from "lucide-react";

type Props = { blocks?: Block[], onEdit?: (i:number)=>void, onDelete?: (i:number)=>void };
const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function CalendarGridMonth({ blocks=[], onEdit, onDelete }: Props) {
  const d = new Date();
  const month = d.getMonth();
  const year = d.getFullYear();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const emptyCells = Array.from({ length: firstWeekday }, () => null);

  return (
    <div className="calendar-month">
      {DAYS.map(d => <div key={d} className="calendar__day">{d}</div>)}
      {emptyCells.map((_, i) => <div key={`empty-${i}`} className="calendar__day empty"></div>)}
      {Array.from({ length: lastDay }, (_, i) => {
        const dayNum = i + 1;
        const dateStr = `${year}-${(month+1).toString().padStart(2,"0")}-${dayNum.toString().padStart(2,"0")}`;
        const blockHereIndex = blocks.findIndex(b => b.day === dateStr);
        const blockHere = blockHereIndex !== -1 ? blocks[blockHereIndex] : null;

        return (
          <div key={dayNum} className={`calendar__day ${blockHere ? "occupied" : ""}`} style={{backgroundColor: blockHere?.color || undefined, position:"relative"}}>
            {dayNum}
            {blockHere && (
              <>
                <div className="block-label">{blockHere.summary}</div>
                <div style={{position:"absolute", top:"2px", right:"2px", display:"flex", gap:"2px"}}>
                  <button onClick={() => onEdit?.(blockHereIndex)} style={{background:"none", border:"none"}}><Edit2 size={14}/></button>
                  <button onClick={() => onDelete?.(blockHereIndex)} style={{background:"none", border:"none"}}><Trash2 size={14}/></button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
