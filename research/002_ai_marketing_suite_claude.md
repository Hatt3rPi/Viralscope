# Research #002 — AI Marketing Suite para Claude Code

**Fuente:** [github.com/zubair-trabzada/ai-marketing-claude](https://github.com/zubair-trabzada/ai-marketing-claude)
**Fecha:** 2026-04-05
**Categoría:** Marketing suite / content calendar / competitive intelligence / ads

---

## Qué es

Suite de 15 skills de Claude Code para marketing completo. Un solo comando `/market` que rutea a sub-skills especializadas. Las más relevantes para nosotros:

- **`/market social <topic>`** — Genera calendario de 30 días con posts por plataforma, hooks, hashtags, repurposing.
- **`/market ads <url>`** — Creativos de ads para todas las plataformas (Meta, Google, TikTok, LinkedIn, X).
- **`/market competitors <url>`** — Inteligencia competitiva con 3 tiers, SWOT, tácticas robables, gaps.
- **`/market brand <url>`** — Análisis de brand voice y guidelines.

Arquitectura: un orquestador principal → sub-skills → 5 subagentes en paralelo para auditorías → scripts Python para automatización → templates reutilizables.

---

## Ideas para implementar en Viralscope

### 1. Calendario mensual antes de generar slots individuales

**Qué hacen ellos:** `/market social` genera un calendario de 30 días completo de una vez. Define pilares con % del mix (40% educativo, 20% BTS, 15% social proof, 15% engagement, 10% promocional), y distribuye los posts asegurando que cada pilar aparezca mínimo 6 veces al mes.

**Qué hacemos nosotros:** Generamos slot por slot. El Estratega decide el pilar y ángulo de cada slot individualmente leyendo `pillars.yaml`. No hay visión de mes completo — cada slot se decide en aislamiento.

**El problema:** Sin calendario mensual, no controlamos la distribución real de pilares. Podríamos terminar con 4 posts de neurociencia seguidos y 0 de recomendaciones de libros.

**Cambio propuesto:** Agregar un paso 0 antes del Estratega:
```
Planificador mensual (lee pillars.yaml + calendar.yaml + métricas)
    → Genera parrilla de 8-12 slots para el mes
    → Asigna pilar + formato + fecha a cada slot
    → El Estratega recibe el slot asignado y elige ángulo + audiencia
```

Esto no reemplaza al Estratega — le da estructura. El Estratega sigue eligiendo el ángulo específico y la audiencia, pero dentro de un pilar y fecha ya definidos.

### 2. Framework de repurposing 1-a-10

**Qué hacen ellos:** Un contenido fuente (reel, blog, video) se convierte en 10 piezas derivadas con un calendario de repurposing: insight el día 1, carousel el día 3, TikTok el día 5, ángulo alternativo el día 7, pregunta de engagement el día 10, reshare el día 14.

**Qué hacemos nosotros:** Generamos 3 variantes de un reel, publicamos 1, reservamos 1, descartamos 1. La variante ganadora se publica y se acabó.

**El problema:** Cada slot es un esfuerzo completo (brief + 3 variantes + art direction + simulación) que produce 1 publicación. La inversión por pieza publicada es altísima.

**Cambio propuesto:** Después de publicar la variante ganadora, generar automáticamente piezas derivadas:
- Día 0: Reel (variante ganadora)
- Día 1: Story con el dato clave del reel
- Día 3: Carousel con los 3 puntos principales
- Día 5: Post estático con la frase más fuerte del copy
- Día 7: El mismo contenido desde ángulo alternativo (la variante reservada)

No todas las marcas necesitan las 10. Pero pasar de 1 pieza por slot a 3-4 piezas multiplica el alcance sin repetir el proceso completo.

### 3. Biblioteca de hooks por formato y plataforma

**Qué hacen ellos:** Tienen fórmulas de hooks categorizadas por plataforma:
- Instagram: "Save this for later", "I tested X for Y time. Results inside"
- TikTok (primeros 3s): "Wait, you're still doing old way?", "Here's the hack nobody showed you"
- LinkedIn: "I analyzed X things and found Y pattern", "Unpopular opinion: ..."

**Qué hacemos nosotros:** El Generador crea hooks desde cero para cada variante. No tiene una biblioteca de fórmulas probadas de la cual elegir.

**Cambio propuesto:** Crear un `hooks.yaml` en los seed files con fórmulas categorizadas por:
- Tipo de contenido (educativo, emocional, directo)
- Plataforma (IG Reels, TikTok, Stories)
- Emoción target (curiosidad, urgencia, validación, sorpresa)

El Generador no copia las fórmulas literalmente — las usa como esqueleto para crear hooks específicos al tema. Es la diferencia entre "inventa un hook" y "elige una fórmula probada y adáptala al tema".

### 4. Categorización de competidores en 3 tiers

**Qué hacen ellos:** Clasifican competidores en:
- **Directos** (mismo producto, misma audiencia): 3-5
- **Indirectos** (distinto producto, mismo problema): 2-3
- **Aspiracionales** (líderes de mercado a emular): 1-2

Y para cada tier extraen cosas distintas: de los directos roban tácticas, de los indirectos detectan ángulos, de los aspiracionales copian estándares de calidad.

**Qué hacemos nosotros:** `competitors.yaml` tiene una lista plana de competidores sin categorizar. Wonderbly, Emotions Market, etc. están al mismo nivel.

**Cambio propuesto:** Reestructurar `competitors.yaml` con los 3 tiers. Para La Cuentería:
- Directos: cuentas chilenas de crianza con contenido de lectura infantil
- Indirectos: cuentas de educación infantil, pediatras en IG
- Aspiracionales: Wonderbly, cuentas internacionales con producción premium

Cada tier alimenta una pregunta distinta al Estratega:
- Directos → "¿qué están haciendo que nosotros no?"
- Indirectos → "¿qué ángulos usan que podríamos adaptar?"
- Aspiracionales → "¿qué nivel de calidad deberíamos alcanzar?"

### 5. Template de estructura para ads multi-plataforma

**Qué hacen ellos:** Para ads de TikTok tienen un template de script:
```
Hook (0-3s) → Problem (3-10s) → Solution (10-20s) → Proof (20-25s) → CTA (25-30s)
```

Para Meta tienen 10 ángulos de copy: pain point, social proof, before/after, objection handling, urgency, curiosity, direct benefit, comparison, testimonial, how-to.

**Qué hacemos nosotros:** Nuestras variantes A/B/C siguen ángulos (emocional, educativo, directo), y las escenas tienen estructura (hook, context, value, CTA). Pero no tenemos templates formalizados para ads pagados.

**Cambio propuesto:** Cuando llegue el momento de correr ads para las marcas, no partir de cero. Crear templates en `seeds/ad_templates/`:
- `meta_reel_ad.yaml` — estructura de escenas para reel patrocinado
- `meta_static_ad.yaml` — los 10 ángulos de copy adaptados a nuestras marcas
- `tiktok_ad.yaml` — script template con timings

Baja prioridad hoy (no estamos en paid ads), pero cuando lleguemos, la estructura ya existe.

### 6. El patrón de orquestador con sub-skills

**Qué hacen ellos:** Un solo comando `/market` que rutea a 14 sub-skills. Cada sub-skill genera su output en un archivo específico. Las skills se referencian entre sí (el análisis de ads lee el reporte de competidores).

**Qué hacemos nosotros:** 4 agentes (Estratega, Generador, Director de Arte, Analista) que se ejecutan manualmente en secuencia.

**Cambio propuesto:** Formalizar nuestros agentes como skills de Claude Code con un orquestador:
```
/vs plan       → Planificador mensual (idea nueva #1)
/vs brief      → Estratega genera brief para un slot
/vs create     → Generador + Director de Arte en paralelo
/vs score      → Scoring por dimensiones (idea de research #001)
/vs simulate   → Analista prepara seed + envía a MiroFish
/vs publish    → Genera output final para publicación
/vs repurpose  → Genera piezas derivadas (idea nueva #2)
```

Un solo punto de entrada. Cada paso genera archivos que el siguiente lee. Se puede correr completo (`/vs full`) o paso a paso.

---

## Observaciones

- Esta suite es genérica — sirve para cualquier negocio. Nuestra ventaja es que estamos especializados en contenido orgánico de video para marcas específicas. No necesitamos la amplitud, necesitamos la profundidad.
- El calendario de 30 días y el repurposing son las dos ideas más valiosas porque atacan nuestro principal cuello de botella: generamos mucho por pieza pero producimos pocas piezas.
- Los templates de hooks y la categorización de competidores son mejoras incrementales que enriquecen los seed files sin cambiar el flujo.
- El patrón de orquestador con skills es el formato correcto para cuando formalicemos Viralscope como herramienta — pero hoy es prematuro invertir en eso.
