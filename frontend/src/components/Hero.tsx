import "../styles/Hero.css";
import logo from "../assets/logo2.png";
import { Rocket } from "lucide-react";
import Carousel from "./carousel";
import { useEffect, useState } from "react";

/** Observa body.light para cambiar dark/light en vivo */
function useIsLight() {
  const [isLight, setIsLight] = useState(
    typeof document !== "undefined" && document.body.classList.contains("light")
  );
  useEffect(() => {
    const body = document.body;
    const obs = new MutationObserver(() =>
      setIsLight(body.classList.contains("light"))
    );
    obs.observe(body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isLight;
}

export default function Hero() {
  const isLight = useIsLight();

  // 👇 GLOBS LITERALES (así Vite no se queja)
  const darkMods = import.meta.glob("../assets/hero-carousel/dark/*.{svg,webp,png,jpg,jpeg}", { eager: true });
  const lightMods = import.meta.glob("../assets/hero-carousel/light/*.{svg,webp,png,jpg,jpeg}", { eager: true });

  // Ordenamos por nombre de archivo (encuesta-01, 02, 03…)
  const darkImages = Object.keys(darkMods).sort().map(k => (darkMods[k] as any).default as string);
  const lightImages = Object.keys(lightMods).sort().map(k => (lightMods[k] as any).default as string);

  const images = (isLight && lightImages.length) ? lightImages : darkImages;

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
          {/* misma “skin” que tu imagen previa */}
          <Carousel className="hero__image" images={images} autoPlay={true} intervalMs={4000} loop />
          <div className="hero__blob" aria-hidden />
        </div>
      </div>
    </section>
  );
}