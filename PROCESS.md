# Viralscope — Proceso Operativo

**Versión:** 0.2
**Última actualización:** 4 abril 2026

Este documento define **cómo se ejecuta** Viralscope paso a paso. Cada paso especifica qué entra, qué se hace, y qué sale.

---

## Templates de Generación (template_funnel.md)

Los templates de `template_funnel.md` son herramientas que se usan dentro de pasos específicos:

| Template | Nombre | Se usa en | Función |
|----------|--------|-----------|---------|
| #1 | Cazador de Nicho + Ángulo Viral | Paso 3a | Generar pool de 30+ ideas de contenido |
| #2 | Generador de Ganchos | Paso 4b | 20 hooks por tema, 8 estilos |
| #3 | Guion de Reels Alta Retención | Paso 4b | Guiones por escenas (0-3s / 3-15s / 15-35s) |
| #4 | Carrusel Guardable | Paso 4b | Estructura de 10 slides con progresión |
| #5 | Leyenda que Convierte | Paso 4b | 3 versiones de caption (corta/media/larga) |
| #6 | Máquina de Comentarios | Paso 4b | 25 CTAs para comentarios en 5 categorías |
| #7 | Calendario Viral de 7 Días | Paso 3g | Estructura semanal de formatos y cadencia |
| #8 | Laboratorio de Viralización | Paso 10 | Análisis de publicación + mejoras concretas |

## Agentes y Motor de Simulación

### 4 Agentes

| Agente | Rol | Modelo LLM | Templates | Output |
|--------|-----|------------|-----------|--------|
| **Estratega** | Planifica parrilla: distribuye slots por pilares, objetivos, mix, fechas, arco emocional | Sonnet | #1, #7 | `parrilla` con N slots completos |
| **Generador de Contenido** | Genera 3 variantes por slot: copy, hooks, guiones, slides, CTAs, hashtags, alt text | Sonnet | #2, #3, #4, #5, #6 | 3 variantes completas por slot |
| **Director de Arte** | Genera art direction JSON para imagen y video por cada variante | Sonnet | — | `art_direction_image.json` + `art_direction_video.json` |
| **Analista de Viralización** | Prepara material para MiroFish, interpreta resultados de simulación, post-mortem post-publicación | Opus | #8 | Inputs para MiroFish, ranking, diagnósticos, versiones mejoradas |

### Motor de Simulación (MiroFish)

MiroFish **no es un agente** — es un motor externo de simulación multi-agente. El Analista de Viralización actúa como puente:

```
Generador + Director de Arte
         ↓
    3 variantes por slot
         ↓
  Analista de Viralización
  (prepara seed material + personas para MiroFish)
         ↓
      MiroFish
  (simula con agentes autónomos)
         ↓
  Analista de Viralización
  (interpreta reportes, rankea, selecciona ganadoras)
```

Alternativa MVP (sin MiroFish): el Analista ejecuta un panel de jueces LLM interno como simulación ligera.

### Modelo de Costos por Token

| Paso | Modelo | Justificación |
|------|--------|---------------|
| Generación de variantes (copy) | **Sonnet** | Alto volumen, calidad suficiente para copy social |
| Art direction JSON | **Sonnet** | Tarea estructurada, no requiere razonamiento profundo |
| Filtros rápidos (baseline check) | **Haiku** | Solo comparación, bajo costo |
| Análisis + preparación para MiroFish | **Opus** | Requiere razonamiento complejo sobre personas y métricas |
| Post-mortem + versiones mejoradas | **Opus** | Análisis profundo de por qué funcionó/falló |

### Variantes por Slot: 3 (no 5-8)

Reducir de 5-8 a **3 variantes** por slot:
- Variante A: tono emocional / storytelling
- Variante B: tono educativo / datos
- Variante C: tono directo / CTA fuerte

Justificación: 30 slots × 3 variantes = **90 variantes/mes** (vs 150-240 con 5-8). La reducción en costo es ~60% sin sacrificar diversidad significativa de tonos.

**Estimación de costo por run mensual (30 slots):**
- Generación (Sonnet): 90 variantes × ~2K tokens = ~180K tokens → ~$0.54
- Art direction (Sonnet): 90 JSONs × ~1K tokens = ~90K tokens → ~$0.27
- Filtros (Haiku): 90 checks × ~500 tokens = ~45K tokens → ~$0.01
- Análisis (Opus): 90 variantes evaluadas × ~2K tokens = ~180K tokens → ~$2.70
- **Total estimado: ~$3.50-$5.00 USD por run mensual** (sin MiroFish, sin generación de imágenes)

*Nota: MiroFish tiene su propio costo de API LLM (Qwen/OpenAI compatible) que se suma al total.*

---

## Visión general del proceso

```
PASO 0: Configuración de Run
         ↓
PASO 1: Carga de Contexto
         ↓
PASO 2: Recolección de Inteligencia
         ↓
PASO 3: Planificación de Parrilla
         ↓
PASO 4: Generación de Variantes
         ↓
PASO 5: Generación de Assets
         ↓
PASO 6: Simulación de Impacto
         ↓
PASO 7: Ranking y Selección
         ↓
PASO 8: Aprobación Humana
         ↓
PASO 9: Publicación
         ↓
PASO 10: Feedback Loop
```

---

## PASO 0: Configuración de Run

El humano define los parámetros de la ejecución.

**Input (del humano):**
- Marca (obligatorio)
- Período (mes/rango de fechas)
- Plataformas a generar (IG, TikTok, LinkedIn, etc.)
- Número total de contenidos
- Mix de intención (viral / calidad / comercial) — o usar default de la marca
- Nivel de assets (solo copy+prompts / +imágenes / +video)
- Nivel de simulación (panel LLM ligero / MiroFish completo)
- Dirección temática especial (opcional — ej: "este mes enfocarnos en vuelta a clases")

**Output:**
- Objeto `run_config` con todos los parámetros validados
- Confirmación al humano antes de proceder

**Ejemplo de comando:**
```
Genera la parrilla de mayo 2026 para La Cuentería.
30 contenidos. IG + TikTok.
Solo copy + prompts de imagen.
Mix: 4 virales, 24 calidad, 2 comerciales.
Dirección: vuelta a clases + día de la mamá.
```

---

## PASO 1: Carga de Contexto

El sistema lee todos los archivos seed de la marca y construye el contexto completo.

**Input:**
- `run_config` (del paso 0)
- Directorio `brands/{marca}/`

**Proceso:**
1. Leer `brand.yaml` → identidad, restricciones, productos
2. Leer `voice.yaml` → tono, vocabulario, ajustes por plataforma
3. Leer `audiences.yaml` → personas para simulación, datos reales
4. Leer `pillars.yaml` → pilares con weights para distribución
5. Leer `objectives.yaml` → objetivos con weights, mix de intención
6. Leer `competitors.yaml` → competidores para gap analysis
7. Leer `calendar.yaml` → fechas importantes en el período
8. Leer `platforms.yaml` → specs y restricciones por plataforma
9. Leer `metrics.yaml` → baseline, top/bottom posts históricos
10. Leer historial de parrillas anteriores (si existen)

**Validaciones:**
- Weights de pilares suman 1.0
- Weights de objetivos suman 1.0
- Content mix suma 1.0
- Plataformas seleccionadas están activas en la marca
- Al menos una persona definida para simulación

**Output:**
- `brand_context`: objeto unificado con todo el contexto de la marca
- Lista de alertas/warnings si algo falta o está desactualizado

---

## PASO 2: Recolección de Inteligencia

El sistema recopila información externa para alimentar la planificación.

**Input:**
- `brand_context` (del paso 1)
- `run_config` (período, plataformas)

**Proceso:**

### 2a. Fechas Importantes
1. Filtrar `calendar.yaml` por el período del run
2. Identificar fechas con `relevance: high` que requieren contenido dedicado
3. Calcular `advance_days` para determinar cuándo empezar a publicar contenido pre-fecha
4. Detectar temporadas activas en el período

**Output parcial:** Lista de fechas que deben tener slots dedicados en la parrilla.

### 2b. Trend Detection
1. Consultar PyTrends para tendencias del nicho en el país
2. (Futuro) Consultar trending audio/hashtags por plataforma
3. (Futuro) Consultar noticias del nicho
4. Filtrar tendencias por relevancia para la marca (usando `brand_context`)
5. Estimar ventana de oportunidad de cada tendencia

**Output parcial:** Lista de tendencias con ventana de vida útil y ángulo sugerido.

### 2c. Competitor Analysis
1. (Futuro) Scraping de últimos posts de competidores
2. Detectar temas que la competencia cubre y la marca no (gaps)
3. Detectar formatos que les funcionan y la marca no usa
4. Identificar oportunidades de diferenciación

**Output parcial:** Lista de content gaps y oportunidades competitivas.

### 2d. Feedback de Ciclos Anteriores
1. Revisar resultados reales del mes anterior (si existen en `metrics.yaml`)
2. Comparar scores simulados vs engagement real
3. Identificar qué funcionó y qué no
4. Extraer aprendizajes: temas, formatos, hooks, CTAs que over/under-performaron

**Output parcial:** Lista de aprendizajes y ajustes recomendados.

**Output consolidado:**
- `intelligence_report`: fechas, tendencias, gaps competitivos, aprendizajes del ciclo anterior

---

## PASO 3: Planificación de Parrilla

El sistema distribuye N contenidos en el período, balanceados estratégicamente.

**Input:**
- `brand_context` (paso 1)
- `intelligence_report` (paso 2)
- `run_config` (N contenidos, mix, plataformas, dirección temática)
- `template_funnel.md` → Template #1 "Cazador de Nicho + Ángulo Viral" (generación de ideas)
- `template_funnel.md` → Template #7 "Calendario viral de 7 días" (estructura semanal)

**Proceso:**

### 3a. Generación de Ideas Base (Template #1: Cazador de Nicho)
1. Usar Template #1 para generar pool de 30+ ideas de contenido alineadas a la marca
2. Cada idea incluye: tema, ángulo viral, promesa, formato ideal, gatillo de compartir, CTA
3. Filtrar ideas por relevancia al período y dirección temática del humano
4. Este pool alimenta la asignación de temas en el paso 3e

### 3b. Asignación de Slots por Fecha
1. Marcar slots fijos para fechas importantes con `relevance: high`
2. Distribuir slots restantes en el calendario según `posting_schedule` de cada plataforma (best_days, best_hours)
3. Espaciar contenido para evitar fatiga

### 3c. Distribución por Pilares
1. Asignar pilar a cada slot según weights de `pillars.yaml`
2. Asegurar que no haya más de 2-3 contenidos del mismo pilar seguidos (detección de fatiga)
3. Slots de fechas importantes se asignan al pilar `ocasiones` o al pilar más relevante

### 3d. Distribución por Objetivos
1. Asignar objetivo primario a cada slot según weights de `objectives.yaml`
2. Alinear objetivo con pilar (respetar `objective_alignment` de cada pilar)
3. Verificar que el mix de intención (viral/calidad/comercial) se respete globalmente

### 3e. Asignación de Formato
1. Por cada slot, asignar formato según la plataforma y el pilar (`formats_preferred`)
2. Respetar frecuencia máxima por formato (de `platforms.yaml`)
3. Variar formatos para evitar monotonía

### 3f. Asignación de Tema
1. Del pool de ideas (paso 3a), asignar tema específico a cada slot basado en:
   - Pilar asignado + topics del pilar
   - Fechas importantes cercanas
   - Tendencias detectadas
   - Content gaps competitivos
   - Dirección temática del humano (si la dio)
   - Aprendizajes del ciclo anterior (temas que funcionaron → repetir variación; temas que fallaron → evitar)
2. Verificar que no se repitan temas textualmente

### 3g. Estructura Semanal (Template #7: Calendario Viral)
1. Usar Template #7 como referencia para la estructura semanal:
   - Distribución de formatos por día (reels, carruseles, stories)
   - Cadencia y ritmo de publicación
   - Stories diarios como calentamiento
   - Lista de verificación operativa por día
2. Verificar que la secuencia semanal tenga variación emocional
3. Aplicar arco emocional: inspiración → educación → controversia → comunidad+comercial

### 3h. Content Series
1. Identificar temas que se prestan a serialización (2-3 partes)
2. Agrupar slots consecutivos para series
3. Marcar la relación entre partes

### 3i. Story Funnel
1. Por cada post clave del día, generar 2-3 slots de stories previas como calentamiento
2. Marcar relación story → post principal

**Output:**
- `parrilla`: array de N slots, cada uno con:
  - `date`: fecha y hora de publicación
  - `platform`: plataforma(s) destino
  - `pillar`: pilar de contenido
  - `objective`: objetivo primario
  - `intention`: viral / calidad / comercial
  - `format`: reel / carrusel / story / static / video / post
  - `topic`: tema específico
  - `topic_angle`: ángulo sugerido
  - `hook_direction`: dirección para el hook
  - `cta_direction`: dirección para el CTA
  - `series_info`: si es parte de una serie (parte N de M)
  - `story_funnel`: si tiene stories de calentamiento asociadas
  - `date_reference`: si está vinculado a una fecha importante
  - `trend_reference`: si está vinculado a una tendencia detectada

---

## PASO 4: Generación de Variantes

Por cada slot de la parrilla, el **Generador de Contenido** y el **Director de Arte** producen 3 variantes.

**Input:**
- `parrilla` (paso 3)
- `brand_context` (paso 1)
- `intelligence_report` (paso 2)
- Templates de `template_funnel.md` (seleccionados según formato del slot)

**Agentes involucrados:**
- **Generador de Contenido** (Sonnet) → copy, hooks, guiones, slides, CTAs (usa Templates #2-#6)
- **Director de Arte** (Sonnet) → art direction JSON para imagen y video

**3 variantes por slot:**
- **Variante A:** tono emocional / storytelling
- **Variante B:** tono educativo / datos
- **Variante C:** tono directo / CTA fuerte

**Proceso (por cada slot):**

### 4a. Construcción del Brief del Slot
1. Compilar brief específico para el slot:
   - Tema + ángulo
   - Pilar + objetivo + intención
   - Formato + specs de plataforma
   - Voz de marca (ajustada a la plataforma)
   - Restricciones de marca
   - Persona target principal
   - Hooks y CTAs que funcionaron antes (del feedback loop)

### 4b. Generación de Copy (según formato del slot)

**Si el formato es Reel → Template #2 + #3:**
1. Generador genera 10 ganchos con Template #2 (no 20 — eficiencia)
   - Selecciona el mejor para cada variante (A: emocional, B: dato, C: directo)
2. Genera 3 guiones con Template #3 "Guion Alta Retención" (1 por variante)
   - Escena 0-3s: gancho + texto en pantalla
   - Escena 3-15s: contexto + tensión
   - Escena 15-35s: valor práctico
   - Final: cierre + CTA de engagement
   - B-roll sugerido, texto en pantalla, leyenda corta

**Si el formato es Carrusel → Template #4:**
1. Generador crea 3 estructuras de carrusel con Template #4 "Carrusel Guardable"
   - 10 slides: portada → promesa → errores/correcciones → checklist → CTA
   - Texto máx. 18 palabras por slide
   - Sugerencia visual por slide
   - Frase de transición entre slides
   - Cada variante con ángulo distinto (A: emocional, B: educativo, C: directo)

**Si el formato es Post/Story → Template #5 + #6:**
1. Generador crea 3 captions con Template #5 "Leyenda que Convierte"
   - Variante A: versión larga (storytelling)
   - Variante B: versión media (educativa)
   - Variante C: versión corta (CTA directo)
   - Cada una con gancho en primera línea, puntos de valor, CTA principal + secundario
2. Genera CTAs para comentarios con Template #6 "Máquina de Comentarios"
   - 5 CTAs variados (no 25 — eficiencia), asignados a la variante más relevante

### 4c. Cada variante incluye:
- **Copy completo** (caption adaptado a la plataforma, con largo adecuado)
- **Hashtags** (branded + nicho + trending según hashtag_style)
- **Hook** (primeras palabras del caption + texto en pantalla)
- **Guión** (si es reel: por escenas; si es carrusel: por slides)
- **CTA principal + secundario**
- **Alt text** (accesibilidad)
- **Texto en pantalla** (overlays para video/carrusel)
- **Art direction JSON** (imagen) → generado por Director de Arte (ver 4d)
- **Art direction JSON** (video) → generado por Director de Arte (ver 4d)

### 4d. Dirección de Arte — Prompts en JSON

El **Director de Arte** es un agente especializado que transforma el brief del slot en prompts visuales ricos y detallados. Su objetivo: que el contenido generado **no se vea como IA**.

**Principios anti-IA del Director de Arte:**
- Imperfección deliberada: ligeras asimetrías, texturas orgánicas, detalles de iluminación natural
- Contexto ambiental: los fondos cuentan una historia, no son fondos genéricos de estudio
- Detalles sensoriales: texturas de tela, granos de madera, reflejos en superficies
- Evitar: simetría perfecta, piel de plástico, ojos brillantes sin causa, fondos difusos genéricos, manos con 6 dedos
- Referencia a estilos fotográficos reales: "estilo editorial de revista Kinfolk", "fotografía de producto con luz natural lateral"
- Coherencia con `brand.yaml` → visual.style y visual.mood

**Schema JSON para prompt de imagen:**

```json
{
  "type": "image",
  "generator": "nanobanana_2",
  "settings": {
    "aspect_ratio": "9:16",
    "count": 8,
    "quality": "2k_unlimited"
  },
  "art_direction": {
    "concept": "Descripción de la escena/concepto visual en 1-2 frases",
    "style": "Estilo visual específico (ej: 'editorial de revista de crianza, luz natural suave')",
    "mood": "Estado emocional que debe transmitir la imagen",
    "color_palette": {
      "dominant": "#hex",
      "accents": ["#hex", "#hex"],
      "temperature": "cálido / frío / neutro"
    },
    "composition": {
      "framing": "close-up / medium shot / wide / overhead / etc.",
      "rule": "rule of thirds / centered / dynamic diagonal / etc.",
      "focal_point": "Qué debe ser el centro de atención",
      "negative_space": "Dónde dejar espacio para texto overlay (si aplica)"
    },
    "lighting": {
      "type": "natural lateral / golden hour / softbox / backlit / etc.",
      "direction": "izquierda / derecha / arriba / behind",
      "quality": "suave / duro / difuso / dramático"
    },
    "subjects": [
      {
        "description": "Descripción detallada del sujeto",
        "expression": "Expresión facial / emoción visible",
        "clothing": "Vestimenta si es relevante",
        "action": "Qué está haciendo"
      }
    ],
    "environment": {
      "setting": "Dónde ocurre la escena (específico, no genérico)",
      "props": ["Objetos relevantes en escena"],
      "textures": ["Texturas visibles que dan realismo"],
      "depth": "Profundidad de campo deseada"
    },
    "anti_ai_directives": [
      "Instrucciones específicas para evitar artefactos de IA",
      "ej: 'manos naturales fuera de cuadro', 'imperfecciones en la ropa'",
      "ej: 'texto ilegible en libros del fondo, no texto perfecto'"
    ],
    "text_overlay": {
      "required": true,
      "position": "top / center / bottom / left-third",
      "text": "Texto exacto que irá sobre la imagen",
      "notes": "Dejar espacio libre en zona X para overlay en post-producción"
    },
    "reference_styles": [
      "Referencia a fotógrafo, revista, o estética conocida",
      "ej: 'Kinfolk magazine', 'Annie Leibovitz portraits', 'Instagram flat lay editorial'"
    ]
  },
  "prompt_string": "El prompt final compilado en texto plano para NanoBanana (generado desde los campos anteriores)",
  "negative_prompt": "Elementos a evitar explícitamente"
}
```

**Schema JSON para prompt de video:**

```json
{
  "type": "video",
  "generator": "higgsfield_cinema | freepik_ai_video",
  "settings": {
    "aspect_ratio": "9:16",
    "duration_seconds": 35,
    "fps": 30
  },
  "art_direction": {
    "concept": "Descripción del video en 1-2 frases",
    "visual_style": "Estilo general (ej: 'documental íntimo', 'UGC auténtico', 'editorial')",
    "mood": "Estado emocional que debe transmitir",
    "color_grading": {
      "lut_reference": "Referencia de color grading (ej: 'warm film stock', 'clean editorial')",
      "temperature": "cálido / frío / neutro",
      "saturation": "normal / desaturado / vibrante"
    },
    "scenes": [
      {
        "time_range": "0-3s",
        "scene_type": "hook",
        "shot_type": "close-up / wide / POV / over-shoulder / etc.",
        "camera_movement": "estático / pan lento / zoom in / tracking / handheld",
        "subject_action": "Qué pasa en esta escena",
        "environment": "Dónde ocurre",
        "text_overlay": "Texto en pantalla para esta escena",
        "audio_direction": "Tipo de sonido/música para esta escena",
        "transition_to_next": "corte seco / fade / match cut / etc."
      },
      {
        "time_range": "3-15s",
        "scene_type": "context",
        "shot_type": "",
        "camera_movement": "",
        "subject_action": "",
        "environment": "",
        "text_overlay": "",
        "audio_direction": "",
        "transition_to_next": ""
      },
      {
        "time_range": "15-35s",
        "scene_type": "value",
        "shot_type": "",
        "camera_movement": "",
        "subject_action": "",
        "environment": "",
        "text_overlay": "",
        "audio_direction": "",
        "transition_to_next": ""
      },
      {
        "time_range": "35-40s",
        "scene_type": "cta",
        "shot_type": "",
        "camera_movement": "",
        "subject_action": "",
        "text_overlay": "CTA en pantalla",
        "audio_direction": ""
      }
    ],
    "b_roll_suggestions": [
      "Tomas sugeridas para complementar (específicas, no genéricas)",
      "ej: 'manos de niño pasando páginas de un libro, slow motion'",
      "ej: 'vista cenital de mesa con cuento abierto y crayones'"
    ],
    "anti_ai_directives": [
      "Evitar movimientos de cámara robóticos o perfectamente fluidos",
      "Evitar transiciones que delaten generación IA",
      "Priorizar estilo 'filmado con iPhone' sobre 'producción de estudio'"
    ],
    "audio": {
      "music_style": "Estilo de música (ej: 'acoustic guitar, warm, indie')",
      "voiceover": true,
      "voiceover_tone": "Tono de voz del narrador",
      "sound_effects": ["Efectos de sonido sugeridos"]
    },
    "reference_styles": [
      "ej: 'estilo de Reels de @wonderbly, warm tones, close-ups de niños leyendo'"
    ]
  },
  "prompt_string": "El prompt final compilado para el generador de video",
  "negative_prompt": "Elementos a evitar"
}
```

**Proceso del Director de Arte:**
1. Recibe el brief del slot + copy de la variante + `brand.yaml` visual
2. Interpreta la emoción y mensaje del copy
3. Diseña la dirección visual que amplifica el mensaje (no que lo repite literalmente)
4. Genera el JSON con todos los campos de art direction
5. Compila el `prompt_string` final optimizado para el generador específico
6. Revisa contra `anti_ai_directives` y `brand.yaml` restricciones visuales
7. Output: un JSON por variante (imagen) + un JSON por variante (video, si aplica)

### 4e. Adaptación por Plataforma
1. Si el slot es multi-plataforma, adaptar cada variante:
   - Largo de caption según specs
   - Número de hashtags
   - Formato de CTA (link en bio vs swipe up vs comentar)
   - Duración de video
   - Tono según `platform_adjustments`
   - Art direction JSON: ajustar aspect_ratio y composition según plataforma

### 4f. Content Repurposing (si aplica)
1. Si un contenido se marcó para repurposing:
   - Generar variantes del mismo tema en formatos alternativos
   - Reel → carrusel + static + story + thread
2. Adaptar cada formato sin repetir textualmente
3. Director de Arte genera nuevos JSON de art direction por formato

### 4g. Filtro Rápido contra Histórico
1. Comparar cada variante contra top 5 posts históricos de la marca
2. Evaluar: ¿es al menos tan bueno como lo que ya funcionó?
3. Descartar variantes que no superen el baseline propio
4. Este filtro reduce costos de simulación en el paso 6

**Output:**
- `variants`: por cada slot, array de 5-8 variantes, cada una con:
  - Copy completo + hashtags + hooks + CTA
  - Guión (si reel) o slides (si carrusel)
  - `art_direction_image.json` (del Director de Arte)
  - `art_direction_video.json` (del Director de Arte, si aplica)
  - Alt text
- Variantes que no pasaron el filtro histórico se marcan como `filtered_out` (se guardan pero no se simulan)

---

## PASO 5: Generación de Assets

El sistema genera los assets visuales usando los JSON de art direction del paso 4.

**Input:**
- `variants` (paso 4) con sus `art_direction_image.json` y `art_direction_video.json`
- `run_config.asset_level` (copy+prompts / +imágenes / +video)

**Proceso:**

### Modo: Solo Copy + Prompts (default)
1. Los JSON de art direction ya están generados en el paso 4
2. Se exportan listos para ejecución manual
3. El humano puede abrir el JSON, revisar la dirección de arte, y ejecutar el `prompt_string` en NanoBanana/Higgsfield
4. No se genera nada adicional

### Modo: + Imágenes
1. Por cada variante no filtrada, extraer `prompt_string` del `art_direction_image.json`
2. Aplicar `settings` del JSON (aspect_ratio, count, quality)
3. Ejecutar en NanoBanana vía Playwright MCP + Higgsfield (ver `claude_higgsfield_guide.md`)
4. Workflow por imagen:
   - Clear prompt bar (JS)
   - Screenshot para verificar limpieza
   - Type `prompt_string` slowly
   - Generate
   - Wait 7s
   - Download resultado
5. Guardar imágenes en `output/{marca}/{periodo}/{slot_id}/`
6. **Visual attention check**: modelo multimodal evalúa la imagen generada contra el `art_direction_image.json`:
   - ¿El focal_point es correcto?
   - ¿Hay espacio para text_overlay donde se indicó?
   - ¿Detecta artefactos de IA? (manos, texto, simetría excesiva)
   - Si falla: regenerar con prompt ajustado
7. **Brand consistency check**: ¿La imagen es coherente con `brand.yaml` visual.style y visual.mood?

### Modo: + Video

**Regla crítica: los videos se generan SIN texto en pantalla ni subtítulos.**
Los generadores de video IA (Seedance, Veo 3.1, Higgsfield) producen texto ilegible o con artefactos. Los text overlays se agregan en post-producción (CapCut o similar).

El `prompt_string` NO debe mencionar texto en pantalla. El `negative_prompt` debe incluir `"text on screen, subtitles, captions, written words"`. Los `text_overlay_sequence` en los clips son instrucciones para post-producción, no para el generador. El Director de Arte debe especificar `negative_space` en la composición para dejar espacio limpio donde irá el texto después.

**Paso 5a: Split por generador disponible**

El `art_direction_video.json` del paso 4 se divide en clips según la duración máxima del generador:

| Generador | Duración máxima | Clips para reel de 40s |
|-----------|----------------|----------------------|
| Veo 3.1 (Google AI Studio) | 8s | 5 clips |
| Seedance | 15s | 3 clips |
| Higgsfield Cinema | variable | 2-4 clips |

Cada clip se exporta como JSON independiente con:
- `duration_seconds` ajustado al generador
- `prompt_string` adaptado a la escena del clip
- `text_overlay_sequence` como referencia para post-producción (NO para el generador)
- `negative_prompt` incluyendo `"text on screen, subtitles, captions"`

Estructura de output:
```
variante_X/
├── art_direction_video.json       ← video completo (referencia)
├── seedance_clips/                ← split para Seedance (15s max)
│   ├── clip_1_hook_context.json
│   ├── clip_2_data_framework.json
│   └── clip_3_cta_close.json
└── veo31_clips/                   ← split para Veo 3.1 (8s max)
    ├── clip_1_hook.json
    ├── clip_2_passive_reading.json
    ├── clip_3_dialogic_reading.json
    ├── clip_4_mother_questions.json
    └── clip_5_cta_close.json
```

**Paso 5b: Generación de video**
1. El humano elige generador (Seedance, Veo 3.1, Higgsfield)
2. Abre el clip JSON correspondiente
3. Copia el `prompt_string` al generador
4. Genera el clip
5. Repite para cada clip
6. Ensambla los clips en CapCut/editor de video
7. Agrega text overlays según `text_overlay_sequence` de cada clip
8. Agrega audio/música según `audio` del `art_direction_video.json` original

**Paso 5c: Review**
1. Review de coherencia entre clips (continuidad visual, color grading)
2. Review de negative_space (¿hay espacio para los textos?)
3. Brand consistency check contra `brand.yaml`
4. Anti-IA check: ¿se ven artefactos? (manos, ojos, simetría)

**Output:**
- Assets generados organizados por slot y variante
- Reporte de visual attention (si se generaron imágenes)
- Clips de video por generador + instrucciones de post-producción

---

## PASO 6: Simulación de Impacto

El **Analista de Viralización** (Opus) prepara el material para MiroFish, ejecuta la simulación, e interpreta los resultados.

**Input:**
- `variants` (paso 4, solo las no filtradas)
- `brand_context.audiences` (personas para simulación)
- Assets generados (paso 5, si existen)

**Proceso:**

### 6a. Preparación del Seed Material (Analista de Viralización)

El Analista transforma las variantes en seed material que MiroFish puede consumir.

**Primera simulación de una marca (perfiles nuevos):**
1. Cargar personas de `audiences.yaml` (53 personas con MBTI, demographics, triggers)
2. Calibrar con datos reales de `metrics.yaml` y feedback loop anterior
3. Compilar seed document (MD) con:
   - Descripción del producto y marca
   - Métricas reales de IG/GA4
   - Las 53 personas con detalle narrativo (~50-80 palabras c/u)
   - Las 3 variantes de contenido con copy + visual description
   - Métricas del algoritmo de la plataforma
   - Requisitos de predicción explícitos
   - Guardrails anti-alucinación
4. Compilar simulation_requirement con mapeo de acciones IG → Twitter/Reddit
5. Subir a MiroFish web → generar ontología → generar perfiles → lanzar simulación

**Simulaciones subsiguientes de la misma marca (reutilizar perfiles):**
1. El graph_id de Zep persiste — los perfiles y memorias de simulaciones anteriores se acumulan
2. Copiar los mismos archivos de perfiles (`reddit_profiles.json` + `twitter_profiles.csv`)
3. Crear nuevo `simulation_config.json` cambiando solo `event_config.initial_posts` con el nuevo contenido
4. Ejecutar vía CLI: `python run_parallel_simulation.py --config nuevo_dir/simulation_config.json`
5. Las personas ya tienen memoria de simulaciones anteriores — se vuelven más "reales" con cada ciclo

**Nota sobre idioma:** MiroFish genera perfiles y reportes en chino aunque el seed esté en inglés. El Analista debe traducir el reporte a español para interpretación.

### 6b. Ejecución de Simulación

**Modo MiroFish (completo) — PRIORIZAR cuando haya discrepancia con panel LLM:**
1. Subir seed material a MiroFish (web para primera vez, CLI para subsiguientes)
2. MiroFish genera agentes autónomos basados en las personas (~2000 palabras de perfil por agente, MBTI)
3. Los agentes "ven" las variantes como posts iniciales e interactúan entre sí
4. Acciones disponibles: CREATE_POST, LIKE, REPOST (=share), QUOTE_POST (=comment), FOLLOW, DO_NOTHING (=ignore), CREATE_COMMENT, DISLIKE
5. Duración típica: ~2.7 horas, ~900+ acciones, 40-72 rondas
6. MiroFish genera reporte vía ReportAgent (patrón ReACT, ~15-20 min adicionales)
7. El Analista recibe el reporte y lo traduce a español

**Nota técnica (Windows):** No refrescar la página de Start durante la simulación — puede relanzar el proceso y corromper el estado. Los archivos `.db` se bloquean en Windows. Si el estado se desincroniza, parchear `state.json` y `run_state.json` manualmente y navegar directo a la página de Report.

**Modo Panel LLM (fallback, cuando MiroFish no está disponible):**
1. El Analista ejecuta internamente la simulación con prompts de persona
2. Por cada variante, cada persona simulada responde un scorecard:
   - **Atención** (1-10): ¿Detiene mi scroll?
   - **Resonancia emocional** (1-10): ¿Me conecta emocionalmente?
   - **Shareability** (1-10): ¿Lo compartiría con alguien?
   - **Brand fit** (1-10): ¿Suena coherente con lo que espero de esta marca?
   - **Claridad del CTA** (1-10): ¿Entiendo qué quieren que haga?
   - **Memorabilidad** (1-10): ¿Lo recordaría en 5 minutos?
   - **Acción probable**: like / comentar / guardar / compartir / ignorar / unfollow
   - **Emoción generada**: texto libre
   - **Resonance score** (1-10): ¿Conecté con esto?
   - **Spread score** (1-10): ¿Lo enviaría por DM/WhatsApp?
3. **Sesgo conocido:** El panel LLM sobreestima el impacto emocional y subestima el peso de los profesionales como drivers de crecimiento. Calibrar pesos con resultados de MiroFish cuando estén disponibles.

### 6c. Interpretación de Resultados (Analista de Viralización)
1. Recibir output de MiroFish (o del panel LLM)
2. Traducir reporte de MiroFish a español (si aplica)
3. Normalizar scores entre personas (peso según representatividad en audiencia real)
4. Identificar patrones: ¿qué persona conectó más con qué variante?
5. Detectar dinámicas entre personas que el panel LLM no captura (ej: profesionales validando → audiencia general siguiendo)
6. Generar ranking preliminar con justificación
7. Flaggear variantes problemáticas (brand fit bajo, spread sin resonance, etc.)
8. Si hay discrepancia MiroFish vs panel LLM: **priorizar MiroFish** y documentar la discrepancia como aprendizaje

**Cuando ambos coinciden:** alta confianza en la recomendación.
**Cuando discrepan:** priorizar MiroFish. Documentar por qué discreparon para calibrar el panel LLM.

**Output:**
- `simulation_results`: por cada variante, scorecard multi-dimensional por persona
- Score agregado ponderado por persona
- Justificación del Analista sobre cada variante
- Flags de problemas detectados

---

## PASO 7: Ranking y Selección

El sistema rankea las variantes y selecciona ganadoras.

**Input:**
- `simulation_results` (paso 6)
- `run_config` (criterios, umbrales)

**Proceso:**

### 7a. Cálculo de Score Compuesto
1. Por cada variante, calcular score compuesto:
   - Promedio ponderado de los 6 ejes del scorecard
   - Peso de cada eje varía según la intención del slot:
     - **Viral**: shareability (x2) + atención (x1.5) + memorabilidad (x1.5)
     - **Calidad**: resonancia (x2) + brand fit (x1.5) + memorabilidad (x1.5)
     - **Comercial**: claridad CTA (x2) + atención (x1.5) + resonancia (x1.5)
   - Ponderar por representatividad de cada persona

### 7b. Ranking
1. Ordenar variantes por score compuesto (descendente)
2. Clasificar:
   - **Score ≥ 7.5** → PUBLICAR ✅
   - **Score 5.0-7.4** → RESERVA (banco de contenido)
   - **Score < 5.0** → ARCHIVO (se guarda, no se usa)

### 7c. Selección
1. Por cada slot, seleccionar la variante #1 como ganadora
2. Variante #2 queda como backup
3. Si ninguna variante supera 7.5: flag al humano para decisión

### 7d. Detección de Problemas
1. Si un slot tiene todas las variantes con score bajo:
   - Flag: "El tema/ángulo no resonó con ninguna persona"
   - Sugerir: cambiar el tema o el ángulo y regenerar
2. Si un pilar consistentemente tiene scores bajos:
   - Flag: "El pilar [X] no está funcionando"
   - Sugerir: revisar topics o reducir weight

**Output:**
- `selected_content`: parrilla final con variante ganadora por slot
- `content_bank`: variantes de reserva para uso futuro
- `archive`: variantes descartadas (guardadas para calibración)
- `flags`: alertas para el humano si hay problemas

---

## PASO 8: Aprobación Humana

El humano revisa y aprueba la parrilla final.

**Input:**
- `selected_content` (paso 7)
- `flags` (paso 7)

**Proceso:**

### 8a. Presentación al Humano
1. Mostrar parrilla en vista calendario
2. Por cada slot mostrar:
   - Variante ganadora (copy + imagen si existe)
   - Score compuesto + radar de 6 ejes
   - Persona que más resonó
   - Alternativa (#2) disponible
3. Destacar flags y slots que necesitan atención

### 8b. Acciones del Humano
- **Aprobar** → el slot pasa a publicación
- **Rechazar** → el sistema presenta la variante #2, o regenera variantes nuevas
- **Editar** → el humano modifica el copy (el sistema re-simula la versión editada)
- **Reemplazar tema** → el humano cambia el tema del slot y el sistema regenera desde paso 4
- **Mover** → cambiar fecha/hora del slot
- **Aprobar todo** → aprobación masiva (para usuarios que confían en el sistema)

### 8c. Re-iteración
1. Si se rechazó o editó, el sistema vuelve al paso relevante
2. Regeneración puntual (solo el slot afectado, no toda la parrilla)

**Output:**
- `approved_content`: parrilla final aprobada por el humano
- Cada slot tiene status: `approved` / `pending` / `rejected`

---

## PASO 9: Publicación

El sistema publica o prepara los contenidos aprobados.

**Input:**
- `approved_content` (paso 8)

**Proceso:**

### Fase actual: Export Manual
1. Generar paquete de contenido organizado por fecha:
   ```
   output/{marca}/{periodo}/
   ├── 2026-05-01_reel_neurociencia/
   │   ├── copy.md          (caption + hashtags + CTA)
   │   ├── guion.md          (guión del reel por escenas)
   │   ├── image_prompt.md   (prompt para NanoBanana)
   │   ├── video_prompt.md   (prompt para Higgsfield)
   │   ├── image.png         (si se generó)
   │   └── metadata.yaml     (scores, persona, pilar, objetivo)
   │
   ├── 2026-05-01_story_funnel_01/
   │   └── ...
   │
   ├── 2026-05-02_carousel_emocional/
   │   ├── copy.md
   │   ├── slides.md         (texto por slide + visual sugerido)
   │   ├── image_prompts/    (1 prompt por slide)
   │   └── metadata.yaml
   │
   └── calendario.md          (vista resumen de toda la parrilla)
   ```
2. El humano ejecuta la publicación manualmente o usa herramienta de scheduling

### Fase futura: Publicación Automática
1. Scheduling vía API Meta (IG), TikTok, LinkedIn
2. Horario óptimo de `platforms.yaml` o ajustado por datos recientes
3. Confirmación post-publicación

**Output:**
- Contenido publicado (o paquete listo para publicar)
- Log de publicación con timestamps

---

## PASO 10: Feedback Loop

Los resultados reales retroalimentan al sistema.

**Input:**
- `approved_content` con scores simulados (paso 7)
- Resultados reales post-publicación (manual o API)

**Proceso:**

### 10a. Recolección de Resultados (post 7 días)
1. Por cada contenido publicado, recoger:
   - Likes, comentarios, compartidos, guardados
   - Reach, impresiones
   - Visitas al perfil, follows generados
   - Clicks (si aplica)
   - Retención promedio (para video)
2. Input manual: el humano pega datos de IG Insights / analytics
3. (Futuro) Input automático vía API

### 10b. Correlación Simulado vs Real
1. Calcular engagement rate real por contenido
2. Comparar con score simulado
3. Calcular correlación global del período
4. Identificar:
   - **Aciertos**: score alto + engagement alto (el sistema predijo bien)
   - **Falsos positivos**: score alto + engagement bajo (el sistema sobreestimó)
   - **Sorpresas**: score bajo + engagement alto (el sistema subestimó)
   - **Aciertos negativos**: score bajo + engagement bajo (bien descartado)

### 10c. Laboratorio de Viralización (Template #8)
Para los contenidos que underperformaron o que sorprendieron positivamente, el **Analista de Viralización** ejecuta Template #8:
1. Input: formato, visualizaciones, retención media, likes, comentarios, compartidos, guardados, seguidores ganados, tema + gancho + texto
2. Diagnosticar principal cuello de botella (gancho, ritmo, claridad, CTA, público, edición)
3. Proponer 10 mejoras precisas (reescribir gancho, recortar partes, añadir interrupciones de patrón)
4. Crear 3 versiones nuevas del mismo contenido:
   - Una versión más breve (15-20 segundos)
   - Una versión con ligera controversia
   - Una versión tipo tutorial paso a paso
5. Sugerir 5 temas "siguientes" para mantener el impulso
6. Las versiones mejoradas se agregan al banco de contenido para el próximo ciclo

### 10d. Calibración
1. Ajustar personas simuladas:
   - Si una persona consistentemente sobreestima → reducir sus scores o peso
   - Si una persona subestima → aumentar peso
   - Si cierto tipo de contenido sorprende → ajustar triggers de las personas
2. Ajustar pesos del scoring:
   - Si shareability predice mejor que resonancia → aumentar peso de shareability
3. Actualizar `metrics.yaml` con nuevos datos

### 10e. Aprendizajes para el Próximo Ciclo
1. Generar lista de aprendizajes:
   - "Los carruseles educativos del pilar neurociencia superaron la simulación en 30%"
   - "Los reels comerciales directos tuvieron score alto pero engagement bajo"
   - "El hook tipo pregunta funcionó mejor que el de dato impactante"
2. Estos aprendizajes alimentan el paso 2d del próximo ciclo

### 10f. Cross-pollination (multi-marca)
1. Si hay múltiples marcas, detectar patrones transferibles:
   - "El formato X funcionó en La Cuentería → probar en Tu Magistral"
   - Hooks/CTAs exitosos que cruzan nichos
2. Guardar en base de conocimiento compartida

**Output:**
- `feedback_report`: correlación, aciertos, fallos, aprendizajes
- `metrics.yaml` actualizado
- Personas simuladas calibradas
- Aprendizajes para el próximo ciclo

---

## Resumen de Almacenamiento

Todo se guarda. Estructura por run:

```
output/
└── {marca}/
    └── {periodo}/               # ej: 2026-05
        ├── run_config.yaml       # Parámetros del run
        ├── intelligence.yaml     # Reporte de inteligencia
        ├── parrilla.yaml         # Parrilla planificada
        ├── variants/             # Todas las variantes generadas
        │   ├── slot_001/
        │   │   ├── variant_a.yaml
        │   │   ├── variant_b.yaml
        │   │   └── ...
        │   └── ...
        ├── simulation/           # Resultados de simulación
        │   ├── slot_001.yaml
        │   └── ...
        ├── selected/             # Variantes ganadoras (contenido final)
        │   ├── 2026-05-01_reel/
        │   └── ...
        ├── feedback/             # Resultados reales + correlación
        │   └── feedback_report.yaml
        └── calendario.md         # Vista resumen legible
```

---

## Ciclo Temporal

```
Mes N-1 (semana 4):
├── PASO 0-3: Configurar + inteligencia + planificar parrilla del Mes N
│
Mes N-1 (semana 4) → Mes N (semana 1):
├── PASO 4-5: Generar variantes + assets
├── PASO 6-7: Simular + rankear
├── PASO 8: Aprobación humana
│
Mes N (semanas 1-4):
├── PASO 9: Publicar según calendario
│
Mes N (semana 4):
├── PASO 10: Recoger resultados + feedback loop
├── PASO 0-3: Planificar Mes N+1 (usando aprendizajes del Mes N)
│
... ciclo continuo
```

---

## Iteración Nocturna (modo autoresearch, opcional)

Cuando se activa, entre los pasos 4 y 7 el sistema itera automáticamente:

```
Iteración 1: Generar 5-8 variantes → Simular → Seleccionar top 2
                                                        ↓
Iteración 2: Generar 5-8 variantes inspiradas en top 2 → Simular → Seleccionar top 2
                                                                          ↓
Iteración 3: ... repetir hasta N iteraciones o convergencia de scores
                                                                          ↓
Presentar solo el top refinado al humano
```

Cada iteración usa las ganadoras anteriores como "semilla" para generar variantes mejores. El sistema converge hacia contenido de mayor calidad a costa de más tokens/tiempo.

---

*Este proceso se irá refinando con cada ciclo de ejecución. Las decisiones sobre implementación específica (prompts, código, herramientas) se definen en documentos separados por fase.*
