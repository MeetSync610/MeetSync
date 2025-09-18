import "../styles/Schedule.css";
import { Plus, RefreshCcw, Link as LinkIcon } from "lucide-react";
import WeekNav from "./WeekNav";
import CalendarGridWeek from "./CalendarGridWeek";
import CalendarGridMonth from "./CalendarGridMonth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Block } from "../types";

export default function Schedule() {
  const day = new Date();
  const week = day.getDate() - day.getDay();
  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [view, setView] = useState(true);

  const [inputDay, setInputDay] = useState(day.toISOString().split("T")[0]);
  const [inputStart, setInputStart] = useState("08:00");
  const [inputFinish, setInputFinish] = useState("09:00");
  const [inputSummary, setInputSummary] = useState("No disponible");
  const [inputColor, setInputColor] = useState("#f87171");

  // Cargar eventos desde backend
  useEffect(() => {
    fetch("/api/calendar/events")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events) {
          const googleBlocks: Block[] = data.events.map((e: any) => ({
            day: e.start.dateTime ? e.start.dateTime.split("T")[0] : day.toISOString().split("T")[0],
            start: e.start.dateTime ? e.start.dateTime.split("T")[1].slice(0,5) : "08:00",
            finish: e.end.dateTime ? e.end.dateTime.split("T")[1].slice(0,5) : "09:00",
            summary: e.summary || "No disponible",
            color: "#60a5fa",
            googleId: e.id
          }));
          setBlocks(googleBlocks);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const showForm = (index: number | null = null) => {
    if (index !== null) {
      const b = blocks[index];
      setInputDay(b.day);
      setInputStart(b.start);
      setInputFinish(b.finish);
      setInputSummary(b.summary);
      setInputColor(b.color);
      setEditingIndex(index);
    } else {
      setInputDay(day.toISOString().split("T")[0]);
      setInputStart("08:00");
      setInputFinish("09:00");
      setInputSummary("No disponible");
      setInputColor("#f87171");
      setEditingIndex(null);
    }
    setOverlayVisible(true);
  };

  const saveBlock = () => {
    if (!inputDay || !inputStart || !inputFinish || !inputSummary) {
      alert("Faltan datos");
      return;
    }

    const newBlock: Block = {
      day: inputDay,
      start: inputStart,
      finish: inputFinish,
      summary: inputSummary,
      color: inputColor,
      googleId: editingIndex !== null ? blocks[editingIndex].googleId : undefined
    };

    let updatedBlocks = [...blocks];
    if (editingIndex !== null) {
      updatedBlocks[editingIndex] = newBlock;
    } else {
      updatedBlocks.push(newBlock);
    }
    setBlocks(updatedBlocks);
    setOverlayVisible(false);

    // Guardar/actualizar en backend
    const method = editingIndex !== null && newBlock.googleId ? "PUT" : "POST";
    const url = method === "POST" ? "/api/calendar" : `/api/calendar/${newBlock.googleId}`;
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock)
    })
    .then(res => res.json())
    .then(data => console.log("Evento guardado:", data))
    .catch(err => console.error(err));
  };

  const deleteBlock = (index: number) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    const blockToDelete = blocks[index];
    setBlocks(blocks.filter((_, i) => i !== index));
    if (blockToDelete.googleId) {
      fetch(`/api/calendar/${blockToDelete.googleId}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => console.log("Evento eliminado:", data))
        .catch(err => console.error(err));
    }
  };

  const syncCalendars = async () => {
    try {
      const res = await fetch("/auth/google/url");
      const data = await res.json();
      if (!data.url) throw new Error("No se pudo obtener la URL de Google OAuth");
      window.location.href = data.url;
    } catch (error) {
      console.error("Error sincronizando calendario:", error);
      alert("Error sincronizando calendario, revisa la consola.");
    }
  };

  return (
    <section className="schedule">
      <div className="container">
        <div className="schedule__head">
          <div>
            <h1>Tu horario - {view ? "Vista Semanal" : "Vista Mensual"}</h1>
            <button className="btn-outline" onClick={() => setView(!view)}>Cambiar Vista</button>
          </div>
          <WeekNav />
        </div>

        <div className="card-like">
          <div className="schedule__toolbar">
            {view ? (
              <div className="schedule__weeklabel">Semana del {week} al {week + 6} de {monthNames[day.getMonth()]}</div>
            ) : (
              <div className="schedule__weeklabel">{monthNames[day.getMonth()]}</div>
            )}
            <div className="schedule__actions">
              <button className="btn-outline" onClick={() => showForm()}>
                <Plus size={16}/> Agregar bloque
              </button>
              <button className="btn-outline" onClick={syncCalendars}>
                <RefreshCcw size={16}/> Sincronizar Google
              </button>
            </div>
          </div>

          <div className="schedule__gridwrap">
            {view ? (
              <CalendarGridWeek blocks={blocks} onEdit={showForm} onDelete={deleteBlock} />
            ) : (
              <CalendarGridMonth blocks={blocks} onEdit={showForm} onDelete={deleteBlock} />
            )}
          </div>

          <p className="schedule__hint">Cada bloque representa un horario donde no estás disponible.</p>
        </div>

        <div className="schedule__cta">
          <Link to="/sync" className="btn-primary">
            <LinkIcon size={18}/> Crear sincronización
          </Link>
        </div>
      </div>

      <div className="overlay" style={{display: overlayVisible ? "flex" : "none"}}>
        <div className="setBlock">
          <label>Día:</label>
          <input type="date" value={inputDay} onChange={e => setInputDay(e.target.value)} />
          <br/>
          <label>Inicio:</label>
          <input type="time" value={inputStart} onChange={e => setInputStart(e.target.value)} />
          <br/>
          <label>Fin:</label>
          <input type="time" value={inputFinish} onChange={e => setInputFinish(e.target.value)} />
          <br/>
          <label>Nombre:</label>
          <input type="text" value={inputSummary} onChange={e => setInputSummary(e.target.value)} />
          <br/>
          <label>Color:</label>
          <input type="color" value={inputColor} onChange={e => setInputColor(e.target.value)} />
          <br/>
          <button onClick={saveBlock}>Aceptar</button>
          <button onClick={() => setOverlayVisible(false)}>Cancelar</button>
        </div>
      </div>
    </section>
  );
}
