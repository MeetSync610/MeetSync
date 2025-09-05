import "../styles/terms&privacy.css";

export default function Terms() {
  return (
    <section className="doc">
      <div className="doc__container">
        <h1 className="doc__title">Términos y Condiciones</h1>

        <p className="doc__intro">
          Bienvenido a <strong>MeetSync</strong>. Al utilizar nuestra aplicación aceptás los presentes Términos y Condiciones. 
          Te pedimos que los leas atentamente.
        </p>

        <h2>1. Uso de la aplicación</h2>
        <p>
          MeetSync está destinada a ayudar a coordinar horarios y encuentros. No puede usarse con fines ilegales, abusivos o que afecten la experiencia de otros usuarios.
        </p>

        <h2>2. Registro de usuarios</h2>
        <p>
          Para acceder a ciertas funciones necesitás crear una cuenta con datos verídicos. Sos responsable de mantener la confidencialidad de tu contraseña.
        </p>

        <h2>3. Contenido generado por el usuario</h2>
        <p>
          Todo contenido compartido dentro de la app (como nombre de usuario o disponibilidad) es responsabilidad de quien lo publica. 
          MeetSync no se hace responsable por el uso indebido que puedan darle otros usuarios.
        </p>

        <h2>4. Limitación de responsabilidad</h2>
        <p>
          Hacemos esfuerzos razonables para mantener el servicio disponible, pero no garantizamos ausencia de errores, caídas o pérdida de datos.
        </p>

        <h2>5. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos en cualquier momento. Notificaremos dentro de la app cuando existan cambios relevantes.
        </p>

      </div>
    </section>
  );
}
