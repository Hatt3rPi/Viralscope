import type {
  Project,
  Campaign,
  Slot,
  Brief,
  Variante,
  Feedback,
} from "./types";

// ── Consistent IDs ──────────────────────────────────────────────────────────
const PROJECT_ID = "proj-lacuenteria-001";
const CAMPAIGN_ID = "camp-ig-abril-2026";
const SLOT_ID = "slot-001-reel-neuro";

// ── Project ─────────────────────────────────────────────────────────────────
export const seedProject: Project = {
  id: PROJECT_ID,
  name: "La Cuentería",
  slug: "lacuenteria",
  brand_yaml: {
    name: "La Cuentería",
    tagline:
      "Cuentos infantiles personalizados con IA donde tu hijo es el protagonista",
    url: "https://lacuenteria.cl",
    niche: "cuentos infantiles personalizados con IA",
    visual: {
      colors: {
        primary: "#7C3AED",
        secondary: "#6A1B9A",
        accent: "#F59E0B",
        background: "#F7F0FF",
        text: "#1F2937",
      },
      typography: {
        headings: "Sour Gummy",
        body: "Poppins",
      },
      style: "editorial, cálido y profesional",
    },
    offerings: [
      { name: "Libro Digital", price_range: "$9.990 CLP" },
      { name: "Libro Físico", price_range: "$29.990 CLP" },
    ],
  },
  voice_yaml: {
    personality: [
      "cercana y cálida",
      "empática sin ser condescendiente",
      "experta con respaldo científico",
      "honesta y transparente",
    ],
    tone: "conversacional, cálido, directo, con base científica pero lenguaje accesible",
    formality: 2,
    narrator: "primera persona plural (nosotros)",
    addressing: "tú (informal)",
  },
  audiences_yaml: {
    personas: [
      { name: "Camila", age: "28-35", description: "Mamá profesional, IG heavy user" },
      { name: "Francisca", age: "55+", description: "Abuela activa, Facebook" },
      { name: "Valentina", age: "30-40", description: "Profesional salud infantil" },
      { name: "Tomás", age: "28-35", description: "Papá millennial" },
    ],
  },
  pillars_yaml: {
    pillars: [
      { id: "neurociencia", name: "Neurociencia de la lectura", weight: 0.25 },
      { id: "emocional", name: "Desarrollo emocional y biblioterapia", weight: 0.25 },
      { id: "crianza", name: "Crianza consciente y tips prácticos", weight: 0.20 },
      { id: "producto", name: "Producto y experiencia La Cuentería", weight: 0.20 },
      { id: "ocasiones", name: "Fechas especiales y regalos", weight: 0.10 },
    ],
  },
  competitors_yaml: {
    competitors: [
      { name: "Wonderbly", type: "direct", followers: "~200K-250K" },
      { name: "Hooray Heroes", type: "direct", followers: "~100K-150K" },
      { name: "Emotions", type: "direct-local", followers: "~32K" },
    ],
  },
  platforms_yaml: {
    platforms: {
      instagram: { active: true, handle: "@lacuenteriacl" },
    },
  },
  metrics_yaml: {
    last_updated: "2026-04-03",
    general: {
      total_followers: { instagram: 1006 },
    },
    meta_ads: { roas: 0.84 },
  },
  calendar_yaml: {
    national: [{ date: "05-11", name: "Día de la Mamá", relevance: "high" }],
    niche: [
      { date: "04-02", name: "Día del Libro Infantil", relevance: "high" },
      { date: "04-23", name: "Día del Libro (UNESCO)", relevance: "high" },
    ],
  },
  created_at: "2026-03-15T10:00:00Z",
};

// ── Campaign ────────────────────────────────────────────────────────────────
export const seedCampaign: Campaign = {
  id: CAMPAIGN_ID,
  project_id: PROJECT_ID,
  name: "Instagram Abril 2026",
  slug: "ig-abril-2026",
  period_start: "2026-04-01",
  period_end: "2026-04-30",
  platform: "instagram",
  objectives_json: {
    primary: "followers_ig",
    secondary: "engagement",
  },
  created_at: "2026-03-20T12:00:00Z",
};

// ── Slot ────────────────────────────────────────────────────────────────────
export const seedSlot: Slot = {
  id: SLOT_ID,
  campaign_id: CAMPAIGN_ID,
  slot_number: 1,
  date: "2026-04-09T18:00:00-04:00",
  format: "reel",
  pillar: "neurociencia",
  objective: "followers_ig",
  intention: "viral",
  topic:
    "La lectura dialógica — leer con preguntas duplica el desarrollo del lenguaje infantil",
  status: "art_review",
  current_step: "3-art",
  created_at: "2026-03-25T09:00:00Z",
};

// ── Brief ───────────────────────────────────────────────────────────────────
export const seedBrief: Brief = {
  id: "brief-001-reel-neuro",
  slot_id: SLOT_ID,
  brief_yaml: {
    slot_id: "001",
    date: "2026-04-09T18:00:00-04:00",
    platform: "instagram",
    format: "reel",
    pillar: "neurociencia",
    objective: "followers_ig",
    intention: "viral",
    topic:
      "La lectura dialógica — leer con preguntas duplica el desarrollo del lenguaje infantil",
    hook_direction:
      "Abrir con un dato contraintuitivo o estadística que contradiga lo que los padres creen sobre leer cuentos",
    cta_direction:
      "CTA de seguimiento: invitar a seguir la cuenta para recibir el script completo la próxima semana",
    persona_target: "Camila",
  },
  version: 1,
  approved_by: null,
  approved_at: null,
  created_at: "2026-03-26T10:00:00Z",
};

// ── Variantes ───────────────────────────────────────────────────────────────
const VARIANTE_A_COPY = `# Variante A — Emocional / Storytelling

**Tono:** emocional, storytelling

## Hook
> "¿Y si leer en silencio es el error?"

## Guión del Reel
### 0–3s — Gancho
"Le leías cuentos cada noche. Hacías todo bien. Y aun así, había algo que nadie te contó."

### 3–15s — Contexto
"La ciencia tiene un nombre para esto: lectura dialógica. Cuando lees con preguntas, el cerebro de tu hijo no solo escucha. Se activa."

### 15–35s — Valor
"Antes de pasar la página, le preguntas: ¿Qué crees que va a pasar ahora?"

### 35–40s — CTA
"No es leer más. Es leer diferente."

## Caption
Le leías cada noche y hacías todo bien 🤍 Pero hay un cambio que duplica el efecto.

## Hashtags
#lecturainfantil #crianzaconciencia #neurociencia`;

const VARIANTE_B_COPY = `# Variante B — Educativo / Datos

**Tono:** educativo, datos, respaldo científico

## Hook
> "+2x vocabulario. Solo cambiando cómo lees."

## Guión del Reel
### 0–3s — Gancho
"En 1988, Whitehurst midió qué pasaba cuando los padres hacían preguntas mientras leían."

### 3–15s — Contexto
"Cuando lees en silencio, tu hijo recibe el lenguaje de forma pasiva. Pero con preguntas, activas zonas completamente distintas."

### 15–35s — Valor
"3 preguntas que funcionan siempre:
1️⃣ ¿Qué crees que va a pasar?
2️⃣ ¿Por qué crees que él hizo eso?
3️⃣ ¿Tú qué harías?"

### 35–40s — CTA
"Esto es neurociencia replicada. Script completo la próxima semana."

## Caption
Un estudio cambió cómo entendemos la lectura infantil 🧠

## Hashtags
#neurocienciainfantil #lecturaefectiva #crianzabasadaenevidencia`;

const VARIANTE_C_COPY = `# Variante C — Directo / CTA Fuerte

**Tono:** directo, urgente

## Hook
> "Leer bien ≠ Leer efectivo"

## Guión del Reel
### 0–3s — Gancho
"Para. Hay una cosa que la mayoría de los papás hace perfectamente bien... pero de la forma menos efectiva."

### 3–15s — Contexto
"Leerle cada noche: perfecto. El problema es cuando lo hacemos en modo 'cuento de voz'. Solo tú hablando. Tu hijo pasivo."

### 15–35s — Valor
"El switch es simple: lectura dialógica. Antes de pasar la página, una pregunta."

### 35–40s — CTA
"Script completo la próxima semana. Síguenos."

## Caption
Leerle en silencio está bien 📖 Pero hay un modo que duplica el efecto.

## Hashtags
#lecturainfantil #crianzainteligente #neurociencia`;

export const seedVariantes: Variante[] = [
  {
    id: "var-001-A",
    slot_id: SLOT_ID,
    variant_label: "A",
    copy_md: VARIANTE_A_COPY,
    art_direction_image_json: {
      type: "image",
      generator: "gemini",
      prompt_string:
        "Editorial photography, Chilean Latin American mother 35yo and her 4yo son reading together on a bed, intimate moment, warm incandescent lamp light, slight film grain, Kinfolk magazine aesthetic, 9:16 vertical",
      negative_prompt: "cartoon, illustration, plastic skin, stock photo",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      prompt_string:
        "Cinematic 9:16 vertical video, intimate documentary style, Chilean mother reading with son on sofa, warm afternoon light, Kodak Vision3 film grade",
      scenes: [
        { time_range: "0-3s", scene_type: "hook" },
        { time_range: "3-15s", scene_type: "context" },
        { time_range: "15-35s", scene_type: "value" },
        { time_range: "35-40s", scene_type: "cta" },
      ],
    },
    image_url: null,
    video_url: null,
    video_prompt_json: null,
    simulation_score: 8.7,
    simulation_detail_json: null,
    status: "art_review",
    created_at: "2026-03-27T14:00:00Z",
  },
  {
    id: "var-001-B",
    slot_id: SLOT_ID,
    variant_label: "B",
    copy_md: VARIANTE_B_COPY,
    art_direction_image_json: {
      type: "image",
      generator: "gemini",
      prompt_string:
        "Clean infographic style, minimalist illustration of brain activation during reading, warm tones, editorial design, 9:16 vertical",
      negative_prompt: "cartoon, clipart, stock photo",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      prompt_string:
        "Educational reel with animated infographics and close-ups of child reading, warm editorial tones",
      scenes: [
        { time_range: "0-3s", scene_type: "hook" },
        { time_range: "3-15s", scene_type: "context" },
      ],
    },
    image_url: null,
    video_url: null,
    video_prompt_json: null,
    simulation_score: 7.2,
    simulation_detail_json: null,
    status: "art_review",
    created_at: "2026-03-27T14:05:00Z",
  },
  {
    id: "var-001-C",
    slot_id: SLOT_ID,
    variant_label: "C",
    copy_md: VARIANTE_C_COPY,
    art_direction_image_json: {
      type: "image",
      generator: "gemini",
      prompt_string:
        "Bold text overlay design on warm background, direct eye contact portrait, confident speaker energy, 9:16 vertical",
      negative_prompt: "cartoon, soft, pastel",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      prompt_string:
        "Direct-to-camera talking head style with bold text overlays and fast cuts",
      scenes: [
        { time_range: "0-3s", scene_type: "hook" },
        { time_range: "3-15s", scene_type: "context" },
      ],
    },
    image_url: null,
    video_url: null,
    video_prompt_json: null,
    simulation_score: 7.5,
    simulation_detail_json: null,
    status: "art_review",
    created_at: "2026-03-27T14:10:00Z",
  },
];

// ── Simulation Data ─────────────────────────────────────────────────────────
interface PersonaScores {
  atencion: number;
  resonancia: number;
  shareability: number;
  brand_fit: number;
  claridad_cta: number;
  memorabilidad: number;
}

interface PersonaSimulation {
  weight: number;
  scores: {
    A: PersonaScores;
    B: PersonaScores;
    C: PersonaScores;
  };
}

export const simulationData = {
  camila: {
    weight: 0.40,
    scores: {
      A: { atencion: 9, resonancia: 10, shareability: 9, brand_fit: 9, claridad_cta: 7, memorabilidad: 9 },
      B: { atencion: 7, resonancia: 5, shareability: 7, brand_fit: 8, claridad_cta: 8, memorabilidad: 7 },
      C: { atencion: 8, resonancia: 7, shareability: 7, brand_fit: 6, claridad_cta: 8, memorabilidad: 7 },
    },
  },
  francisca: {
    weight: 0.15,
    scores: {
      A: { atencion: 8, resonancia: 9, shareability: 9, brand_fit: 9, claridad_cta: 5, memorabilidad: 8 },
      B: { atencion: 5, resonancia: 4, shareability: 5, brand_fit: 7, claridad_cta: 4, memorabilidad: 5 },
      C: { atencion: 6, resonancia: 5, shareability: 6, brand_fit: 5, claridad_cta: 4, memorabilidad: 5 },
    },
  },
  valentina: {
    weight: 0.25,
    scores: {
      A: { atencion: 7, resonancia: 6, shareability: 6, brand_fit: 9, claridad_cta: 7, memorabilidad: 7 },
      B: { atencion: 9, resonancia: 7, shareability: 8, brand_fit: 9, claridad_cta: 8, memorabilidad: 8 },
      C: { atencion: 7, resonancia: 5, shareability: 5, brand_fit: 7, claridad_cta: 7, memorabilidad: 6 },
    },
  },
  tomas: {
    weight: 0.20,
    scores: {
      A: { atencion: 8, resonancia: 7, shareability: 7, brand_fit: 8, claridad_cta: 6, memorabilidad: 7 },
      B: { atencion: 8, resonancia: 6, shareability: 7, brand_fit: 8, claridad_cta: 7, memorabilidad: 7 },
      C: { atencion: 9, resonancia: 6, shareability: 6, brand_fit: 6, claridad_cta: 8, memorabilidad: 6 },
    },
  },
} as const satisfies Record<string, PersonaSimulation>;

// ── Feedback (empty by default, but typed) ──────────────────────────────────
export const seedFeedback: Feedback[] = [];

// ── Convenience re-exports ──────────────────────────────────────────────────
export const seedProjects: Project[] = [seedProject];
export const seedCampaigns: Campaign[] = [seedCampaign];
export const seedSlots: Slot[] = [seedSlot];
export const seedBriefs: Brief[] = [seedBrief];
