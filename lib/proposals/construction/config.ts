/** Editorial content and the shared, reversible construction clock (0–1). */
export const CHAPTERS = [
  {
    at: 0,
    label: "El origen",
    title: "Todo comienza",
    accent: "con una visión.",
    detail: "Un lugar. Infinitas posibilidades.",
  },
  {
    at: 0.14,
    label: "Los cimientos",
    title: "Diseñamos",
    accent: "cada detalle.",
    detail: "La precisión empieza donde no se ve.",
  },
  {
    at: 0.29,
    label: "La estructura",
    title: "Convertimos ideas",
    accent: "en estructuras.",
    detail: "Pieza a pieza. Con oficio y precisión.",
  },
  {
    at: 0.63,
    label: "La arquitectura",
    title: "Construimos",
    accent: "el futuro.",
    detail: "Materia, luz y espacios que conectan.",
  },
  {
    at: 0.91,
    label: "El resultado",
    title: "Hacemos realidad",
    accent: "lo que imaginas.",
    detail: "Tu nuevo espacio empieza aquí.",
  },
] as const;
export const ART = {
  background: "#080f14",
  concrete: "#b9baa9",
  limestone: "#d7c9ad",
  metal: "#263a40",
  bronze: "#9a7952",
  glass: "#2c5664",
  foliage: "#30483c",
  blueprint: "#9ccecb",
  warm: "#ffcb8f",
};
export const clamp = (n: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, n));
export function chapterAt(progress: number) {
  let index = 0;
  CHAPTERS.forEach((chapter, i) => {
    if (progress >= chapter.at) index = i;
  });
  return index;
}
export const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Projected scene bounds into an art-directed screen rectangle. Orthographic
 * projection changes only on resize, never on the construction timeline. */
export function fitView(
  width: number,
  height: number,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
) {
  const portrait = width / height < 1.05;
  const rect = portrait
    ? { left: 0.035, right: 0.965, top: height < 740 ? 0.48 : 0.42, bottom: height < 740 ? 0.81 : 0.83 }
    : { left: 0.28, right: 0.99, top: 0.17, bottom: 0.90 };
  const units = Math.max(
    (bounds.maxX - bounds.minX) / ((rect.right - rect.left) * width),
    (bounds.maxY - bounds.minY) / ((rect.bottom - rect.top) * height),
  );
  const w = width * units,
    h = height * units;
  const cx =
    (bounds.minX + bounds.maxX) / 2 - ((rect.left + rect.right) / 2 - 0.5) * w;
  const cy =
    (bounds.minY + bounds.maxY) / 2 + ((rect.top + rect.bottom) / 2 - 0.5) * h;
  return {
    left: cx - w / 2,
    right: cx + w / 2,
    top: cy + h / 2,
    bottom: cy - h / 2,
  };
}
