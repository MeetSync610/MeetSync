import React, { useEffect, useRef, useState } from "react";
import "../styles/Carousel.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  className?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  loop?: boolean;
};

export default function Carousel({
  images,
  className = "",
  autoPlay = true,       
  intervalMs = 5000,   
  loop = true,
}: Props) {
  const n = images.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef(1);

  const clamp = (i: number) => (loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i)));
  const prev = () => setIndex(i => clamp(i - 1));
  const next = () => setIndex(i => clamp(i + 1));

  useEffect(() => {
    if (!autoPlay || n <= 1) return;
    const id = setInterval(() => {
      if (!hover && !dragging) next();
    }, intervalMs);
    return () => clearInterval(id);
  }, [autoPlay, intervalMs, hover, dragging, n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!wrapRef.current) return;
    wrapRef.current.setPointerCapture(e.pointerId);
    widthRef.current = wrapRef.current.clientWidth || 1;
    setDragging(true);
    setDragPx(0);
    (wrapRef.current as any)._startX = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !wrapRef.current) return;
    const startX = (wrapRef.current as any)._startX ?? e.clientX;
    setDragPx(e.clientX - startX);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    const delta = dragPx;
    const threshold = Math.max(40, widthRef.current * 0.12);
    setDragging(false);
    setDragPx(0);
    if (Math.abs(delta) > threshold) (delta < 0 ? next : prev)();
  };

  if (!n) return null;
  const dragPct = (dragPx / widthRef.current) * 100;

  return (
    <div
      className={`carousel ${className}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        ref={wrapRef}
        className="carousel__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Resultados de encuestas"
      >
        <div
          className="carousel__track"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragPct}%))`,
            transition: dragging ? "none" : "transform 380ms ease",
          }}
        >
          {images.map((src, i) => (
            <div className="carousel__slide" key={i} aria-hidden={i !== index}>
              <img
                src={src}
                alt={`Resultado de encuesta ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      {n > 1 && (
        <>
          <button
            className="carousel__arrow carousel__arrow--prev"
            onClick={prev}
            aria-label="Anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            className="carousel__arrow carousel__arrow--next"
            onClick={next}
            aria-label="Siguiente"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}
    </div>
  );
}
