export function getTextColorForBackground(bgColor: string): string {
  // Acepta formatos tipo "#f87171" o "#ff0000"
  const hex = bgColor.replace("#", "");

  // Si es shorthand tipo #abc → lo expandimos a #aabbcc
  const normalized = hex.length === 3
    ? hex.split("").map(x => x + x).join("")
    : hex;

  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  // Algoritmo estándar de luminosidad
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#000000" : "#ffffff"; // si es claro → negro, si es oscuro → blanco
}
