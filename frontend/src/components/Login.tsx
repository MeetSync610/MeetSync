import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import FormField from "./FormField";
import { LucideLogIn } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext"; // <- Traer contexto

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthContext(); // <- Función de login del contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validación de contraseña
  const passRegex = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;
  const passwordError = useMemo(() => {
    if (!password) return undefined;
    if (!passRegex.test(password))
      return "Mínimo 6 caracteres, al menos una letra y un número.";
    return undefined;
  }, [password]);

  const canSubmit = email.trim().length > 0 && password && !passwordError;

  // ------------------- Handle Submit -------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      await login(email, password); // <- Usamos la función del contexto
      navigate("/"); // Redirigir a home después de login
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err.message);
      alert("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <section className="login">
      <AuthCard
        title="Entrá a tu cuenta"
        footer={
          <span>
            ¿No tenés cuenta? <Link to="/register" className="link">Crear cuenta</Link>
          </span>
        }
      >
        <form className="login__form" onSubmit={handleSubmit} noValidate>
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
            pattern="(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}"
            title="Mínimo 6 caracteres, al menos una letra y un número."
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
          />
          <button className="btn-primary login__submit" type="submit" disabled={!canSubmit}>
            <LucideLogIn size={18} /> Entrar
          </button>
        </form>
      </AuthCard>
    </section>
  );
}
