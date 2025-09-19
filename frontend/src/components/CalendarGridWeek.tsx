import "../styles/CalendarGrid.css";
import type { Block } from "../types";
import { Edit2, Trash2 } from "lucide-react";

type Props = {
  startHour?: number;
  endHour?: number;
  blocks?: Block[];
  currentDate: Date;
  onEdit?: (index:number)=>void;
  onDelete?: (index:number)=>void;
};

const DAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export default function CalendarGridWeek({ startHour=0, endHour=24, blocks=[], currentDate, onEdit, onDelete }: Props) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Fecha del domingo de la semana mostrada
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  return (
    <div className="calendar-week">
      <div className="calendar__corner" />
      {DAYS.map(d => <div key={d} className="calendar__day">{d}</div>)}
      {hours.map(h => <HourRow key={h} hour={h} blocks={blocks} startOfWeek={startOfWeek} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

function HourRow({ hour, blocks, startOfWeek, onEdit, onDelete }: { hour:number, blocks:Block[], startOfWeek:Date, onEdit?: (i:number)=>void, onDelete?: (i:number)=>void }) {
  return (
    <>
      <div className="calendar__hour">{hour.toString().padStart(2,"0")}:00</div>
      {Array.from({ length: 7 }).map((_, dayIndex) => {
        // Calculamos la fecha exacta del día de la semana
        const cellDate = new Date(startOfWeek);
        cellDate.setDate(startOfWeek.getDate() + dayIndex);

        const blockHereIndex = blocks.findIndex(b => {
          const blockDate = new Date(b.day + "T00:00:00-03:00");
          return blockDate.toDateString() === cellDate.toDateString() &&
                 parseInt(b.start.split(":")[0]) <= hour &&
                 parseInt(b.finish.split(":")[0]) > hour;
        });

        const blockHere = blockHereIndex !== -1 ? blocks[blockHereIndex] : null;

        return (
          <div key={dayIndex} className={`calendar__cell ${blockHere?"occupied":""}`} style={{backgroundColor: blockHere?.color}}>
            {blockHere && (
              <>
                <span>{blockHere.summary}</span>
                <div style={{position:"absolute", top:"2px", right:"2px", display:"flex", gap:"2px"}}>
                  <button onClick={() => onEdit?.(blockHereIndex)} style={{background:"none", border:"none"}}><Edit2 size={14}/></button>
                  <button onClick={() => onDelete?.(blockHereIndex)} style={{background:"none", border:"none"}}><Trash2 size={14}/></button>
                </div>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
