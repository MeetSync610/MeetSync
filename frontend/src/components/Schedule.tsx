import "../styles/Schedule.css";
import { Plus, RefreshCcw, Link as LinkIcon } from "lucide-react";
import WeekNav from "./WeekNav";
import MonthNav from "./MonthNav";
import CalendarGridWeek from "./CalendarGridWeek";
import CalendarGridMonth from "./CalendarGridMonth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Block } from "../types";

export default function Schedule() {
  const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const API_BASE = import.meta.env.VITE_API_URL ?? 
    (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "https://meetsync-9g91.onrender.com/api");

  // --- Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [view, setView] = useState(true);

  const [inputDay, setInputDay] = useState(new Date().toISOString().split("T")[0]);
  const [inputStart, setInputStart] = useState("08:00");
  const [inputFinish, setInputFinish] = useState("09:00");
  const [inputSummary, setInputSummary] = useState("No disponible");
  const [inputColor, setInputColor] = useState("#f87171");

  // --- Google OAuth y eventos
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("success") === "true") {
      url.searchParams.delete("success");
      window.history.replaceState({}, document.title, url.pathname);
      fetchGoogleEvents();
    }
  }, []);

  const fetchGoogleEvents = () => {
    fetch(`${API_BASE}/calendar/events`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.events) {
          const googleBlocks: Block[] = data.events.map((event: any) => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            return {
              id: event.id,
              googleId: event.id,
              day: start.toISOString().split("T")[0],
              start: start.toTimeString().slice(0,5),
              finish: end.toTimeString().slice(0,5),
              summary: event.summary || "Sin título",
              color: "#60a5fa",
            };
          });
          setBlocks(googleBlocks);
        }
      })
      .catch(err => console.error("fetch events error:", err));
  };

  useEffect(() => { fetchGoogleEvents(); }, []);

  // --- Navegación semanal
  const goToToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  setCurrentDate(today);

  const todayStr = today.toISOString().split("T")[0];

  // Revisar si ya existe
  const exists = blocks.some(
    b => b.day === todayStr && b.start === "08:00" && b.finish === "09:00"
  );
  if (exists) return;

  const newBlock: Block = {
    day: todayStr,
    start: "08:00",
    finish: "09:00",
    summary: "No disponible",
    color: "#f87171",
  };

  // --- Guardar en Google Calendar vía API
  fetch(`${API_BASE}/calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newBlock),
  })
    .then(res => res.json())
    .then(data => {
      if (data?.data?.id) {
        // Solo agregamos el bloque local **después de que Google devuelva el ID**
        setBlocks(prev => [...prev, { ...newBlock, googleId: data.data.id }]);
      }
    })
    .catch(err => console.error("Error creando bloque en Google:", err));
};



  const goPrevWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; });
  const goNextWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; });

  // --- Navegación mensual
  const goPrevMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; });
  const goNextMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; });

  // --- Formulario de bloques
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
      setInputDay(new Date().toISOString().split("T")[0]);
      setInputStart("08:00");
      setInputFinish("09:00");
      setInputSummary("No disponible");
      setInputColor("#f87171");
      setEditingIndex(null);
    }
    setOverlayVisible(true);
  };

  const saveBlock = () => {
    if (!inputDay || !inputStart || !inputFinish || !inputSummary) return alert("Faltan datos");

    const newBlock: Block = {
      day: inputDay,
      start: inputStart,
      finish: inputFinish,
      summary: inputSummary,
      color: inputColor,
      googleId: editingIndex !== null ? blocks[editingIndex].googleId : undefined,
    };

    let updatedBlocks = [...blocks];
    if (editingIndex !== null) updatedBlocks[editingIndex] = newBlock;
    else updatedBlocks.push(newBlock);
    setBlocks(updatedBlocks);
    setOverlayVisible(false);

    const method = editingIndex !== null && newBlock.googleId ? "PUT" : "POST";
    const url = method === "POST" ? `${API_BASE}/calendar` : `${API_BASE}/calendar/${newBlock.googleId}`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlock),
    })
    .then(res => res.json())
    .then(data => {
      if (method === "POST" && data?.data?.id) {
        const createdId = data.data.id;
        setBlocks(prev => prev.map(b =>
          !b.googleId && b.day === newBlock.day && b.start === newBlock.start && b.finish === newBlock.finish && b.summary === newBlock.summary
            ? { ...b, googleId: createdId }
            : b
        ));
      }
    })
    .catch(err => console.error("saveBlock error:", err));
  };

  const deleteBlock = (index: number) => {
    if (!confirm("¿Eliminar este bloque?")) return;
    const blockToDelete = blocks[index];
    setBlocks(blocks.filter((_, i) => i !== index));
    if (blockToDelete.googleId) fetch(`${API_BASE}/calendar/${blockToDelete.googleId}`, { method:"DELETE" });
  };

  const syncCalendars = async () => {
    try {
      const res = await fetch(`${API_BASE.replace(/\/api$/, "")}/auth/google/url`);
      const data = await res.json();
      if (!data.url) throw new Error("No se pudo obtener URL");
      window.location.href = data.url;
    } catch (err) { console.error(err); alert("Error sincronizando calendario"); }
  };

  // --- Semana inicial y final para mostrar en la cabecera
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return (
    <section className="schedule">
      <div className="container">
        <div className="schedule__head">
          <div>
            <h1>Tu horario - {view ? "Vista Semanal" : "Vista Mensual"}</h1>
            <button className="btn-outline" onClick={() => setView(!view)}>Cambiar Vista</button>
          </div>
          {view ? (
            <WeekNav goPrevWeek={goPrevWeek} goNextWeek={goNextWeek} goToToday={goToToday} />
          ) : (
            <MonthNav goPrevMonth={goPrevMonth} goNextMonth={goNextMonth} goToToday={goToToday} />
          )}
        </div>

        <div className="card-like">
          <div className="schedule__toolbar">
            {view ? (
              <div className="schedule__weeklabel">
                Semana del {startOfWeek.getDate()} al {endOfWeek.getDate()} de {monthNames[currentDate.getMonth()]}
              </div>
            ) : (
              <div className="schedule__weeklabel">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </div>
            )}
            <div className="schedule__actions">
              <button className="btn-outline" onClick={() => showForm()}><Plus size={16}/> Agregar bloque</button>
              <button className="btn-outline" onClick={syncCalendars}><RefreshCcw size={16}/> Sincronizar Google</button>
            </div>
          </div>

          <div className="schedule__gridwrap">
            {view ? (
              <CalendarGridWeek blocks={blocks} currentDate={currentDate} onEdit={showForm} onDelete={deleteBlock} />
            ) : (
              <CalendarGridMonth blocks={blocks} currentDate={currentDate} onEdit={showForm} onDelete={deleteBlock} />
            )}
          </div>
          <p className="schedule__hint">Cada bloque representa un horario donde no estás disponible.</p>
        </div>

        <div className="schedule__cta">
          <Link to="/sync" className="btn-primary"><LinkIcon size={18}/> Crear sincronización</Link>
        </div>
      </div>

      {overlayVisible && (
        <div className="overlay" style={{display:"flex"}}>
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
      )}
    </section>
  );
}
