import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/Nav.css";
import logo from "../assets/logo2.png";
import { CalendarArrowUp, Link as LinkIcon, LogIn, Menu, X } from "lucide-react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Cerrar al cambiar de ruta si el user toca un link
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  // Evita scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="nav-header">
      <div className="container">
        <nav className="nav" aria-label="Navegación principal">
          {/* Brand */}
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <img src={logo} alt="MeetSync" className="brand__img" />
            <span className="brand__text">
              Meet<span className="brand__accent">Sync</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="nav__links nav__links--desktop">
            <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/friends" onClick={() => setOpen(false)}>Amigos</NavLink>
            <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
          </div>
          <div className="nav__actions nav__actions--desktop">
            <NavLink to="/schedule" className="btn-outline" onClick={() => setOpen(false)}>
              <CalendarArrowUp size={18}/> Crear horario
            </NavLink>
            <NavLink to="/sync" className="btn-outline" onClick={() => setOpen(false)}>
              <LinkIcon size={18}/> Crear sincronización
            </NavLink>
            <NavLink to="/login" className="btn-outline btn-primary" onClick={() => setOpen(false)}>
              <LogIn size={18}/> Entrar
            </NavLink>
          </div>

          {/* Toggle móvil */}
          <button
            className="nav__toggle"
            aria-controls="navmenu"
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </nav>
      </div>

      {/* Panel móvil */}
      <div className={`nav__mobile ${open ? "is-open" : ""}`} id="navmenu" role="dialog" aria-modal="true">
        <div className="nav__mobile-inner">
          <button
            className="nav__mobile-close"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}>
            <X size={22} />
          </button>
          
          <div className="nav__group">
            <NavLink to="/" onClick={() => setOpen(false)} className="nav__m-link">Home</NavLink>
            <NavLink to="/friends" onClick={() => setOpen(false)} className="nav__m-link">Amigos</NavLink>
            <NavLink to="/login" onClick={() => setOpen(false)} className="nav__m-link">Login</NavLink>
          </div>

          <div className="nav__group">
            <NavLink to="/schedule" onClick={() => setOpen(false)} className="nav__m-btn">
              <CalendarArrowUp size={18}/> Crear horario
            </NavLink>
            <NavLink to="/sync" onClick={() => setOpen(false)} className="nav__m-btn">
              <LinkIcon size={18}/> Crear sincronización
            </NavLink>
            <NavLink to="/login" onClick={() => setOpen(false)} className="nav__m-btn nav__m-btn--primary">
              <LogIn size={18}/> Entrar
            </NavLink>
          </div>
        </div>
      </div>

      {/* Overlay para tapar el fondo y cerrar al tocar */}
      {open && <button className="nav__overlay" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
    </header>
  );
}
