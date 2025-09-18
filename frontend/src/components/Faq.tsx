import "../styles/Faq.css";
import { useRef, useEffect } from "react";
import { ChevronDown, MessageCircleQuestionMark } from "lucide-react";

/** Abre (0 -> scrollHeight -> auto) o cierra (altura -> 0) con transición */
function openWithAnimation(details: HTMLDetailsElement, panel: HTMLDivElement) {
  // abrir
  details.setAttribute("open", "");
  panel.style.height = "0px";
  // reflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  panel.offsetHeight;
  panel.style.height = panel.scrollHeight + "px";

  const after = () => {
    panel.style.height = "auto";
    panel.removeEventListener("transitionend", after);
  };
  panel.addEventListener("transitionend", after);
}

function closeWithAnimation(details: HTMLDetailsElement, panel: HTMLDivElement) {
  // cerrar (mantener open hasta que termine la animación)
  const current = panel.scrollHeight;
  panel.style.height = current + "px";
  // reflow
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  panel.offsetHeight;
  panel.style.height = "0px";

  const after = () => {
    details.removeAttribute("open");
    panel.removeEventListener("transitionend", after);
  };
  panel.addEventListener("transitionend", after);
}

type ItemProps = { q: string; a: string };

function FaqItem({ q, a }: ItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = detailsRef.current;
    const p = panelRef.current;
    if (!d || !p) return;
    p.style.height = d.open ? "auto" : "0px";
  }, []);

  const handleToggleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
  e.preventDefault(); // evitamos el toggle nativo para animar el cierre
  const d = detailsRef.current!;
  const p = panelRef.current!;

  if (d.open) {
    // Si estaba abierto, cerramos con animación
    closeWithAnimation(d, p);
  } else {
    // 1) Abrimos el actual con animación
    openWithAnimation(d, p);

    // 2) Cerramos cualquier otro <details> abierto del mismo .faq__list
    const list = d.closest(".faq__list");
    const openItems =
      list?.querySelectorAll<HTMLDetailsElement>("details[open]") ?? [];

    openItems.forEach((other) => {
      if (other !== d) {
        const otherPanel =
          other.querySelector<HTMLDivElement>(".faq__panel");
        if (otherPanel) {
          closeWithAnimation(other, otherPanel);
        }
      }
    });
  }
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // accesible: Enter o Space
    if (e.key === "Enter" || e.key === " ") {
      handleToggleClick(e);
    }
  };

  return (
    <details ref={detailsRef} className="faq__item">
      <summary
        className="faq__summary"
        onClick={handleToggleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={detailsRef.current?.open ?? false}
      >
        <span>{q}</span>
        <ChevronDown size={18} aria-hidden className="faq__chevron" />
      </summary>

      {/* Panel animado por height (se cierra SUAVE antes de quitar open) */}
      <div ref={panelRef} className="faq__panel">
        <div className="faq__content">{a}</div>
      </div>
    </details>
  );
}

export default function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="container">
        <h2 className="faq__title">
          <MessageCircleQuestionMark className="icon-sky" />
          Preguntas frecuentes
        </h2>

        <div className="faq__list">
          <FaqItem
            q="¿Qué es MeetSync y para qué sirve?"
            a="MeetSync es una aplicación pensada para que coordinar horarios con amigos deje de ser un dolor de cabeza. En lugar de estar mil mensajes en un chat individual o grupal, la app cruza tu disponibilidad con la de tus amigos y te muestra el mejor momento para juntarse."
          />
          <FaqItem
            q="¿Cómo marco mis horarios de disponibilidad?"
            a="Vas a tener una vista semanal estilo calendario donde podés indicar en qué momentos no estás disponible. El sistema cruza automáticamente esos datos con los de tus amigos."
          />
          <FaqItem
            q="¿Puedo agregar a mis amigos dentro de la aplicación?"
            a="Sí. Podés enviarles solicitud o invitarlos por link para empezar a compartir horarios y organizar encuentros."
          />
          <FaqItem
            q="¿La app también sugiere lugares para juntarse?"
            a="En la primera versión no, pero estamos trabajando en integrar recomendaciones de lugares públicos (tanto gratuitos como pagos) para que la app no solo resuelva cuándo, sino también dónde encontrarse."
          />
          <FaqItem
            q="¿Voy a recibir recordatorios de mis encuentros?"
            a="Sí. La idea es que cada vez que se confirme un horario común, recibas un recordatorio con la información básica para que estés al tanto."
          />
          <FaqItem
            q="¿Es posible marcar un punto de encuentro en el mapa?"
            a="Sí, es una de las funciones más pedidas en la encuesta. Vamos a incluir la opción de definir un lugar de encuentro (ej: una plaza o café) para que todos lo vean de forma clara."
          />
          <FaqItem
            q="¿Se pueden poner alarmas personalizadas?"
            a="Estamos evaluando esta opción. Podría servir para recordarte cuándo tenés que salir de casa para llegar a tiempo al encuentro."
          />
          <FaqItem
            q="¿Se podrán subir fotos de las salidas?"
            a="Hoy no, pero varios usuarios lo pidieron, por lo que nos vamos a enfatizar en que en un futuro exista un espacio para guardar recuerdos de las salidas organizadas con MeetSync."
          />
        </div>
      </div>
    </section>
  );
}
