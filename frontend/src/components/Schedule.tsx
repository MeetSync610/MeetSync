import "../styles/Schedule.css";
import { Plus, RefreshCcw, Link as LinkIcon } from "lucide-react";
import WeekNav from "./WeekNav";
import MonthNav from "./MonthNav";
import CalendarGridWeek from "./CalendarGridWeek";
import CalendarGridMonth from "./CalendarGridMonth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Block } from "../types";
import { useAuthContext } from "../contexts/AuthContext";

type Props = {
  syncBlocks?: Block[];
};

export default function Schedule({ syncBlocks }: Props) {
  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];
  const API_BASE =
    import.meta.env.VITE_API_URL ??
    (import.meta.env.MODE === "development"
      ? "http://localhost:3000/api"
      : "https://meetsync-9g91.onrender.com/api");

  const { session } = useAuthContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [view, setView] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  const [googleIds, setGoogleIds] = useState<string[]>([]);

  const [inputDay, setInputDay] = useState(new Date().toISOString().split("T")[0]);
  const [inputStart, setInputStart] = useState("08:00");
  const [inputFinish, setInputFinish] = useState("09:00");
  const [inputSummary, setInputSummary] = useState("No disponible");
  const [inputColor, setInputColor] = useState("#f87171");

  // -------------------- LOCAL STORAGE --------------------
  useEffect(() => {
  if (syncBlocks?.length) {
    setBlocks(syncBlocks);
    console.log("Bloques sincronizados:", syncBlocks);
  } else {
    const savedBlocks = localStorage.getItem("blocks");
    if (savedBlocks) {
      setBlocks(JSON.parse(savedBlocks));
      console.log("Bloques desde localStorage:", JSON.parse(savedBlocks));
    }
  }
}, [syncBlocks]);


  useEffect(() => {
    if (!syncBlocks) localStorage.setItem("blocks", JSON.stringify(blocks));
  }, [blocks]);

  // -------------------- MERGE SIN DUPLICADOS --------------------
  const normalizeTime = (t: string) => t.slice(0, 5);

  const mergeBlocks = (prev: Block[], newBlocks: Block[]): Block[] => {
    const merged: Block[] = [...prev];

    newBlocks.forEach(nb => {
      const nbStart = normalizeTime(nb.start);
      const nbFinish = normalizeTime(nb.finish);

      // buscamos si ya existe un bloque igual
      const existingIndex = merged.findIndex(b =>
        (b.id && nb.id && b.id === nb.id) ||
        (b.googleId && nb.googleId && b.googleId === nb.googleId) ||
        (
          b.day === nb.day &&
          normalizeTime(b.start) === nbStart &&
          normalizeTime(b.finish) === nbFinish &&
          b.summary === nb.summary
        )
      );

      if (existingIndex >= 0) {
        const existing = merged[existingIndex];
        // preferimos el color nuevo (nb.color) si viene; si no, mantenemos el existing.color
        merged[existingIndex] = { ...existing, ...nb, color: nb.color ?? existing.color };
      } else {
        merged.push(nb);
      }
    });

    return merged;
  };

  // -------------------- SESIÓN Y BLOQUES --------------------
  useEffect(() => {
    if (!session?.user?.id || syncBlocks) return;

    const initSessionAndBlocks = async () => {
      try {
        const res = await fetch(`${API_BASE}/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: session.user.id }),
        });

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { hasGoogleToken: false }; }

        if (data.hasGoogleToken) await fetchGoogleEvents();
        await fetchUserBlocks();
      } catch (err) {
        console.error("Error guardando session:", err);
      }
    };

    initSessionAndBlocks();
  }, [session]);

  const fetchUserBlocks = async () => {
    try {
      const res = await fetch(`${API_BASE}/blocks`, { credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { console.error("fetchUserBlocks no JSON:", text); return; }

      if (data.success) {
        const serverBlocks: Block[] = Array.isArray(data.blocks) ? data.blocks : [];
        // Si ya tenemos googleIds, filtramos bloques con googleId que ya no existen en Google
        const filtered = serverBlocks.filter(b => {
          if (!b.googleId) return true; // local always keep
          if (!googleIds || googleIds.length === 0) return false; // if we synced before, absent ids are deleted
          return googleIds.includes(b.googleId);
        });

        setBlocks(prev => mergeBlocks(prev, filtered));
      }
    } catch (err) {
      console.error("Error trayendo bloques del backend:", err);
    }
  };

  // -------------------- GOOGLE --------------------
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("success") === "true") {
      url.searchParams.delete("success");
      window.history.replaceState({}, document.title, url.pathname);

      const preState = JSON.parse(localStorage.getItem("preSyncState") || "{}");
      if (preState.currentDate) setCurrentDate(new Date(preState.currentDate));
      if (typeof preState.view === "boolean") setView(preState.view);

      localStorage.removeItem("preSyncState");
      fetchGoogleEvents();
    }
  }, []);

  const fetchGoogleEvents = async (): Promise<boolean> => {
    try {
      // ruta correcta montada en backend -> /api/blocks/calendar/events
      const res = await fetch(`${API_BASE}/blocks/calendar/events`, { credentials: "include" });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { console.error("fetchGoogleEvents no JSON:", text); setIsSynced(false); setGoogleIds([]); return false; }

      if (data.success && data.events) {
        const googleBlocks: Block[] = data.events.map((event: any) => {
          const start = new Date(event.start.dateTime || event.start.date);
          const end = new Date(event.end.dateTime || event.end.date);
          return {
            id: undefined,
            googleId: event.id,
            day: start.toISOString().split("T")[0],
            start: start.toTimeString().slice(0,5),
            finish: end.toTimeString().slice(0,5),
            summary: event.summary || "Sin título",
            color: "#60a5fa",
          };
        });

        const currentGoogleIds = googleBlocks.map(b => b.googleId).filter(Boolean) as string[];
        setGoogleIds(currentGoogleIds);
        // Actualizar Supabase para eliminar rows que ya no existen en Google
        try {
          const resSync = await fetch(`${API_BASE}/blocks/sync-google`, {
            method: "POST",
            credentials: "include",
          });
          if (!resSync.ok) {
            const textSync = await resSync.text().catch(() => "");
            console.warn("sync-google failed, status:", resSync.status, "response:", textSync);
          }
        } catch (syncErr) {
          console.warn("sync-google network error:", syncErr);
        }

        setBlocks(prev => {
          // 1️⃣ Filtramos prev: eliminamos bloques que ya no existen en Google
          const filteredPrev = prev.filter(b => !b.googleId || currentGoogleIds.includes(b.googleId));
          // 2️⃣ Merge normal, manteniendo bloques locales
          const nonGooglePrev = filteredPrev.filter(b => !b.googleId);
          return mergeBlocks(nonGooglePrev, googleBlocks);
        });

        setIsSynced(true);
        return true;
      } else {
        setIsSynced(false);
        setGoogleIds([]);
        return false;
      }
    } catch (err) {
      console.error("fetchGoogleEvents error:", err);
      setIsSynced(false);
      setGoogleIds([]);
      return false;
    }
  };

  // Auto-refresh on focus/visibility and optional polling
  useEffect(() => {
    const onFocus = () => { if (session?.user?.hasGoogleToken) fetchGoogleEvents(); };
    const onVisibility = () => { if (document.visibilityState === "visible" && session?.user?.hasGoogleToken) fetchGoogleEvents(); };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    const interval = setInterval(() => {
      if (session?.user?.hasGoogleToken) fetchGoogleEvents();
    }, 60_000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(interval);
    };
  }, [session?.user?.hasGoogleToken]);

  // -------------------- CRUD BLOQUES --------------------
  const saveBlock = async () => {
    if (!inputDay || !inputStart || !inputFinish || !inputSummary)
      return alert("Faltan datos");

    const editingBlock = editingIndex !== null ? blocks[editingIndex] : null;

    const newBlock: Block = {
      day: inputDay,
      start: inputStart,
      finish: inputFinish,
      summary: inputSummary,
      color: inputColor,
      id: editingBlock?.id,
      googleId: editingBlock?.googleId,
    };

    setOverlayVisible(false);

    try {
      const payload = { ...newBlock, title: newBlock.summary };

      const backendMethod = newBlock.id ? "PUT" : "POST";
      const backendUrl = newBlock.id
        ? `${API_BASE}/blocks/${newBlock.id}`
        : `${API_BASE}/blocks/upsert`;

      const res = await fetch(backendUrl, {
        method: backendMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!data.success) return alert(data.message || "Error guardando bloque");

      // refrescar listados desde backend para evitar duplicados/inconsistencias
      await fetchUserBlocks();
      if (session?.user?.hasGoogleToken) {
        await fetchGoogleEvents();
      }
      setEditingIndex(null);
    } catch (err) {
      console.error("saveBlock error:", err);
      alert("Error guardando bloque");
    }
  };

  const deleteBlock = async (index: number) => {
    if (!confirm("¿Eliminar este bloque?")) return;

    const previousBlocks = blocks.slice();
    const blockToDelete = blocks[index];

    // optimista: quitar de UI inmediatamente
    setBlocks(prev => prev.filter((_, i) => i !== index));
    
    if (!syncBlocks) {
    try {
      // Si tenemos id local, borramos por id (como antes)
      if (blockToDelete.id) {
        const res = await fetch(`${API_BASE}/blocks/${blockToDelete.id}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let parsed: any = null;
          try { parsed = JSON.parse(text); } catch { /* no JSON */ }

          // Si el servidor indica que ya fue borrado, lo tratamos como éxito (idempotencia)
          if (parsed && parsed.message && /deleted/i.test(parsed.message)) {
            console.warn("Backend: recurso ya eliminado:", parsed.message);
          } else {
            throw new Error(`Backend DELETE failed ${res.status}: ${text || res.statusText}`);
          }
        }
      } else if (blockToDelete.googleId) {
        // Si no hay id local pero sí googleId, pedir al backend que borre por google_event_id
        const res = await fetch(`${API_BASE}/blocks/google/${encodeURIComponent(blockToDelete.googleId)}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Backend DELETE by googleId failed ${res.status}: ${text || res.statusText}`);
        }
      } else {
        // ni id ni googleId -> solo local (ya removido de UI)
      }

      // refrescar para asegurar UI consistente
      if (session?.user?.hasGoogleToken) {
        await fetchGoogleEvents();
      } else {
        await fetchUserBlocks();
      }
    } catch (err: any) {
      console.error("deleteBlock error:", err);

      // Si el mensaje de error contiene "deleted", tratamos como éxito y refrescamos
      if (err.message && /deleted/i.test(err.message)) {
        if (session?.user?.hasGoogleToken) {
          await fetchGoogleEvents();
        } else {
          await fetchUserBlocks();
        }
        return;
      }

      // restaurar UI porque la eliminación falló realmente
      setBlocks(previousBlocks);
      alert("No se pudo eliminar el bloque en el servidor. Revisa la consola para más detalles.");
    }}
  };

  // -------------------- NAVEGACIÓN --------------------
  const goToToday = () => setCurrentDate(new Date());
  const goPrevWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate()-7); return d; });
  const goNextWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate()+7); return d; });
  const goPrevMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth()-1); return d; });
  const goNextMonth = () => setCurrentDate(prev => { const d = new Date(prev); d.setMonth(d.getMonth()+1); return d; });

  // -------------------- FORMULARIO --------------------
  const showForm = (index: number | null = null) => {
    if (index !== null) {
      const b = blocks[index];
      setInputDay(b.day); setInputStart(b.start); setInputFinish(b.finish);
      setInputSummary(b.summary); setInputColor(b.color); setEditingIndex(index);
    } else {
      setInputDay(new Date().toISOString().split("T")[0]);
      setInputStart("08:00"); setInputFinish("09:00");
      setInputSummary("No disponible"); setInputColor("#f87171");
      setEditingIndex(null);
    }
    setOverlayVisible(true);
  };

  const syncCalendars = async () => {
    try {
      // si ya hay token intentamos refrescar directamente
      if (session?.user?.hasGoogleToken) {
        const ok = await fetchGoogleEvents();
        if (ok) return;
        // si falla, continuamos para iniciar OAuth
      }

      const res = await fetch(`${API_BASE.replace(/\/api$/, "")}/auth/google/url`, { credentials: "include" });
      const data = await res.json();
      if (!data.url) throw new Error("No se pudo obtener URL");
      localStorage.setItem("preSyncState", JSON.stringify({ currentDate, view }));
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Error sincronizando con Google");
    }
  };

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // -------------------- RENDER --------------------
  return (
    <section className="schedule">
      <div className="container">
        <div className="schedule__head">
          <div>
            <h1>{syncBlocks ? "Horario Sincronizado" : "Tu Horario"} - {view ? "Vista Semanal" : "Vista Mensual"}</h1>
            <button className="btn-outline" onClick={()=>setView(!view)}>Cambiar Vista</button>
          </div>
          {view
            ? <WeekNav goPrevWeek={goPrevWeek} goNextWeek={goNextWeek} goToToday={goToToday} />
            : <MonthNav goPrevMonth={goPrevMonth} goNextMonth={goNextMonth} goToToday={goToToday} />}
        </div>

        <div className="card-like">
          <div className="schedule__toolbar">
            {view
              ? <div className="schedule__weeklabel">
                  Semana del {startOfWeek.getDate()} al {endOfWeek.getDate()} de {monthNames[currentDate.getMonth()]}
                </div>
              : <div className="schedule__weeklabel">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>}
            {!syncBlocks && <div className="schedule__actions">
              <button className="btn-outline" onClick={()=>showForm()}><Plus size={16}/> Agregar bloque</button>
              <button
                className={`btn-outline ${isSynced ? "synced" : ""}`}
                onClick={syncCalendars}
              >
                <RefreshCcw size={16}/> {isSynced ? "Sincronizado ✅" : "Sincronizar Google"}
              </button>
            </div>}
          </div>

          <div className="schedule__gridwrap">
            {view
              ? <CalendarGridWeek blocks={blocks} currentDate={currentDate} onEdit={showForm} onDelete={deleteBlock} />
              : <CalendarGridMonth blocks={blocks} currentDate={currentDate} />}
          </div>
          <p className="schedule__hint">Cada bloque representa un horario donde no estás disponible.</p>
        </div>

        {!syncBlocks && <div className="schedule__cta">
          <Link to="/sync" className="btn-primary"><LinkIcon size={18}/> Crear sincronización</Link>
        </div>}
      </div>

      {overlayVisible && (
        <div className="overlay" style={{ display: "flex" }}>
          <div className="setBlock">
            <label>Día:</label>
            <input type="date" value={inputDay} onChange={e=>setInputDay(e.target.value)} /><br/>
            <label>Inicio:</label>
            <input type="time" value={inputStart} onChange={e=>setInputStart(e.target.value)} /><br/>
            <label>Fin:</label>
            <input type="time" value={inputFinish} onChange={e=>setInputFinish(e.target.value)} /><br/>
            <label>Nombre:</label>
            <input type="text" value={inputSummary} onChange={e=>setInputSummary(e.target.value)} /><br/>
            <label>Color:</label>
            <input type="color" value={inputColor} onChange={e=>setInputColor(e.target.value)} /><br/>
            <button onClick={saveBlock}>Aceptar</button>
            <button onClick={()=>setOverlayVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </section>
  );
};