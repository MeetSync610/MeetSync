import "../styles/Login2.css";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export default function Login2() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Validación igual que en Login.tsx
  const passRegex = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;
  const passwordError = useMemo(() => {
    if (!password) return undefined;
    if (!passRegex.test(password)) {
      return "Mínimo 6 caracteres, al menos una letra y un número.";
    }
    return undefined;
  }, [password]);

  const canSubmit = email.trim().length > 0 && !!password && !passwordError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err?.message || err);
      setError("Email o contraseña incorrectos. Intentalo de nuevo.");
    }
  };

  return (
    <section className="login2">
      {/* Fondo video + overlay (desde /public/fondo4k.mp4) */}
      <video
        className="bg-video"
        src="/fondo4k.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
      <div className="bg-overlay" />

      <div className="login-container">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Login</h2>

          {/* Email */}
          <div className="input-box">
            <Mail className="icon" size={20} />
            <input
              id="email"
              type="email"
              required
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <label htmlFor="email">Email</label>
            <div className="input-line"></div>
          </div>

          {/* Password */}
          <div className="input-box">
            <Lock className="icon" size={20} />
            <input
              id="password"
              type="password"
              required
              minLength={6}
              pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}"
              title="Mínimo 6 caracteres, al menos una letra y un número."
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-invalid={!!passwordError}
            />
            <label htmlFor="password">Password</label>
            <div className="input-line"></div>
          </div>

          {/* Solo link a soporte (vos ya lo alineaste a la derecha con .forgot) */}
          <div className="forgot">
            <Link to="/soporte">Forgot Password?</Link>
          </div>

          <button type="submit" disabled={!canSubmit}>
            Login
          </button>

          {/* Error de autenticación (reutiliza tu estilo global si existe) */}
          {error && (
            <p className="login__error" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <div className="register-link">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
