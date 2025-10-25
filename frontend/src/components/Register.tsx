import "../styles/Registro-Logeo.css";
import { Link, useNavigate } from "react-router-dom";
import { User, AtSign, Mail, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register() {
  const navigate = useNavigate();

  // state
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  
  const [touched, setTouched] = useState(false);
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const passRegex = /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = useMemo(() => {
    if (!email.trim()) return "Ingresá tu correo";
    if (!emailRegex.test(email)) return "Correo inválido";
    return undefined;
  }, [email]);

  const nameError = useMemo(() => {
    if (!name.trim()) return "Ingresá tu nombre";
    return undefined;
  }, [name]);

  const usernameError = useMemo(() => {
    if (!username.trim()) return "Ingresá tu usuario";
    if (!usernameRegex.test(username)) return "Usá 3–20 caracteres: letras, números o _";
    return undefined;
  }, [username]);

  const passwordError = useMemo(() => {
    if (!password) return "Ingresá tu contraseña";
    if (!passRegex.test(password)) return "Mínimo 6 caracteres, al menos una letra y un número.";
    return undefined;
  }, [password]);

  const usernameOk = useMemo(
    () => !username || usernameRegex.test(username),
    [username]
  );
  const passwordOk = useMemo(
    () => !password || passRegex.test(password),
    [password]
  );

  const canSubmit =
    name.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    usernameOk &&
    passwordOk &&
    !submitting;

  // submit con supabase (idéntico flujo a tu register anterior)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;

    setError("");
    setSubmitting(true);

    try {
      // 1) Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        // opcional: enviar metadatos; si tu backend los usa podés leerlos luego
        options: {
          data: {
            full_name: name.trim(),
            username: username.trim(),
          },
        },
      });

      if (signUpError) {
        console.error("Supabase signup error:", signUpError);
        setError(signUpError.message || "Error al registrarse.");
        setSubmitting(false);
        return;
      }

      // 2) Iniciar sesión automáticamente (como en tu versión previa)
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) {
        console.error("Supabase login after signup error:", loginError);
        setError(loginError.message || "Error al iniciar sesión.");
        setSubmitting(false);
        return;
      }

      // 3) Listo
      alert("✅ Registro exitoso! Ahora podés iniciar sesión.");
      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  };

  return (
    <section className="login2">
      {/* Fondo video + overlay */}
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
          <div className={`input-box ${touched && nameError ? "error" : ""}`}>
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
            <label htmlFor="name">Nombre</label>
            <div className="input-line"></div>
            {touched && nameError && (
              <span className="input-error-text">{nameError}</span>
            )}

          </div>

          {/* Nombre de usuario */}
          <div className={`input-box ${touched && usernameError ? "error" : ""}`}>
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
            <label htmlFor="username">Nombre de usuario</label>
            <div className="input-line"></div>
            {touched && usernameError && (
              <span className="input-error-text">{usernameError}</span>
            )}

          </div>

          {/* Email */}
          <div className={`input-box ${touched && emailError ? "error" : ""}`}>
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
            <label htmlFor="email">Correo</label>
            <div className="input-line"></div>
            {touched && emailError && (
              <span className="input-error-text">{emailError}</span>
            )}

          </div>

          {/* Password */}
          <div className={`input-box ${touched && passwordError ? "error" : ""}`}>
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
              pattern="(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}"
              title="Mínimo 6 caracteres, al menos una letra y un número."
            />
            <label htmlFor="password">Contraseña</label>
            <div className="input-line"></div>
            {touched && passwordError && (
              <span className="input-error-text">{passwordError}</span>
            )}

          </div>

          <button type="submit">
            {submitting ? "Creando..." : "Crear cuenta"}
          </button>

          {error && (
            <p className="login__error" role="alert" aria-live="polite" style={{ marginTop: 8 }}>
              {error}
            </p>
          )}

          <div className="register-link" style={{ marginTop: 16 }}>
            <p>
              ¿Ya tenés cuenta? <Link to="/login">Logeate</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
