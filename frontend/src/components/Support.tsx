import { useState } from "react";
import "../styles/Support.css";
import { Mail, Send, MessageCircleQuestion, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Support() {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("consulta");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert("Para continuar, aceptá los términos de privacidad.");
      return;
    }
    // Armamos mailto (simple) para abrir el cliente de correo del usuario
    const to = "meetsync25@gmail.com";
    const sub = encodeURIComponent(`[Soporte • ${category}] ${subject || "(sin asunto)"}`);
    const body = encodeURIComponent(
      `Hola equipo MeetSync,\n\n` +
      `${message}\n\n` +
      `—\nRemitente: ${name || "(sin nombre)"}\nEmail: ${fromEmail}\nCategoría: ${category}`
    );
    window.location.href = `mailto:${to}?subject=${sub}&body=${body}`;
  };

  return (
    <section className="support">
      <div className="container">
        <div className="support__card">
          <div className="support__head">
            <div className="support__pill">
              <MessageCircleQuestion size={16} />
              Soporte & Ayuda
            </div>
            <h1 className="support__title">
              <Mail className="icon-sky" /> Contactar soporte
            </h1>
            <p className="support__subtitle">
              ¿Tenés un problema o sugerencia? Completá el formulario y te respondemos.
            </p>
          </div>

          <form className="support__form" onSubmit={handleSubmit}>
            <div className="support__row">
              <div className="field">
                <label>Nombre</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label>Email de contacto</label>
                <input
                  type="email"
                  className="input"
                  placeholder="tu@mail.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="support__row">
              <div className="field">
                <label>Categoría</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="consulta">Consulta</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="bug">Reporte de bug</option>
                  <option value="cuenta">Cuenta / Acceso</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="field">
                <label>Asunto</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Breve resumen"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Mensaje</label>
              <textarea
                className="textarea"
                placeholder="Contanos qué pasó o qué necesitás…"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <div className="support__terms">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span>
                  Acepto la{" "}
                  <Link to="/privacidad" className="link">Política de privacidad</Link>.
                </span>
              </label>
            </div>

            <div className="support__actions">
              <button type="submit" className="btn-primary">
                <Send size={18} /> Enviar a soporte
              </button>

              {/* Alternativa directa por link (por si el form no abre el cliente) */}
              <a
                className="btn-secondary"
                href="mailto:meetsync25@gmail.com?subject=[Soporte]%20Consulta&body=Contanos%20tu%20consulta…"
              >
                <LinkIcon size={18} /> Escribir por correo
              </a>

              {/* Link a FAQ para autogestión */}
              <Link to="/#faq" className="btn-secondary">
                <MessageCircleQuestion size={18} /> Ver FAQ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}