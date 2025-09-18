import "../styles/Login.css";
import { Link } from "react-router-dom";
import AuthCard from "./AuthCard";
import FormField from "./FormField";
import { LucideLogIn } from "lucide-react";

export default function Login() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <form className="login__form" onSubmit={handleSubmit}>
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="tu@mail.com"
            required
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
          />
          <button className="btn-primary login__submit" type="submit">
            <LucideLogIn size={18}/>
            Entrar
          </button>
        </form>
      </AuthCard>
    </section>
  );
}