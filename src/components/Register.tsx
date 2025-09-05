import "../styles/register.css";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthCard from "./AuthCard";
import FormField from "./FormField";
import { useMemo, useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // nuevo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Reglas
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passRegex = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;

  // Validaciones derivadas
  const usernameError = useMemo(() => {
    if (!username) return undefined;
    if (!usernameRegex.test(username)) {
      return "Usá 3–20 caracteres: letras, números o _ (guión bajo).";
    }
    return undefined;
  }, [username]);

  const passwordError = useMemo(() => {
    if (!password) return undefined;
    if (!passRegex.test(password)) {
      return "Mínimo 6 caracteres, al menos una letra y un número.";
    }
    return undefined;
  }, [password]);

  const confirmError = useMemo(() => {
    if (!confirm) return undefined;
    if (password !== confirm) return "Las contraseñas no coinciden.";
    return undefined;
  }, [password, confirm]);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    username && !usernameError &&
    password && !passwordError &&
    confirm && !confirmError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // mock: acá iría el POST al backend
    // ej: apiPost("/auth/register", { name, username, email, password })
    alert(`Registro ok (mock): ${name} / @${username} / ${email}`);
  };

  return (
    <section className="register">
      <AuthCard
        title="Crear cuenta"
        footer={
          <span>
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="link">Entrar</Link>
          </span>
        }
      >
        <form className="register__form" onSubmit={handleSubmit} noValidate>
          <FormField
            id="name"
            label="Nombre"
            type="text"
            placeholder="Thiago"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormField
            id="username"
            label="Nombre de usuario"
            type="text"
            placeholder="thiagopro777"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={usernameError}
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="tu@mail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormField
            id="password"
            label="Contraseña"
            type="password"
            required
            minLength={6}
            pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}"
            title="Mínimo 6 caracteres, al menos una letra y un número."
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />

          <FormField
            id="confirm"
            label="Repetir contraseña"
            type="password"
            required
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirmError}
          />
            <div className="register__terms">
                Al crear tu cuenta aceptás nuestros{" "}
                <Link to="/terminos" className="link">Términos de servicio</Link> y{" "}
                <Link to="/privacidad" className="link">Política de privacidad</Link>.
            </div>
          <button className="btn-primary register__submit" type="submit" disabled={!canSubmit}>
            <UserPlus size={18} /> Crear cuenta
          </button>
        </form>
      </AuthCard>
    </section>
  );
}