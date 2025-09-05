import "../styles/terms&privacy.css";

export default function Privacy() {
  return (
    <section className="doc">
      <div className="doc__container">
        <h1 className="doc__title">Política de Privacidad</h1>

        <p className="doc__intro">
          En <strong>MeetSync</strong> respetamos tu privacidad. Esta política explica qué datos recolectamos y cómo los usamos.
        </p>

        <h2>1. Datos recolectados</h2>
        <p>
          Recolectamos información básica como nombre, email y horarios de disponibilidad. 
          Estos datos se usan únicamente para brindar el servicio.
        </p>

        <h2>2. Uso de la información</h2>
        <p>
          Utilizamos tu información para mostrar coincidencias de horarios con tus amigos, 
          enviar recordatorios y mejorar la experiencia de la app.
        </p>

        <h2>3. Compartir información</h2>
        <p>
          No compartimos tus datos personales con terceros, salvo obligación legal o para proveer el servicio (ej: hosting).
        </p>

        <h2>4. Seguridad</h2>
        <p>
          Implementamos medidas técnicas para proteger tus datos, aunque no podemos garantizar seguridad absoluta en internet.
        </p>

        <h2>5. Derechos del usuario</h2>
        <p>
          Podés solicitar acceso, corrección o eliminación de tus datos contactándonos al correo de soporte.
        </p>
      </div>
    </section>
  );
}
