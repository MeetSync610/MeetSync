import "../styles/Schedule.css";
import { Plus, RefreshCcw, Link as LinkIcon } from "lucide-react";
import WeekNav from "./WeekNav";
import CalendarGridWeek from "./CalendarGridWeek";
import CalendarGridMonth from "./CalendarGridMonth";
import { Link } from "react-router-dom";
import { useState } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

// Client ID de Google OAuth
const clientId = "486920096908-t2lfjpqr80vsr4qagde2m31uc9lm6r9e.apps.googleusercontent.com";

export default function Schedule() {

  const day = new Date();
  const week = day.getDate() - day.getDay();
  const month = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  
  const showForm = (() => { // Muestra y esconde form de tiempos
    const setBlock = document.querySelector(".overlay") as HTMLElement | null;
    setBlock?.style.display == "none" ? setBlock.style.display = "flex" : setBlock!.style.display = "none";    
  });

  const setBlock = (() => {
    // Recibiría los tiempos, los guardaría en bd y mostraría en página
    console.log();
    showForm();
  });

  // Función para sincronizar con Google Calendar
  const syncCalendars = async (accessToken: string) => {
    try {
      // Evento de ejemplo
      const event = {
        summary: "Clase de React",
        start: { dateTime: new Date().toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString(), timeZone: "America/Argentina/Buenos_Aires" },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) throw new Error("Error creando evento");

      console.log("Evento creado exitosamente!");
    } catch (error) {
      console.error("Error sincronizando calendario:", error);
    }
  };

  // Hook de login de Google usando flujo 'implicit' para evitar el error de CORS
  const googleLogin = useGoogleLogin({
    flow: 'implicit', // <- aquí está el cambio principal
    onSuccess: tokenResponse => {
      // tokenResponse.access_token es el token que necesitamos
      if (tokenResponse.access_token) syncCalendars(tokenResponse.access_token);
    },
    onError: () => {
      console.log("Error en login de Google");
    },
    scope: "https://www.googleapis.com/auth/calendar.events", // Permiso para crear eventos
  });

  const [view, setView] = useState(true);

  return (
    // GoogleOAuthProvider envuelve todo el componente para que useGoogleLogin funcione
    <GoogleOAuthProvider clientId={clientId}>
      <section className="schedule">
        <div className="container">
          <div className="schedule__head">
            <div>
              {view? (
                <h1>Tu horario - Vista Semanal</h1>
              ) : (
                <h1>Tu horario - Vista Mensual</h1>
              )}
              <button className="btn-outline" onClick={() => setView(!view)}>Cambiar Vista</button>
            </div>
            <WeekNav />
          </div>

          <div className="card-like">
            <div className="schedule__toolbar">
              {view? (
                <div className="schedule__weeklabel">Semana del {week} al {week + 6} de {month[day.getMonth()]}</div>
              ) : (
                <div className="schedule__weeklabel">{month[day.getMonth()]}</div>
              )}
              <div className="schedule__actions">
                <button className="btn-outline" onClick={showForm}>
                  <Plus size={16} /> Agregar bloque no disponible
                </button>

                {/* Botón personalizado para Sincronizar con Google Calendar */}
                <button className="btn-outline" onClick={() => googleLogin()}>
                  <RefreshCcw size={16} /> Sincronizar con Google Calendar
                </button>
              </div>
            </div>

            <div className="schedule__gridwrap">
              {view? (
                <CalendarGridWeek startHour={0} endHour={24} />
              ) : (
                <CalendarGridMonth />
              )}
            </div>

            <p className="schedule__hint">
              Cada bloque representa un horario donde no estás disponible.
            </p>
          </div>

          <div className="schedule__cta">
            <Link to="/sync" className="btn-primary">
              <LinkIcon size={18} /> Crear sincronización
            </Link>
          </div>
        </div>
        
        <div className="overlay" /* "Form de Tiempos" */> 
          <div className="setBlock">
            <label htmlFor="day">Día: </label>
            <input required type="date" id="day" name="day" min={day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + week} max={day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + (week + 6)}/>
            <br />
            <label htmlFor="start">Inicia a las: </label>
            <input required type="time" id="start" name="start"/>
            <br />
            <label htmlFor="finish">Termina a las: </label>
            <input required type="time" id="finish" name="finish"/>
            <br />
            <button onClick={setBlock}>Aceptar</button>
            <button onClick={showForm}>Cancelar</button>
          </div>
        </div>

      </section>
    </GoogleOAuthProvider>
  );
}
