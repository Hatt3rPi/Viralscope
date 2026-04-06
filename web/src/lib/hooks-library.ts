// Hook formula library organized by format, platform, and emotion
// Used as inspiration seeds for the AI hook generator — NOT literal copy

export interface HookFormula {
  formula: string;
  emotion: "curiosidad" | "urgencia" | "empatia" | "sorpresa" | "autoridad" | "fomo" | "aspiracion";
  example?: string;
}

export interface HookLibrary {
  [format: string]: {
    [platform: string]: HookFormula[];
  };
}

export const hooksLibrary: HookLibrary = {
  reel: {
    instagram: [
      { formula: "Probe [X] por [Y] tiempo y esto paso", emotion: "curiosidad", example: "Probe leerle cuentos personalizados a mi hijo por 30 dias" },
      { formula: "Nadie te dice esto sobre [tema]", emotion: "sorpresa" },
      { formula: "Si haces [error comun], mira esto", emotion: "urgencia" },
      { formula: "La verdad sobre [mito popular]", emotion: "autoridad" },
      { formula: "No cometas este error con [tema]", emotion: "urgencia" },
      { formula: "Esto cambiara tu forma de ver [tema]", emotion: "aspiracion" },
      { formula: "[Numero] cosas que aprendi sobre [tema]", emotion: "autoridad" },
      { formula: "POV: cuando descubres que [insight]", emotion: "empatia" },
      { formula: "El secreto que [grupo] no quiere que sepas", emotion: "curiosidad" },
      { formula: "Antes vs despues de [accion]", emotion: "aspiracion" },
    ],
    tiktok: [
      { formula: "Wait, you're still doing [old way]?", emotion: "sorpresa" },
      { formula: "Here's the hack nobody showed you", emotion: "curiosidad" },
      { formula: "Storytime: [gancho dramatico]", emotion: "empatia" },
      { formula: "Responde a @[comentario polemico]", emotion: "curiosidad" },
      { formula: "Cosas que [grupo] hace diferente", emotion: "aspiracion" },
    ],
  },
  carrusel: {
    instagram: [
      { formula: "[N] errores que cometes con [tema] (y como arreglarlos)", emotion: "urgencia" },
      { formula: "La guia completa de [tema] en [N] pasos", emotion: "autoridad" },
      { formula: "Guarda esto: [tema] explicado simple", emotion: "autoridad" },
      { formula: "[Pregunta provocadora]? La respuesta te sorprendera", emotion: "curiosidad" },
      { formula: "Lo que nadie te enseno sobre [tema]", emotion: "sorpresa" },
      { formula: "[Mito] vs [Realidad] — desliza para ver", emotion: "curiosidad" },
      { formula: "Si [situacion identificable], necesitas ver esto", emotion: "empatia" },
      { formula: "Checklist: [N] senales de que [situacion]", emotion: "urgencia" },
    ],
    linkedin: [
      { formula: "Analice [N] [cosas] y encontre esto", emotion: "autoridad" },
      { formula: "Opinion impopular: [declaracion]", emotion: "sorpresa" },
      { formula: "El framework de [N] pasos que uso para [resultado]", emotion: "autoridad" },
    ],
  },
  story: {
    instagram: [
      { formula: "Pregunta rapida: [pregunta polarizante]", emotion: "curiosidad" },
      { formula: "Esto o esto? [A vs B con sticker]", emotion: "curiosidad" },
      { formula: "Solo hoy: [oferta/contenido exclusivo]", emotion: "fomo" },
      { formula: "Detras de camaras de [proceso]", emotion: "empatia" },
      { formula: "Hot take: [opinion fuerte]", emotion: "sorpresa" },
    ],
  },
  static: {
    instagram: [
      { formula: "[Frase impactante corta]. (Punto y aparte dramatico)", emotion: "empatia" },
      { formula: "[Dato estadistico sorprendente]", emotion: "sorpresa" },
      { formula: "Reminder: [verdad reconfortante]", emotion: "empatia" },
      { formula: "[Pregunta retorica que todos se hacen]", emotion: "curiosidad" },
      { formula: "La diferencia entre [A] y [B] es [insight]", emotion: "autoridad" },
    ],
  },
};

// Get formulas for a specific format and platform
export function getFormulas(format: string, platform: string): HookFormula[] {
  const formatKey = format.toLowerCase().includes("carrusel") || format.toLowerCase().includes("carousel")
    ? "carrusel"
    : format.toLowerCase().includes("reel") || format.toLowerCase().includes("video")
      ? "reel"
      : format.toLowerCase().includes("story")
        ? "story"
        : "static";

  const platformKey = platform.toLowerCase();

  return hooksLibrary[formatKey]?.[platformKey]
    || hooksLibrary[formatKey]?.instagram
    || hooksLibrary.static?.instagram
    || [];
}

// Serialize formulas for prompt injection
export function formulasToPrompt(format: string, platform: string): string {
  const formulas = getFormulas(format, platform);
  if (formulas.length === 0) return "No hay formulas de referencia disponibles.";

  return formulas
    .map((f, i) => `${i + 1}. "${f.formula}" (${f.emotion})${f.example ? ` — ej: "${f.example}"` : ""}`)
    .join("\n");
}
