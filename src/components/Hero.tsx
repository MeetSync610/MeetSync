import "../styles/Hero.css";
import logo from "../assets/logo2.png";
import heroMock from "../assets/hero-mock.png";
import {Rocket} from "lucide-react"

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__grid">
        <div className="hero__left">
          <h1>Meet<span className="accent">Sync</span> — Encontrá el momento</h1>
          <p>Armá tu horario personal y <span className="accent">sincronizalo</span> con tus amigos para coordinar el mejor momento</p>
          <div className="hero__actions">
            <a href="/login" className="btn-primary"><Rocket size={20}/>Comenzar</a>
            <a href="#how" className="btn-secondary">Ver cómo funciona</a>
          </div>
          <div className="hero__meta">
            <img src={logo} alt="Logo" className="meta__img" />
            <span className="meta__text">Sincronizador de reuniones</span>
          </div>
        </div>

        <div className="hero__right">
          <img src={heroMock} alt="App preview" className="hero__image" />
          <div className="hero__blob" aria-hidden />
        </div>
      </div>
    </section>
  );
}