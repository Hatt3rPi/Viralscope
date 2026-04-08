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
  onboarding_status: "complete" as const,
  research_data: {},
  sim_personas: null,
  sim_personas_status: null,
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
  simulation_md: null,
  deep_sim_result: null,
  deep_sim_id: null,
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
      generator: "nanobanana_2",
      variant: "A",
      slot_theme: "lectura_dialogica",
      slot_angle: "No es leer más, es leer diferente",
      settings: {
        aspect_ratio: "9:16",
        count: 8,
        quality: "2k_unlimited",
      },
      art_direction: {
        concept:
          "El momento exacto en que una madre hace una pregunta a su hijo durante la lectura. No es el antes ni el después — es ese instante de silencio cargado donde el niño está pensando su respuesta. El libro está abierto, la madre lo sostiene inclinada hacia él, y el niño tiene la boca entreabierta a punto de responder. Es la intimidad más pequeña y más poderosa de la crianza.",
        style:
          "Fotografía editorial de crianza premium. Estilo Annie Leibovitz para revista de padres. Grano de película 35mm muy sutil. Sin filtros evidentes. Aspecto de foto robada de un momento real, no posada. Referencia visual: editorial Kinfolk familia + apartado crianza de NYT Parenting.",
        mood: "Íntimo, cálido, concentrado. La emoción es la curiosidad del niño y la atención total de la madre. Silencio activo. Amor sin teatralidad.",
        color_palette: {
          dominant:
            "#F7F0FF — lavanda suave del ambiente, paredes de dormitorio o sala de estar con luz cálida",
          accents: [
            "#F59E0B — tono dorado del libro físico tapa dura, luz de lámpara de noche calentando la escena",
            "#7C3AED — presencia muy sutil, quizás en el detalle del lomo del libro o un cojín fuera de foco",
            "#D4A574 — tono piel realista y cálido de ambos personajes, sin sobreexposición",
          ],
          temperature:
            "Cálida. Balance de blancos entre 3800K-4200K. Como una lámpara incandescente encendida en una tarde nublada.",
        },
        composition: {
          framing:
            "Vertical 9:16. Los dos personajes ocupan el tercio inferior-central del encuadre. El tercio superior tiene espacio para texto overlay con cielo de fondo oscurecido o pared suave. El libro visible en el tercio inferior crea un triángulo visual: libro → cara del niño → cara de la madre.",
          rule: "Regla de los tercios invertida: el peso visual está abajo, dejando el área superior aireada para texto. Los ojos del niño caen en el cruce de tercios inferior-izquierdo.",
          focal_point:
            "Los ojos del niño mirando a su madre, ligeramente desenfocados en el libro. El punto de foco preciso es el iris del niño — todo lo demás tiene bokeh suave pero no genérico de estudio.",
          negative_space:
            "El tercio superior de la imagen: fondo de pared con textura de estuco o madera clara, ligeramente subexpuesto. Aquí va el texto principal del reel.",
        },
        lighting: {
          type: "Luz de práctica + relleno natural. Una lámpara de mesa fuera de cuadro a la derecha crea el calor principal. Una ventana difusa a la izquierda rellena las sombras sin anularlas. Las sombras son suaves pero presentes — no es iluminación de estudio.",
          direction:
            "Lateral derecha, 45 grados, baja (altura de la lámpara de noche de una mesita). Esto crea sombras naturales en el lateral de la cara del niño.",
          quality:
            "Soft light pero con contraste. No es la luz plana de stock photo. Hay una zona de luz y una zona de sombra claramente diferenciadas pero con transición gradual. El libro refleja sutilmente la luz en sus páginas.",
        },
        subjects: [
          {
            description:
              "Niño latinoamericano, 3-5 años, pelo oscuro ligeramente desordenado como recién levantado de la siesta o en pijama. Cara redonda, piel trigueña media, expresión de concentración activa — está pensando la respuesta a la pregunta que acaba de escuchar.",
            expression:
              "Boca entreabierta, cejas ligeramente levantadas, ojos mirando hacia arriba-izquierda (gesto de búsqueda cognitiva real). Es la expresión genuina de 'estoy pensando'. NO sonrisa forzada. NO cara de sorpresa exagerada.",
            clothing:
              "Pijama de algodón, colores neutros (gris claro, crema o azul marino muy suave). Tela con textura visible. Quizás una manga ligeramente arrugada. Sin logos ni estampados llamativos.",
            action:
              "Sentado con las piernas cruzadas sobre la cama o sofá. El cuerpo ligeramente inclinado hacia el libro. Una mano apoya la barbilla o toca el borde de la página. Postura de quien está completamente absorbido en algo.",
          },
          {
            description:
              "Mujer latinoamericana, 33-40 años, Camila. Profesional, no idealizada. Pelo oscuro mediano suelto o en cola informal. Sin maquillaje evidente o maquillaje natural. Piel trigueña clara con pequeñas imperfecciones normales (no piel de plástico).",
            expression:
              "Atención total dirigida al niño. Inclinada levemente hacia él, esperando su respuesta. Los ojos tienen suavidad — no son brillantes artificiales. Es la cara de una madre que genuinamente quiere escuchar lo que su hijo tiene que decir.",
            clothing:
              "Ropa de estar en casa cómoda pero no desaliñada: sweater de punto en tono neutro (gris, beige, verde salvia suave) o camisa de lino holgada. Tela con textura real visible. Ninguna marca visible.",
            action:
              "Sostiene el libro abierto con ambas manos, inclinada hacia el niño a una distancia de unos 40cm. El libro está en el tercio inferior central del encuadre. Su cabeza está ladeada levemente hacia él, en postura de escucha activa.",
          },
        ],
        environment: {
          setting:
            "Dormitorio infantil o rincón de sofá en sala de estar. Ambiente chileno clase media-alta, no aspiracional excesivo. Una habitación que ha sido vivida: hay una almohada ligeramente aplastada, quizás un segundo libro en el borde del encuadre fuera de foco.",
          props: [
            "Libro infantil de tapa dura en tonos cálidos, abierto a una doble página con ilustraciones coloridas visibles pero no identificables",
            "Lámpara de mesa pequeña fuera de cuadro, generando el halo de luz cálida",
            "Cojín o manta de punto en el borde del encuadre, textura visible",
            "Quizás un segundo libro cerrado en el suelo cerca — establece que la lectura es habitual en esta casa",
          ],
          textures: [
            "Sábanas o funda de almohada de algodón con ligeras arrugas naturales",
            "Madera del suelo o de una mesita de noche con veta visible",
            "Tejido de punto del sweater de la madre",
            "Papel de las páginas del libro, blanco cálido con reflejo de lámpara",
            "Estuco rugoso de pared al fondo, suavemente desenfocado",
          ],
          depth:
            "Tres planos claramente diferenciados: fondo (pared texturada, desenfocada), plano medio (cuerpos de madre e hijo, en foco), primer plano (esquina del libro y mano del niño, muy ligeramente desenfocada). El bokeh es óptico, no generado artificialmente.",
        },
        anti_ai_directives: [
          "Las manos DEBEN tener exactamente 5 dedos con proporciones anatómicas correctas. Si hay incertidumbre, ocultar una mano detrás del libro.",
          "La piel tiene poros, pequeñas manchas, y textura real. NO piel de plástico brillante o hiper-lisa.",
          "Los ojos tienen blancos con venas sutiles y reflejos de la luz específica de la escena (la lámpara). NO ojos con catchlights genéricos o brillo sobrenatural.",
          "La composición tiene UNA asimetría intencional: madre e hijo no están perfectamente centrados ni perfectamente simétricas sus alturas.",
          "El fondo NO es bokeh circular perfecto de lente de estudio. Es bokeh real con algo reconocible: textura de pared, forma de ventana, silueta de mueble.",
          "Las arrugas de la ropa son reales y asimétricas, no colocadas artificialmente.",
          "El libro tiene grosor real visible en el lomo, no es plano como recorte.",
          "EVITAR: sonrisa dentada forzada en cualquiera de los dos, pose simétrica espejo, fondo completamente liso y uniforme.",
        ],
        text_overlay: {
          required: true,
          position:
            "Tercio superior, centrado. Margen de seguridad de 80px en los laterales para no cortar en dispositivos.",
          text: "Leer en silencio es bueno.\nLeer haciendo preguntas\nduplica el desarrollo del lenguaje.",
          notes:
            "Fuente Sour Gummy weight 700 para la primera línea (pequeña, 28px), Sour Gummy weight 800 para las líneas 2-3 (grande, 42px). Color blanco con sombra drop muy sutil (2px blur, 40% opacidad negro) para legibilidad sobre cualquier fondo. La tercera línea en color #F59E0B amber para énfasis. Alineación centrada.",
        },
        reference_styles: [
          "Annie Leibovitz — series familiares para Vogue, especialmente la iluminación lateral cálida y el foco en micro-expresiones",
          "Kinfolk Magazine — fotografía de familia en interiores, paleta cálida, composición aireada",
          "NYT Parenting editorial photography — momentos reales de crianza sin glamourización excesiva",
          "Fotografía de Céline Clanet para Le Monde — grano de película, naturalidad, luz de práctica",
        ],
      },
      prompt_string:
        "Editorial photography, Chilean Latin American mother 35yo and her 4yo son reading together on a bed, intimate moment, she holds an open hardcover children's book, he has his mouth slightly open thinking about her question, genuine cognitive search expression, boy's eyes looking up-left, warm incandescent lamp light from right side, soft natural window fill from left, slight film grain texture, cotton pajamas with fabric texture visible, knit sweater on mother, wooden floor visible, slightly asymmetric composition, medium-format photography feel, warm color temperature 4000K, natural Latin skin tones with realistic pores, soft bokeh background showing textured wall, no plastic skin, no perfect symmetry, real hand anatomy, Kinfolk magazine aesthetic, 9:16 vertical portrait",
      negative_prompt:
        "cartoon, illustration, clipart, stock photo, perfect symmetry, plastic skin, glowing eyes, generic studio bokeh, 6 fingers, forced smile, teeth showing unnaturally, overly bright catchlights, makeup-heavy, posed stiffness, white seamless background, AI art style, oversaturated colors, dramatic vignette, lens flare, watermark, text in image",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      variant: "A",
      slot_theme: "lectura_dialogica",
      slot_angle:
        "No es leer más, es leer diferente — ángulo emocional/storytelling",
      settings: {
        aspect_ratio: "9:16",
        duration_seconds: 40,
        fps: 30,
      },
      art_direction: {
        concept:
          "El reel comienza como si el espectador pasara por el pasillo y viera por la puerta entreabierta una escena de lectura. Lo que parece ordinario se revela como un acto extraordinario. El cambio de perspectiva ocurre cuando la cámara se acerca lentamente y el espectador nota: no están leyendo en silencio, están conversando sobre el libro. Eso es la lectura dialógica. La revelación emocional llega a los 15 segundos.",
        visual_style:
          "Documental íntimo de crianza. Estilo de corto cinematográfico, no de reel publicitario. La cámara observa, no dirige. Paleta cálida y desaturada ligeramente — como si los colores fueran reales pero en su versión más nostálgica. Grano de película digital sutil (ISO 800 simulado).",
        mood: "Nostalgia dulce que activa en Camila el deseo de replicar esa escena hoy mismo con su hijo. La emoción predominante es la ternura con un subtexto de 'yo quiero esto para mí'.",
        color_grading: {
          lut_reference:
            "Kodak Vision3 250D — tono fílmico cálido, sombras ligeramente azuladas, highlights dorados. Referencia: película 'Room' de Lenny Abrahamson (escenas cálidas de madre-hijo) o 'Beasts of the Southern Wild'.",
          temperature:
            "Warm — 4200K base, con halos dorados de lámpara en las altas luces",
          saturation:
            "Ligeramente desaturado (-15 en Lumetri) excepto los tonos naranjas-dorados que se preservan o realzan sutilmente. Hace que la escena se vea como un recuerdo en el momento en que sucede.",
        },
        scenes: [
          {
            time_range: "0-3s",
            scene_type: "hook",
            shot_type:
              "Plano americano moviéndose a close-up. Comenzamos viendo a madre e hijo de espaldas leyendo en el sofá — no se ve el libro. Parece una escena de lectura cualquiera.",
            camera_movement:
              "Lento dolly in desde detrás-lateral derecha. La cámara no sabe todavía qué es lo que importa. Movimiento fluido como steadicam suave, no estabilizado digitalmente.",
            subject_action:
              "La madre sostiene el libro abierto. El niño está recostado contra ella. Silencio. Desde este ángulo parece lectura normal en silencio.",
            environment:
              "Sala de estar chilena, sofá de tela gris claro, almohada de colores suaves, ventana lateral con luz de tarde. Sin mostrar nada del libro todavía.",
            audio_direction:
              "Silencio ambiente de casa por 0.5s. Luego fade in muy suave de música instrumental — piano minimalista con textura de cuerdas. A los 1s se escucha levemente la voz de fondo de la madre leyendo, ininteligible pero presente. Crea intriga.",
            transition_to_next:
              "El dolly in continúa, la cámara pasa al lateral de la pareja y por primera vez vemos el libro y la cara del niño.",
          },
          {
            time_range: "3-15s",
            scene_type: "context",
            shot_type:
              "Secuencia de 3 planos: (1) Close-up lateral de madre e hijo desde el lado — ahora vemos que ella no está leyendo, está mirando al niño con una pregunta en los labios. (2) Extreme close-up del libro abierto con la mano del niño señalando una ilustración. (3) Close-up del rostro del niño con su expresión pensativa genuina.",
            camera_movement:
              "Plano 1: Estático con muy leve respiración orgánica (handheld 5% de movimiento). Plano 2: Tilt down lento del libro a la mano. Plano 3: Rack focus sutil desde la mano al rostro.",
            subject_action:
              "La madre formula una pregunta al niño señalando una ilustración del libro: '¿Y tú qué harías si vieras un dragón?' El niño reflexiona con su expresión de búsqueda cognitiva — boca entreabierta, ojos arriba. Luego responde animadamente con gestos.",
            environment:
              "Mismo sofá. La luz de tarde crea un halo dorado. En el fondo fuera de foco se intuye una librería con otros libros — establece que son una familia lectora.",
            audio_direction:
              "La música sube muy levemente en presencia. El diálogo de la madre al niño es audible y natural — no es actuación, suena como grabación real de casa. La voz del niño respondiendo crea el gancho emocional. Voiceover en OFF aún no empieza.",
            transition_to_next:
              "Corte en el momento en que el niño termina su respuesta y la madre asiente sonriendo. Es un momento de conexión pura. La siguiente escena inicia con voiceover.",
          },
          {
            time_range: "15-35s",
            scene_type: "value",
            shot_type:
              "Secuencia de 4 planos alternados: close-up de cara del niño / plano medio de los dos / close-up del libro / plano detalle de las manos (madre sosteniendo, niño señalando). Los planos duran 3-4 segundos cada uno — ritmo pausado, no acelerado.",
            camera_movement:
              "Plano a plano con cortes limpios. Ningún zoom digital. Un plano tiene leve pan seguimiento cuando el niño gesticula con el brazo. El último plano (manos) tiene un dolly out muy lento que revela la escena completa.",
            subject_action:
              "El diálogo de lectura dialógica continúa en loop natural. La madre señala ilustraciones, hace preguntas abiertas, escucha las respuestas del niño con atención total. El niño está completamente activado — señala, habla, se mueve ligeramente. Es un niño que piensa, no que escucha pasivo.",
            environment:
              "Misma sala. La luz va cambiando muy levemente hacia más dorada (como si pasaran 20 minutos). Detalle: en un momento se ve la mano del niño tocar el libro con familiaridad — como si fuera suyo.",
            audio_direction:
              "A los 15s entra voiceover femenino natural, chileno (no locutora, sueña como la hermana mayor de Camila contándole algo importante): 'Hay un pequeño cambio en cómo leemos que tiene un impacto enorme en el cerebro de los niños. Se llama lectura dialógica. Y la diferencia está en una sola cosa: las preguntas.' La música baja a -12dB para dar protagonismo a la voz. A los 28s la música sube levemente.",
            transition_to_next:
              "El dolly out final del plano de manos se detiene en el plano completo de madre-hijo. La imagen se pausa un frame. Corte a última escena.",
          },
          {
            time_range: "35-40s",
            scene_type: "cta",
            shot_type:
              "Close-up del rostro del niño mirando hacia la cámara — no directamente a lens, sino hacia la madre que le pregunta algo. Es como si mirara al espectador sin saberlo. Máximo impacto emocional en el momento de menor duración.",
            camera_movement:
              "Estático. Ningún movimiento. La quietud es intencional — después de toda la suavidad del reel, este plano fijo crea peso. El niño está sonriendo ligeramente en respuesta a algo que su madre le preguntó. No es sonrisa forzada: es la sonrisa de quien acaba de decir algo que le parece gracioso.",
            subject_action:
              "El niño mira al frente (donde está la madre). Tiene el libro en el regazo. Su expresión alterna entre pensativo y ligeramente sonriente. No se mueve mucho — solo la respiración y el micro-movimiento natural.",
            audio_direction:
              "El voiceover dice suave: 'Esta noche, mientras lees, prueba una pregunta. Solo una.' Pausa de 1 segundo. La música sube con un acorde resolutivo cálido. Fade out suave en los últimos 0.5s.",
          },
        ],
        b_roll_suggestions: [
          "Plano detalle: páginas de libro pasando en cámara lenta — se ven las ilustraciones coloridas borrosas, solo se entiende que es un libro de cuentos",
          "Plano detalle: la mano pequeña del niño señalando con el dedo índice una parte del libro",
          "Plano muy cerrado: los labios del niño moviéndose mientras habla — sin audio claro, solo la textura del habla",
          "Plano detalles: taza de té humeante en la mesa lateral — establece la hora y el ambiente sin decir nada",
          "Plano angular: desde el suelo mirando hacia arriba, se ve el libro de frente y las caras de ambos en el fondo — perspectiva del suelo, poco usual, impactante",
        ],
        anti_ai_directives: [
          "Los movimientos de cámara deben ser imperfectamente suaves — como steadicam de presupuesto medio, no como drone perfecto ni como trípode rígido.",
          "El audio ambiente del hogar debe estar presente: un refrigerador zumbando levemente, un auto pasando afuera, el crujido del sofá.",
          "La actuación del niño NO debe ser actuación — si el niño es real, que sea real. Si es generado, debe tener micro-movimientos aleatorios: parpadeos no sincronizados, ajustes de postura sutiles.",
          "La madre NO mira a la cámara en ningún momento. Su atención es 100% su hijo.",
          "La iluminación cambia ligeramente entre planos (como es normal al cambiar el ángulo en una habitación real). No iluminación perfectamente consistente.",
          "EVITAR: transiciones con efectos (wipe, zoom out extremo, glitch). Solo cortes limpios o muy suave dissolve.",
          "EVITAR: música con beat demasiado marcado o trending sounds de TikTok que fechen el video en un mes específico.",
          "El texto overlay no tiene animaciones llamativas (ningún bounce, ningún efecto tipo maquinaria de texto). Solo fade in/out limpio.",
        ],
        audio: {
          music_style:
            "Piano minimalista con cuerdas de fondo — tipo Max Richter 'On the Nature of Daylight' o Nils Frahm 'Says'. Tempo lento (60-70 BPM). Debe sentirse como el score de un cortometraje de festival, no como una canción reconocible que quedará desactualizada.",
          voiceover: true,
          voiceover_tone:
            "Mujer chilena, 32-38 años. Voz cálida pero no locutora. Habla como contándole algo a una amiga cercana. Velocidad media-lenta. Ningún tono de vendedora. Cercana, inteligente, con una leve sonrisa implícita en las palabras. Sin énfasis exagerados. Sin pausas dramáticas artificiales.",
          sound_effects: [
            "Páginas de libro siendo pasadas suavemente — muy bajo en el mix, casi subliminal",
            "Sonido ambiente de sala de estar chilena — refrigerador distante, quizás lluvia suave al fondo (establece Chile)",
            "Crujido sutil del sofá cuando el niño se mueve",
          ],
        },
        reference_styles: [
          "Film 'Room' (2015) de Lenny Abrahamson — paleta cálida, intimidad madre-hijo, planos cerrados que crean un mundo propio",
          "Cortos de UNICEF sobre primera infancia — documental íntimo, sin artificialidad",
          "Publicidad de Patagonia para familia — autenticidad, luz natural, anti-stock",
          "Editorial de video The New Yorker 'How to Read to Kids' — ritmo pausado, información valiosa, planos cuidados",
        ],
      },
      prompt_string:
        "Cinematic 9:16 vertical video, intimate documentary style, Chilean Latin American mother 35yo reading with her 4yo son on a sofa, warm afternoon light from side window, she asks him a question pointing to illustrated book page, boy has genuine thinking expression mouth slightly open eyes upward, soft handheld camera movement, warm film grade Kodak Vision3, slight grain, close-up sequence alternating child face and book details, no tripod-perfect stability, natural home ambient sounds, soft piano score, Kinfolk aesthetic, real skin texture no plastic, authentic Latin family not stock photo, 30fps",
      negative_prompt:
        "stock footage, perfect stabilization, studio lighting, white background, forced acting, teeth-showing fake smile, generic transition effects, TikTok trending sound, bright oversaturated colors, cartoon or animation overlay, talking head static shot, teleprompter stiffness, Instagram filter look, echo chamber audio, 6 fingers",
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
      generator: "nanobanana_2",
      variant: "B",
      slot_theme: "lectura_dialogica",
      slot_angle:
        "La ciencia detrás de algo cotidiano — ángulo educativo/datos",
      settings: {
        aspect_ratio: "9:16",
        count: 8,
        quality: "2k_unlimited",
      },
      art_direction: {
        concept:
          "Una imagen que visualmente sugiere 'el cerebro del niño activándose' sin caer en ilustraciones médicas o iconografía de cerebro genérica. El concepto se transmite a través de la escena: la misma situación de lectura, pero con una diferencia visual clave — hay una especie de 'energía' o 'activación' que se siente en la postura y la expresión del niño, como si literalmente se pudiera ver que está procesando, conectando, respondiendo. El contraste con 'leer en silencio' está implícito en la dinámica de la escena.",
        style:
          "Fotografía editorial científica de divulgación. Como las imágenes interiores de National Geographic cuando cubre neurociencia infantil o como los spreads visuales de New Scientist. Real pero con intención conceptual. Hay un elemento visual que 'representa' el dato científico sin graficarlo explícitamente.",
        mood: "Sorpresa intelectual. La sensación de 'no sabía esto y me cambia algo'. Curiosidad activada. Como cuando lees un dato y dices 'wow, ¿en serio?'. El tono es más frío que la variante A pero con calidez humana como âncora.",
        color_palette: {
          dominant:
            "#1F2937 — fondo oscuro o zona oscura que da contraste y seriedad científica. Puede ser una pared de biblioteca o un ambiente más tenue.",
          accents: [
            "#7C3AED — presencia más fuerte que en variante A. Puede aparecer como un objeto del ambiente (libro con lomo púrpura, alfombra, cojín) o como un halo de luz sobre el niño",
            "#F59E0B — amber para detallar el punto focal: las páginas del libro abiertas, la zona de las manos y el libro brillan ligeramente más que el resto",
            "#F7F0FF — lavanda muy suave como el único punto claro en una imagen más oscura que la variante A",
          ],
          temperature:
            "Neutra-fría con toques cálidos estratégicos. Balance de blancos 5000K-5500K. No es la calidez de la variante A — es más luminosa en los puntos de datos y más oscura en los bordes. Contraste mayor.",
        },
        composition: {
          framing:
            "Vertical 9:16. Composición en dos zonas visuales: zona inferior oscura con madre-hijo leyendo (plano tierra, realidad) y zona superior con espacio para texto y un elemento visual conceptual (un patrón de luz, un halo, algo que connote 'activación'). La línea divisoria no es literal — es gradiente.",
          rule: "Composición diagonal: el libro en la esquina inferior izquierda, la cara del niño en el centro, y el espacio de texto en el tercio superior. El ojo viaja desde el libro → la cara activada → el dato escrito arriba.",
          focal_point:
            "El rostro del niño en el momento de responder — la boca abierta en respuesta activa, no en silencio pasivo. Este es el contraste visual con 'leer en silencio': aquí el niño está HABLANDO.",
          negative_space:
            "Zona superior derecha más oscura con gradiente hacia el texto. El espacio vacío es intencional y da peso al dato científico cuando aparece el texto.",
        },
        lighting: {
          type: "Iluminación en dos zonas: luz de lectura concentrada en el libro y los rostros (como una linterna o una lámpara de arquitecto enfocada), y oscuridad ambiente. Es la iluminación de quien lee de noche con una sola luz encendida. Más cinematográfica y menos de revista de decoración que la variante A.",
          direction:
            "Contraluz suave desde detrás del libro: las páginas parecen brillar ligeramente desde dentro, como si el contenido del libro irradiara. Relleno muy sutil desde arriba para las caras.",
          quality:
            "Alto contraste pero sin perder detalle en las sombras. Las zonas de sombra tienen información — se ven los cuerpos y el ambiente, pero en versión oscura y texturada. Ratio de contraste 4:1 aproximadamente.",
        },
        subjects: [
          {
            description:
              "Niño latinoamericano, 4-6 años. En esta variante el niño tiene más energía y activación que en la A — está en pleno proceso de respuesta. El enfoque científico requiere mostrar 'al cerebro en acción', lo que visualmente significa: boca abierta hablando, gestos de mano, postura inclinada hacia adelante.",
            expression:
              "Boca abierta respondiendo activamente — no solo pensando como en variante A, aquí ya está HABLANDO. Los ojos brillan de genuino entusiasmo por lo que está diciendo. Cejas ligeramente levantadas de emoción. Es la expresión de 'eso te cuento yo'. Real, no forzado.",
            clothing:
              "Ropa de noche o tarde: pijama o ropa casual de interior. En esta variante se acepta un tono más oscuro — quizás un suéter azul marino o gris oscuro que armoniza con la paleta más oscura.",
            action:
              "Una mano señala el libro mientras la otra gesticula explicando algo. El cuerpo está inclinado hacia adelante, hacia la madre. La energía cinética del niño es el 'dato visual' de que el cerebro está activo.",
          },
          {
            description:
              "Madre latinoamericana, 33-40 años. En segundo plano ligeramente más oscuro que el niño — visualmente ella es el catalizador, él es el resultado. Esto refuerza el mensaje científico: la pregunta de ella activa él a él.",
            expression:
              "Escuchando con intensidad y leve sonrisa de satisfacción. Como quien ve un experimento que está funcionando exactamente como esperaba. Hay algo de 'mira eso' en su cara. No es orgullo performativo — es asombro íntimo.",
            clothing:
              "Ropa oscura que la hace receder visualmente pero no desaparecer: jersey oscuro, pelo recogido. Ella es marco, él es figura.",
            action:
              "Sostiene el libro en posición ligeramente abierta hacia el niño. La mano libre está en su barbilla en postura de escucha activa.",
          },
        ],
        environment: {
          setting:
            "Rincón de biblioteca o estudio en casa. Más libros en el fondo que en la variante A. Estantes con libros fuera de foco crean una sensación de 'contexto académico' sin ser una biblioteca formal. Es el estudio o la sala de una profesional que también tiene hijos.",
          props: [
            "Estantes con libros en el fondo (fuera de foco pero reconocibles como libros adultos, no solo infantiles)",
            "Una taza de infusión en la mesita — establece que ella también estaba estudiando o leyendo antes de este momento",
            "El libro infantil abierto, con las páginas brillando ligeramente bajo la luz concentrada",
            "Una pequeña lámpara de arquitecto o lámpara de mesa con luz dirección",
            "Opcionalmente: un post-it o cuaderno en el borde del encuadre — ella es una mamá profesional",
          ],
          textures: [
            "Lomos de libros en el fondo — colores variados, texturas de tela y papel visibles aunque desenfocados",
            "Superficie de madera oscura de la mesa o estante",
            "Tela del sofá o silla, textura de lino o terciopelo suave",
            "Las páginas iluminadas del libro — blanco cálido con micro-textura de papel",
          ],
          depth:
            "Mayor profundidad de campo que la variante A. Los libros del fondo son reconocibles aunque desenfocados. Tres planos: estantes oscuros al fondo, madre en segundo plano más oscuro, niño en primer plano más iluminado.",
        },
        anti_ai_directives: [
          "La mano del niño gesticulando debe tener exactamente 5 dedos en posición natural de habla — dedos en movimiento, no perfectamente extendidos.",
          "El brillo de las páginas del libro es reflejo de una fuente de luz específica (la lámpara), no un brillo mágico sobrenatural.",
          "Los libros del fondo son libros reales con títulos borrosos pero espinas plausibles — no texturas genéricas de 'libros IA'.",
          "La diferencia de iluminación entre madre (más oscura) y niño (más iluminado) es intencional y anatómicamente correcta según la posición de la lámpara.",
          "El niño habla — su boca está abierta de forma anatómicamente correcta para producir habla, no bostezo ni grito.",
          "EVITAR: iconografía de cerebro, ondas de radio, efectos de partículas o cualquier elemento gráfico que trate de 'visualizar' la neurociencia literalmente.",
          "EVITAR: la escena se vea como una foto de experimento científico — debe seguir siendo un momento de hogar auténtico.",
        ],
        text_overlay: {
          required: true,
          position:
            "Dos zonas: (1) Hook en el tercio superior, centrado. (2) Dato científico en el tercio inferior sobre área oscura, como etiqueta de laboratorio.",
          text: "ZONA SUPERIOR: '¿Por qué su cerebro trabaja\n3x más cuando le PREGUNTAS?'\n\nZONA INFERIOR (pequeño, al estilo caption científico): 'Lectura dialógica — Universidad de Oxford, 1988-2024'",
          notes:
            "Zona superior: Sour Gummy Bold, blanco, 38px. La palabra 'PREGUNTAS' en #F59E0B amber y más grande (46px). Zona inferior: Poppins Regular, blanco 70% opacidad, 18px — da credibilidad científica sin ser el foco. El estilo de la zona inferior imita los captions de papers visualizados en divulgación científica.",
        },
        reference_styles: [
          "National Geographic — spreads interiores sobre neurociencia o primera infancia. Iluminación concentrada, fondo oscuro, sujeto iluminado.",
          "New Scientist magazine covers — fotografía conceptual que representa ciencia a través de situaciones cotidianas",
          "TED Talk visuals — la combinación de dato + imagen humana real + paleta oscura con acento de color",
          "Fotografía de Rineke Dijkstra — presencia del sujeto, fondo limpio que no distrae, honestidad en el retrato",
        ],
      },
      prompt_string:
        "Editorial scientific photography, dark moody interior library setting, Chilean Latin American mother and 4yo son reading together, child is actively speaking mouth open gesticulating with hand pointing at book, warm focused desk lamp light illuminating child's face and open book pages, mother in slightly darker second plane listening intently, bookshelves out-of-focus background, low-key chiaroscuro lighting, warm-cold contrast, natural skin texture, authentic gestures not posed, 9:16 vertical, medium-format film aesthetic, National Geographic editorial style, no artificial brain imagery, real home environment not laboratory",
      negative_prompt:
        "brain illustrations, neural network graphics, glowing effects, particle effects, perfect studio lighting, white background, stock photo poses, clipart science icons, oversaturated neon colors, plastic skin, symmetrical composition, forced smile, generic bokeh, AI art aesthetic, cartoon overlay, laboratory setting, medical imagery",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      variant: "B",
      slot_theme: "lectura_dialogica",
      slot_angle:
        "La ciencia detrás de algo cotidiano — ángulo educativo/datos",
      settings: {
        aspect_ratio: "9:16",
        duration_seconds: 40,
        fps: 30,
      },
      art_direction: {
        concept:
          "El reel empieza con un dato que parece imposible. La estructura es la de un experimento que el espectador puede replicar en casa esta noche. El 'experimento' es simplemente cambiar cómo lees: de silencio a preguntas. El video muestra el contraste entre los dos modos de lectura — primero la lectura pasiva (niño escuchando en silencio, cara de trance) y luego la lectura dialógica (niño activado, respondiendo, gesticulando). El impacto visual del contraste es el argumento más poderoso del video.",
        visual_style:
          "Híbrido entre documental científico de divulgación y reel editorial de crianza. La primera mitad tiene un tono más sobrio y conceptual. La segunda mitad se calienta emocionalmente. Como un episodio de 'Abstract: The Art of Design' de Netflix pero en 40 segundos y sobre crianza.",
        mood: "Asombro intelectual que se convierte en motivación práctica. El espectador termina el video sintiendo que tiene un superpoder nuevo y sencillo. 'Puedo hacer esto. Esta noche.'",
        color_grading: {
          lut_reference:
            "Fuji Eterna Cinema 400 — contraste medio-alto, sombras densas pero con detalle, altas luces contenidas. La primera parte del video (lectura pasiva) tiene una versión más desaturada y fría del grado. La segunda parte (lectura dialógica) cambia sutilmente a más cálida — como si el propio color celebrara la activación.",
          temperature:
            "Primera parte 5500K (neutro-frío, científico). Segunda parte 4000K (cálido, emocional). La transición de temperatura es gradual entre los 15-20 segundos — nadie lo nota conscientemente pero lo siente.",
          saturation:
            "Primera parte: -20 saturación (casi monocromático excepto los tonos piel). Segunda parte: saturación normal -5. El color cobra vida cuando el niño se activa.",
        },
        scenes: [
          {
            time_range: "0-3s",
            scene_type: "hook",
            shot_type:
              "Plano muy cerrado del libro abierto. No se ven caras todavía. Solo el libro sostenido por manos adultas. La voz de la madre leyendo en silencio (palabras claras, tono monótono de lectura). El niño no habla. Luego, una pregunta: '¿Y tú qué harías?' — y el niño explota con respuesta. Corte rápido al texto del hook.",
            camera_movement:
              "Macro zoom muy lento hacia las páginas del libro durante 0-2s. A los 2s corte seco a plano medio del niño respondiendo.",
            subject_action:
              "Manos adultas sosteniendo libro. Luego niño respondiendo con energía — transición abrupta de pasividad a activación. La diferencia física es el argumento.",
            environment:
              "Interior de casa, iluminación neutra pero con carácter. Misma habitación en ambas mitades — la diferencia es el color grading y la energía de los sujetos, no el ambiente.",
            audio_direction:
              "Audio diegético de la madre leyendo en silencio durante 0-1.5s — voz monótona tranquila, palabras reconocibles de cuento infantil. A 1.5s ella hace la pregunta. A 2s el niño explota respondiendo. Corte súbito a silencio por 0.3s. Luego entra la música.",
            transition_to_next:
              "Cut seco — el corte abrupto entre silencio y la respuesta del niño es intencional. El silencio de 0.3s entre los dos hace que el espectador aguante la respiración.",
          },
          {
            time_range: "3-15s",
            scene_type: "context",
            shot_type:
              "Split visual mental (no efecto gráfico — solo cortes alternados): 3 segundos de lectura pasiva (niño escucha, cara neutra, poco movimiento) / 3 segundos de lectura dialógica (niño habla, gesticula, ojos brillantes). Los planos son del mismo niño, misma luz, misma ropa. Solo cambia lo que está haciendo.",
            camera_movement:
              "Planos estáticos en ambos casos. La inmovilidad de la cámara hace que el contraste entre los sujetos sea más evidente. A los 10s, en el plano de lectura dialógica, la cámara hace un muy lento push in hacia la cara del niño hablando.",
            subject_action:
              "MODO PASIVO: niño recostado, ojos semi-fijos en el libro, boca cerrada, manos quietas. MODO DIALÓGICO: mismo niño inclinado, boca abierta hablando, mano señalando, ojos conectados con la madre. El contraste físico es dramático.",
            environment:
              "Misma sala. El grado de color cambia entre los dos modos: frío-desaturado para lectura pasiva, cálido para lectura dialógica.",
            audio_direction:
              "Para modo pasivo: música fría minimalista (sola cuerda de piano suave). Para modo dialógico: la misma música pero con capa de cuerdas que la enriquece. Las voces diegéticas están presentes pero en plano bajo — no se escuchan palabras claras.",
            transition_to_next:
              "El último plano de lectura dialógica se extiende medio segundo más de lo que se esperaría — el niño sigue hablando animadamente y la cámara lo deja. Luego corte a voiceover.",
          },
          {
            time_range: "15-35s",
            scene_type: "value",
            shot_type:
              "Plano medio estable de la madre haciendo una pregunta al niño — se ve su cara por primera vez en primer plano. La madre es el científico de la escena. Su pregunta al niño es el 'protocolo'. Luego secuencia de planos cercanos: cara del niño pensando, luego respondiendo, la madre tomando nota mental (o en un papel).",
            camera_movement:
              "Cámara en trípode para los planos de datos — da autoridad científica. Para los planos emocionales de cierre (28s-35s) vuelve el handheld suave. El cambio es intencional: datos con tripode, emoción con handheld.",
            subject_action:
              "La madre formula preguntas abiertas sobre el libro: '¿Por qué crees que el personaje hizo eso?' El niño responde con vocabulario más rico del que usa normalmente. En un momento dice una palabra 'difícil' correctamente en contexto — ese momento es el 'experimento funcionando'.",
            environment:
              "Primer plano de madre: la cámara finalmente está cerca de ella y se ve su atención total. Fondo con estantes de libros, cálido. El ambiente se volvió más cálido en esta parte (grading shift).",
            audio_direction:
              "Voiceover masculino chileno (contraste con variante A que era femenino). Voz de divulgador científico accesible — tipo el tono de un podcast de ciencia popular. Dice: 'En los años 80, investigadores de Oxford compararon dos grupos de padres. Unos leían en silencio. Otros leían haciendo preguntas. A los 9 meses, el segundo grupo tenía hijos con vocabulario 8 meses más adelantado. No con libros más caros. No con más tiempo. Solo con preguntas.' Música de fondo sube gradualmente.",
            transition_to_next:
              "El voiceover termina. Un beat de silencio de 0.5s. Luego corte a CTA.",
          },
          {
            time_range: "35-40s",
            scene_type: "cta",
            shot_type:
              "Plano de detalle: las manos del niño sosteniendo el libro — ya no son las manos de la madre, son las suyas propias. Un símbolo visual de autonomía lectora. La madre señala algo en la página desde afuera del cuadro — solo se ve su mano entrando al encuadre.",
            camera_movement:
              "Dolly out muy lento que revela el contexto: era un libro, es una escena de aprendizaje, es un hogar. El dolly termina en plano medio que muestra madre e hijo juntos.",
            subject_action:
              "El niño sostiene el libro como suyo. Su postura es de dueño del libro, no de receptor pasivo. La madre entra al cuadro señalando una página y él responde señalando también.",
            audio_direction:
              "El voiceover retoma con tono íntimo: 'Intenta esto esta noche. Solo una pregunta. Después cuéntanos cómo te fue.' La música sube a volumen normal y hace un fade out limpio en los últimos 0.8s.",
          },
        ],
        b_roll_suggestions: [
          "Plano de detalle: los dedos del niño contando con las manos mientras responde — señal visual de procesamiento cognitivo",
          "Plano muy cerrado de los ojos del niño durante la lectura pasiva (ojos perdidos) vs lectura dialógica (ojos conectados con la madre) — el contraste es brutalmente claro",
          "Plano de corte: taza de café de la madre en la mesa, ella no la toca durante toda la escena — está 100% enfocada en el niño",
          "Plano de detalle: las páginas del libro con las ilustraciones — se ven ligeramente borrosas pero coloridas, el niño señala algo específico",
          "Plano de perspectiva del libro mirando hacia arriba: se ve el libro desde abajo y al fondo las dos caras inclinadas hacia él",
        ],
        anti_ai_directives: [
          "El contraste entre modo pasivo y modo dialógico debe ser una diferencia de COMPORTAMIENTO del sujeto, no de iluminación artificial o efectos visuales.",
          "Los datos en texto deben aparecer de forma limpia y legible — sin animaciones de 'datos volando' ni efectos de scanlines ni tipografía de hacker.",
          "La voz en off no tiene música de fondo que la tape. Es legible al 100% sin auriculares.",
          "Las manos del niño cuando señala el libro tienen dedos anatómicamente correctos y en posición natural de señalar.",
          "El dolly out final revela un hogar real — hay imperfecciones: una mochila en el suelo, libros apilados irregularmente, una ventana con cortina ligeramente torcida.",
          "EVITAR: iconos, gráficos animados de cerebro o neuronas, cualquier overlay que 'explique' la neurociencia visualmente con ilustraciones.",
          "EVITAR: el cambio de color grading entre modo pasivo y dialógico sea tan evidente que parezca un efecto de color — debe ser sutil, el espectador lo siente más que lo ve.",
        ],
        audio: {
          music_style:
            "Ambient minimalista de cuerdas con progresión — comienza frío (cuarteto de cuerdas suave, modo menor) y evoluciona hacia más cálido (se añade piano en modo mayor a los 20s). Referencia: Ólafur Arnalds o Johann Johannsson. El arco emocional de la música espeja el del video.",
          voiceover: true,
          voiceover_tone:
            "Hombre chileno, 35-42 años. Voz de divulgador científico accesible — como el conductor de un podcast de ciencia popular. No es locutor de radio. Habla con certeza pero sin pedantería. Velocidad normal-rápida para la sección de datos (transmite urgencia intelectual), luego más lento para la sección de CTA (aterriza emocionalmente).",
          sound_effects: [
            "Silencio deliberado de 0.3s entre el hook y la música — el silencio actúa como transición",
            "Páginas del libro siendo pasadas — muy sutil en la sección de datos",
            "Ambiente de casa chilena — refrigerador distante, quizás lluvia suave",
          ],
        },
        reference_styles: [
          "Abstract: The Art of Design (Netflix) — rigor visual, planos de detalle, datos presentados como arte",
          "Kurzgesagt — estructura de divulgación científica (dato impactante → contexto → mecanismo → aplicación) adaptada a formato visual real",
          "Pediatrics journal video abstracts — sobriedad científica con emocionalidad humana",
          "Documentales de NatGeo sobre primera infancia — paleta oscura iluminada, autoridad visual, sin condescendencia",
        ],
      },
      prompt_string:
        "Cinematic 9:16 educational documentary video, Chilean Latin American family, contrast sequence between passive reading (child static listening, neutral desaturated grade) and dialogic reading (child actively responding gesticulating, warm grade), mother asking questions pointing at illustrated book, child 4yo genuine animated response with hand gestures, bookshelf background, mixed warm-cool lighting, Fuji Eterna film grade color shift mid-video from cold to warm, scientific documentary aesthetic not stock footage, handheld stability on emotional shots tripod on data shots, natural sounds ambient home Chile",
      negative_prompt:
        "brain animation overlays, neural network graphics, neon data visualization, stock footage, studio white background, static talking head, teleprompter delivery, oversaturated Instagram filter, jump cuts too fast, music drowning voice, 6 fingers, plastic skin, forced acting children",
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
      generator: "nanobanana_2",
      variant: "C",
      slot_theme: "lectura_dialogica",
      slot_angle:
        "Directo al punto — close-up impactante, visualmente simple pero poderoso",
      settings: {
        aspect_ratio: "9:16",
        count: 8,
        quality: "2k_unlimited",
      },
      art_direction: {
        concept:
          "Una sola imagen, un solo sujeto, una sola emoción. El close-up extremo de la cara de un niño exactamente en el momento de dar una respuesta. La boca levemente abierta, los ojos encendidos, una mano levantada como quien tiene la respuesta. No hay contexto explícito — pero el texto overlay lo entrega todo. La imagen es tan directa que para el scroll en el primer frame.",
        style:
          "Retrato editorial impactante. Richard Avedon conoce a Sebatião Salgado en formato Instagram. La composición es casi minimalista pero la imagen tiene una textura emocional densa. Es el tipo de imagen que Camila guarda y manda por WhatsApp a su pareja diciendo 'mira esta cara, parece X cuando le hago una pregunta'.",
        mood: "Impacto inmediato. La emoción es el reconocimiento: 'esa cara la conozco'. Camila ve a su propio hijo en esa imagen. El gancho es la identificación instantánea, no la belleza ni la aspiración.",
        color_palette: {
          dominant:
            "#F7F0FF — lavanda suave del fondo. El fondo es casi neutro-claro para que el sujeto tenga máximo protagonismo. No es blanco estudio — es la pared de una habitación con luz de día filtrada.",
          accents: [
            "#7C3AED — aparece en un elemento pequeño pero estratégico: quizás el detalle del libro parcialmente visible en el borde inferior, o el cojín fuera de cuadro que arroja un reflejo muy sutil en el fondo",
            "#F59E0B — amber en los ojos del niño — no como efecto artificial sino como el reflejo natural de una fuente de luz cálida lateral que crea ese brillo dorado orgánico en el iris",
            "#D4A574 — tono piel latinoamericano natural, sin filtros, sin blanqueamiento",
          ],
          temperature:
            "Cálida. 4000K. La única fuente de luz cálida es lateral — crea sombra en un lado de la cara del niño que da dimensión y evita la planura de una foto de estudio.",
        },
        composition: {
          framing:
            "Extreme close-up. La cara del niño ocupa 60-70% del encuadre. Los bordes cortan parte del pelo arriba y de la barbilla abajo — una composición intencionalmente 'demasiado cerca'. Esta proximidad es el impacto. El espectador siente que está a 20cm del niño.",
          rule: "No hay regla de tercios aquí. Los ojos del niño están en el centro perfecto del encuadre — la única vez en estos 6 JSONs donde la simetría se usa intencionalmente, porque la simetría de un retrato close-up crea una fuerza visual diferente. Los ojos del niño te miran directamente al pecho.",
          focal_point:
            "Los ojos. El foco es razor-sharp en los ojos — cada pestaña individual, el iris con su textura real, los catchlights de la fuente de luz específica. Todo lo demás — nariz, boca, pelo — tiene un microsutil desenfoque que empuja el foco hacia los ojos.",
          negative_space:
            "El tercio superior del encuadre, donde el pelo del niño y el fondo lavanda crean espacio para el texto principal. El tercio inferior, debajo de la barbilla, también tiene espacio limpio para texto de soporte.",
        },
        lighting: {
          type: "Un único punto de luz. Lateral izquierdo, alto. Como la luz de una ventana en una mañana nublada pero luminosa. Sombra natural en el lateral derecho de la cara — dimensión sin dramatismo extremo.",
          direction:
            "45 grados lateral izquierdo, 30 grados desde arriba. Clásico rembrandt lighting suavizado — hay triángulo de luz en la mejilla del lado oscuro pero muy suave.",
          quality:
            "Soft pero con presencia. El box de luz es grande — como si hubiera una ventana grande difundida con tela fina. Las sombras tienen bordes graduales. No hay sombras duras. El contorno del pelo tiene un halo muy sutil de luz de ambiente.",
        },
        subjects: [
          {
            description:
              "Niño latinoamericano, 4-6 años. Solo él. Solo su cara. Pelo oscuro ligeramente desordenado. Piel trigueña real con la textura de una piel infantil: suave pero no de plástico — hay pequeñas imperfecciones como la marca casi invisible de cuando se rascó en algún momento, o una mínima costra de resfrío pasado.",
            expression:
              "El micro-instante entre escuchar la pregunta y empezar a responder. Es la expresión más específica de este brief: ojos que acaban de iluminarse (el momento exacto de 'tengo la respuesta'), boca que se está abriendo pero aún no habla, ceja derecha levemente más alta que la izquierda. Es una asimetría de 2-3mm que hace la expresión completamente real. Esta expresión dura aproximadamente 0.3 segundos en la vida real — lo que la hace tan difícil de capturar es lo que la hace tan poderosa aquí.",
            clothing:
              "Solo se ve el cuello y los hombros — ropa casual infantil, sin importar el color. No distraer del rostro.",
            action:
              "Completamente estático en el cuerpo. Solo la expresión facial está 'en movimiento'. Quizás una mano levantada ligeramente en el borde del encuadre — el gesto de 'yo sé, yo sé' que hacen los niños cuando quieren responder antes de que les pregunten.",
          },
        ],
        environment: {
          setting:
            "Interior de casa. Casi no se ve — el fondo es fondo. Lo poco visible es pared de color lavanda suave (#F7F0FF) con una textura de estuco muy leve. En el borde inferior del encuadre, fuera de foco, el canto del libro — aporta contexto sin robarlo.",
          props: [
            "El canto del libro en el borde inferior — fuera de foco, solo se reconoce por la forma y el color de la tapa. Establece el contexto sin explicarlo.",
            "Opcionalmente: el borde de una mano adulta en el margen derecho del encuadre — fuera de cuadro casi completo, solo los dedos visibles. Establece que hay alguien más en la escena sin mostrarlo.",
          ],
          textures: [
            "Piel del niño — textura real, poros visibles en nariz y mejillas",
            "Pestañas — visibles individualmente en el foco razor-sharp de los ojos",
            "Pelo — mechones individuales, algunos capturan la luz lateral y brillan levemente",
            "La pared de fondo — textura de estuco muy suave, casi imperceptible pero presente",
          ],
          depth:
            "Extremadamente poca profundidad de campo. El plano de foco tiene 2-3cm de profundidad. Los ojos en foco perfecto, la punta de la nariz levemente desenfocada, las orejas completamente fuera de foco. El libro en el borde inferior completamente bokeh. Este nivel de desenfoque se logra con apertura f/1.4-1.8 simulada.",
        },
        anti_ai_directives: [
          "Los ojos deben ser anatómicamente correctos: pupila, iris con textura real (no iris plano de un solo color), esclerótica con las venas sutiles normales de un niño activo, catchlights que reflejan específicamente la ventana lateral (rectángulo, no punto perfecto).",
          "La asimetría de la expresión es CRÍTICA: la ceja derecha 2-3mm más alta, la comisura izquierda levemente diferente a la derecha. Las caras simétricas se ven falsas.",
          "El pelo tiene capas — algunos mechones sobre la frente, algunos detrás, la textura de pelo latinoamericano oscuro con su brillo específico.",
          "La piel NO es perfectamente lisa. Un niño de 5 años tiene alguna marca de juego, una pequeña cicatriz en la frente, la textura natural de piel joven real.",
          "Los catchlights en los ojos son el reflejo específico de UNA ventana lateral — no dos puntos simétricos, no un reflejo circular perfecto, sino la forma rectangular irregular de una ventana real.",
          "La mano levantada en el borde del encuadre tiene exactamente 5 dedos en posición natural de 'yo quiero responder' — no todos extendidos rígidamente.",
          "EVITAR: sonrisa dentada (la expresión específica que buscamos no muestra dientes), ojos de anime o excesivamente grandes, piel completamente lisa, pelo perfectamente peinado, fondo completamente uniforme sin textura.",
        ],
        text_overlay: {
          required: true,
          position:
            "Dos bloques. Bloque 1: tercio superior sobre el pelo/fondo, centrado. Bloque 2: borde inferior, centrado, sobre el área del libro fuera de foco.",
          text: "BLOQUE SUPERIOR (grande, impactante):\n'¿Por qué esta cara\ncambia todo?'\n\nBLOQUE INFERIOR (pequeño, dato):\n'La pregunta que hiciste\nactivó algo en su cerebro.'",
          notes:
            "Bloque superior: Sour Gummy Black (o ExtraBold) 46px, blanco puro. Sin sombra — la pared lavanda es suficientemente clara para dar contraste. Bloque inferior: Poppins Regular Italic, 20px, blanco 85% opacidad. El italic da sensación de reflexión, de pensamiento. Espaciado generoso entre las dos líneas del bloque superior.",
        },
        reference_styles: [
          "Richard Avedon — retratos en blanco y negro. Aquí en color pero misma filosofía: el sujeto llena el encuadre, el fondo desaparece, la emoción es todo.",
          "Steve McCurry 'Afghan Girl' — close-up que captura un micro-momento emocional genuino con foco perfecto en los ojos",
          "Revista TIME Portrait covers — impacto visual inmediato, sujeto en primer plano, texto conciso",
          "Fotografía de Oleg Oprisco — bokeh extremo con foco selectivo, aire de ensueño pero base real",
        ],
      },
      prompt_string:
        "Extreme close-up portrait, 4yo Chilean Latin American boy, face fills 65% of frame, slightly disheveled dark hair, genuine pre-response expression mouth beginning to open eyes just lighting up with answer, razor-sharp focus on eyes with real iris texture and natural window catchlight rectangle, slight asymmetry right eyebrow 3mm higher, natural trigueño Latin skin with real pores and texture, soft single lateral window light from left creating gentle Rembrandt shadow, lavender soft background (#F7F0FF) with subtle stucco texture, blurred book corner in lower frame edge, shallow depth of field f/1.4 equivalent, warm 4000K, 9:16 vertical, Richard Avedon portrait philosophy, absolutely no plastic skin no symmetric expression no studio lighting",
      negative_prompt:
        "symmetric perfect face, plastic smooth skin, glowing magical eyes, studio two-point lighting, smile showing teeth, generic portrait backdrop, stock photo child, posed stiffness, artificial catchlights perfect circles, neon colors, cartoon aesthetic, baby face unrealistically cute, multiple people, wide shot, full body",
    },
    art_direction_video_json: {
      type: "video",
      generator: "higgsfield_cinema",
      variant: "C",
      slot_theme: "lectura_dialogica",
      slot_angle:
        "Directo al punto — visualmente simple, máximo impacto, CTA agresivo",
      settings: {
        aspect_ratio: "9:16",
        duration_seconds: 40,
        fps: 30,
      },
      art_direction: {
        concept:
          "El reel más directo del set. Estructura de 'revelación en 3 actos' comprimida al máximo: (1) el problema nombrado crudamente, (2) el mecanismo explicado con un solo dato, (3) la acción concreta. Sin rodeos. Sin poesía. Sin historia larga. Cada segundo es información con propósito. La estética visual refuerza la directividad: encuadres limpios, edición rápida pero no frenética, paleta reducida.",
        visual_style:
          "Editorial directo. Cercano al estilo de los mejores TikTok educativos de alto rendimiento pero con producción de reel de crianza premium. Sin los trucos baratos de TikTok (sin POV forzado, sin 'storytime' falso, sin actuación exagerada). La directividad viene de la estructura, no de efectos visuales.",
        mood: "Urgencia calmada. Como cuando un médico te da un consejo directo y concreto: serio, claro, sin drama, pero no puedes ignorarlo. Camila termina este reel sintiendo que tiene una tarea para esta noche.",
        color_grading: {
          lut_reference:
            "Kodak Portra 400 — skin tones cálidos y ricos, sombras suaves, altas luces ligeramente quemadas. Es el LUT que hace que las caras se vean más reales y presentes. La paleta es más saturada que las variantes A y B — transmite urgencia y presencia.",
          temperature:
            "Constante 4500K durante todo el video. No hay cambio de temperatura porque el video no tiene transformación emocional — es directamente al punto desde el primer frame hasta el último.",
          saturation:
            "Normal a ligeramente elevada (+8 en Lumetri). Los colores más vividos transmiten urgencia. El púrpura #7C3AED de cualquier elemento de marca se preserva intacto.",
        },
        scenes: [
          {
            time_range: "0-3s",
            scene_type: "hook",
            shot_type:
              "Close-up frontal de la cara de la madre mirando directamente a la cámara. No es un 'hablar a la cámara' estilo vlog — es más bien como si la cámara hubiera aparecido de improviso y la madre acabara de decir algo importante. Sus ojos están en la cámara por 1 segundo, luego se dirige al niño. Ese 1 segundo de contacto visual directo es el gancho.",
            camera_movement:
              "Completamente estático. Trípode firme. La quietud de la cámara hace que el movimiento del sujeto tenga más peso. El único movimiento en este plano es el de la madre.",
            subject_action:
              "La madre mira directo a la cámara por 1 segundo — expresión seria pero no fría. Luego gira hacia el niño que está fuera de cuadro y le pregunta: '¿Por qué crees que el oso estaba solo?' El niño responde desde fuera de cuadro — se escucha su voz pero no se le ve. El contraste entre la pregunta simple de la madre y la respuesta elaborada del niño (que lleva 3-4 palabras más de lo que esperarías) es el hook.",
            environment:
              "Sala de estar, sofá. Todo limpio pero real. La cámara está donde normalmente no está — directamente frente a la madre a 80cm, como si alguien hubiera dejado el teléfono en un soporte frente a ella.",
            audio_direction:
              "Silencio absoluto en los primeros 0.3s — muy antinatural, crea tensión inmediata. Luego la voz de la madre pregunta. Luego la voz del niño responde. Luego entra la música a baja intensidad. No hay música en los primeros 3 segundos — el silencio y las voces reales son el gancho de audio.",
            transition_to_next:
              "La madre asiente al escuchar la respuesta del niño. Corte seco al plano del niño.",
          },
          {
            time_range: "3-15s",
            scene_type: "context",
            shot_type:
              "Plano medio del niño respondiendo la pregunta de la madre — ahora lo vemos. El plano dura 4 segundos de corrido sin cortes. Vemos al niño terminando su respuesta, que es sorprendentemente elaborada para su edad. Luego corte a plano medio de la madre (misma posición pero ahora mirando al niño). Luego corte a plano cerrado del libro. Luego, texto directo en pantalla negra (el único momento de pantalla negra en todo el set).",
            camera_movement:
              "Plano del niño: estático. Plano de la madre: estático. Plano del libro: macro lento. Pantalla de texto: fade from black.",
            subject_action:
              "El niño responde con su vocabulario propio, gesticulando. Su respuesta tiene lógica narrativa y empleo correcto del tiempo pasado — detalle que una madre profesional notará como significativo. La madre escucha sin interrumpir hasta que él termina.",
            environment:
              "En el plano de texto negro: nada. La pantalla oscura hace que el texto sea absolutamente imposible de ignorar.",
            audio_direction:
              "La voz del niño respondiendo es el audio principal — nada más. Cuando llega la pantalla oscura, silencio total por 0.5s. Luego voiceover entra directamente, sin música bajo. La ausencia de música en las pantallas de texto da peso máximo a las palabras.",
            transition_to_next:
              "Fade from black suave de 0.3s hacia la siguiente escena.",
          },
          {
            time_range: "15-35s",
            scene_type: "value",
            shot_type:
              "Secuencia de planos cortos y directos (2-3 segundos cada uno): (1) Close-up del niño señalando el libro. (2) Close-up de la boca de la madre haciendo una pregunta (no se ve su cara completa — solo la boca). (3) Close-up de los ojos del niño iluminándose. (4) Plano detalle de las manos de ambos sobre el libro. (5) Plano medio final de los dos — el único plano 'completo' de la secuencia de valor, que actúa como resolución visual.",
            camera_movement:
              "Todos los planos son estáticos o con micro-movimiento de 1-2%. La velocidad de edición es constante — ningún plano dura más de 3.5 segundos. El ritmo de cortes es el metrónomo del video.",
            subject_action:
              "Cada plano captura un micro-momento específico de la lectura dialógica: la pregunta, la pausa de pensamiento, la respuesta, el señalar, el escuchar. Son los 5 movimientos de una danza que el espectador reconocerá porque es la que no está haciendo.",
            environment:
              "El ambiente pasa a segundo plano completamente. En esta sección, el ambiente es contexto, no protagonista. Solo importan las acciones.",
            audio_direction:
              "Voiceover femenino chileno retoma a los 15s. Tono de amiga experta: 'No necesitas leer más libros de crianza para esto. Solo necesitas pausar. Y preguntar. Una pregunta abierta — las que no se responden con sí o no. Eso es todo.' La música entra a los 20s como background suave. A los 28s sube levemente anticipando el CTA.",
            transition_to_next:
              "El plano medio final de madre e hijo se detiene en un frame congelado por 0.5s — efecto de freeze frame sutil antes de cortar al CTA. Este es el único efecto de postproducción en todo el video.",
          },
          {
            time_range: "35-40s",
            scene_type: "cta",
            shot_type:
              "El mismo close-up de la cara de la madre del hook — como bookend visual. Pero ahora ella está sonriendo al niño fuera de cuadro. La simetría con el inicio cierra el loop.",
            camera_movement:
              "Estático. Idéntico al plano del hook pero la expresión cambió.",
            subject_action:
              "La madre sonríe genuinamente al escuchar la respuesta de su hijo. Es la expresión de satisfacción de quien acaba de ver el resultado de algo que hizo bien. No es actuación — es la cara real de un padre cuando su hijo dice algo inteligente.",
            audio_direction:
              "La música alcanza su punto más alto (pero nunca es volumétrica). El voiceover dice: 'Esta noche, una pregunta. Solo una.' Pausa de 0.8s. 'Y cuéntanos qué respondió.' La música hace fade out con un cierre armónico limpio.",
          },
        ],
        b_roll_suggestions: [
          "El plano de 'solo la boca de la madre haciendo una pregunta' es el más arriesgado y el más poderoso — si funciona, para el scroll completamente",
          "Plano POV del libro: la cámara está donde está el libro, mirando hacia arriba a las dos caras inclinadas — perspectiva poco usual que crea interés visual inmediato",
          "Plano muy cerrado de los dedos del niño señalando el libro — se ve la uña con su textura real, la piel con sus pliegues, el movimiento del dedo indicando algo específico",
          "Freeze frame del instante exacto en que los ojos del niño 'encienden' — ese micro-momento capturado en video y congelado es la imagen más poderosa del formato",
        ],
        anti_ai_directives: [
          "La pantalla negra con texto no debe durar más de 3 segundos por plano — si dura más, el espectador asume que terminó el video y hace scroll.",
          "El plano de 'solo la boca de la madre' debe ser anatómicamente convincente: labios con textura real, no modelo de labios perfectos, con el micro-movimiento de quien está a punto de hablar.",
          "El freeze frame al final del plano de valor dura exactamente 0.5s — ni más (parece error de edición) ni menos (no se percibe el efecto).",
          "Los cortes de 2-3 segundos deben ser limpios — no jump cuts, no transiciones con efecto. El ritmo viene de la edición, no de efectos.",
          "El silencio de los primeros 0.3s del hook debe ser silencio real — ningún fade in de música, ningún tono de ambiente. El silencio absoluto en video mobile es antinatural y genera atención inmediata.",
          "EVITAR: el efecto 'zoom dramático' en cualquier momento, incluso si el generador lo propone como default.",
          "EVITAR: música con letra o con cualquier elemento vocal que compita con el voiceover.",
        ],
        audio: {
          music_style:
            "Minimalismo con pulso — diferente a las variantes A y B. Aquí la música tiene un pulso suave (no beat de tambor — algo más como un pizzicato de cuerdas o un patrón rítmico de piano). El pulso transmite urgencia sin agresividad. Referencia: Nils Frahm 'Says' — tiene pulso pero no beat. Tempo 80-90 BPM.",
          voiceover: true,
          voiceover_tone:
            "Mujer chilena, 30-35 años. El tono más directo de los tres variantes. Como una amiga que te dice algo importante en 30 segundos porque sabe que tienes poco tiempo. Ningún rodeo. Frases cortas. Puntos finales, no puntos suspensivos. Velocidad media-rápida. Sin música bajo hasta los 20s — el voiceover puro tiene más autoridad.",
          sound_effects: [
            "Silencio absoluto en los primeros 0.3s — antinatural, crea tensión",
            "Audio diegético de la voz del niño respondiendo — sin procesar, sin efectos",
            "El freeze frame tiene un micro-efecto sonoro casi imperceptible: una nota de piano grave que se sostiene 0.5s antes del corte al CTA",
          ],
        },
        reference_styles: [
          "Los mejores reels educativos de Ali Abdaal — estructura directa, sin rodeos, datos claros, CTA concreto",
          "Gary Vee early content — directividad y urgencia pero sin agresividad",
          "Vox Explain videos — estructura de revelación directa, dato → mecanismo → aplicación en tiempo mínimo",
          "Fotografía documental de Sebastião Salgado — cada plano tiene peso propio, ninguno es de relleno",
        ],
      },
      prompt_string:
        "Direct editorial cinematic 9:16 video, Chilean Latin American mother 33yo looking directly at camera for 1 second then to her child, close-up tight composition, static tripod shots, 2-3 second cuts, child 4yo responding question with elaborate vocabulary gesturing, close-up sequences alternating mother question and child response, Kodak Portra 400 grade warm natural skin tones, black screen text panels between scenes, home living room authentic Chilean setting, no music first 3 seconds only diegetic voices, direct documentary no acting no staged poses",
      negative_prompt:
        "zoom effects, wipe transitions, talking head with lower third name graphic, teleprompter stiffness, overly smooth camera movement, TikTok trending sound, stock music with lyrics, perfect symmetry shots, studio lighting, multiple effects layered, slow motion overuse, jump cuts faster than 1.5 seconds, generic Instagram filter grade",
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
