import "../styles/Registro-Logeo.css"; 
import { Link } from "react-router-dom";
import { User, AtSign, Mail, Lock } from "lucide-react";
import { useMemo, useState } from "react";

export default function Register2() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // solo front por ahora
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Validaciones livianas para habilitar el botón (sin mostrar errores aún)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passRegex = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;

  const usernameOk = useMemo(() => !username || usernameRegex.test(username), [username]);
  const passwordOk = useMemo(() => !password || passRegex.test(password), [password]);

  const canSubmit =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    usernameOk &&
    passwordOk;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    // 👉 sin backend por ahora. Después enchufamos supabase/tu API.
    console.log("Register2 submit:", { name, username, email });
  };

  return (
    <section className="login2">{/* reuso layout/clases */}
      {/* Fondo video + overlay (misma ruta que en Login2) */}
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

      <div className="login-container login-container--tall">
        <form onSubmit={handleSubmit} noValidate>
          <h2>Register</h2>

          {/* Nombre */}
          <div className="input-box">
            <User className="icon" size={20} />
            <input
              id="name"
              type="text"
              required
              placeholder=" "
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <label htmlFor="name">Name</label>
            <div className="input-line"></div>
          </div>

          {/* Nombre de usuario */}
          <div className="input-box">
            <AtSign className="icon" size={20} />
            <input
              id="username"
              type="text"
              required
              placeholder=" "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="Usá 3–20 caracteres: letras, números o _"
            />
            <label htmlFor="username">Username</label>
            <div className="input-line"></div>
          </div>

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
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              pattern="(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}"
              title="Mínimo 6 caracteres, al menos una letra y un número."
            />
            <label htmlFor="password">Password</label>
            <div className="input-line"></div>
          </div>

          <button type="submit" disabled={!canSubmit}>
            Create account
          </button>

          <div className="register-link" style={{ marginTop: 16 }}>
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
