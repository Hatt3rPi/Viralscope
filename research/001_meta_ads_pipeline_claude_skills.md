# Research #001 — Pipeline: 5 Claude Code Skills para Meta Ads

**Fuente:** [Notion - @alassafi.ai](https://www.notion.so/5-Claude-Code-Skills-That-Replace-Your-Meta-Ads-Agency-3323674dbe0081529840e4d7cccec68d)
**Fecha:** 2026-04-05
**Categoría:** Ads pipeline / competitive intelligence / creative generation

---

## Qué es

5 skills de Claude Code encadenadas para reemplazar una agencia de Meta Ads:

1. **`/spy`** — Extrae ads activos de cualquier página de FB vía Meta Ad Library API. Diff semanal para ver solo lo nuevo.
2. **`/competitive-ads-extractor`** — Analiza 3-5 competidores, rankea hooks por frecuencia, detecta gaps (ángulos que nadie usa).
3. **`/bulk-creative`** — Genera 20 variaciones de copy (short/medium/long) desde brand context.
4. **`/ads meta`** — 186 checks sobre cuenta Meta: fatiga creativa, overlap audiencias, anomalías CPM. Health score 0-100.
5. **`/ads-score`** — Evalúa cualquier ad en 6 dimensiones (1-10). Si hook < 7, reescribir antes de invertir.

Cadena: spy → gaps → bulk creative → score → health check. Tiempo declarado: < 1 hora semanal.

---

## Ideas para implementar en Viralscope

### 1. Embudo ancho → angosto (cambio de estructura)

**Qué hacen ellos:** Generan 20 variaciones de copy → scorean → solo las top 5 pasan a producción.

**Qué hacemos nosotros:** Generamos 3 variantes completas (copy + art direction + clips) → simulamos las 3 → elegimos 1.

**El problema:** Invertimos esfuerzo completo en 3 variantes antes de saber si son buenas. 2 de las 3 siempre se descartan con todo su art direction encima.

**Cambio propuesto:**
```
Generar 10-15 hooks + copy rápido (solo texto, sin art direction)
    → Scorear con dimensiones (< 2 min por variante)
        → Top 3 pasan a art direction completo
            → Simular con MiroFish solo las 3 ganadoras
```

Mismo output final, pero el filtro ocurre antes del trabajo pesado.

### 2. Scoring por dimensiones como paso explícito

**Qué hacen ellos:** 6 dimensiones con score 1-10 cada una. Regla dura: hook < 7 = reescribir.

**Qué hacemos nosotros:** MiroFish simula interacciones (que es más profundo), pero no tenemos un check rápido pre-simulación. Cada simulación toma ~2.7 horas.

**Las 6 dimensiones adaptadas a contenido orgánico:**

| Dimensión | Pregunta clave | Umbral |
|-----------|---------------|--------|
| Hook strength | ¿Para el scroll en 1.5s? | >= 7 |
| Script effectiveness | ¿Mantiene atención los 40s? | >= 6 |
| CTA clarity | ¿La acción de cierre es específica y fácil? | >= 7 |
| Emotional resonance | ¿Conecta con la persona target? | >= 6 |
| Value delivery | ¿Cumple la promesa del hook? | >= 6 |
| Visual-script alignment | ¿El art direction refuerza el mensaje? | >= 5 |

Se puede implementar hoy como un prompt. No requiere infraestructura.

### 3. Inteligencia competitiva antes de crear (cambio de orden)

**Qué hacen ellos:** Primero espían qué está corriendo la competencia → detectan gaps → crean contenido atacando esos gaps.

**Qué hacemos nosotros:** El Estratega elige ángulo desde `pillars.yaml` + `competitors.yaml`, pero `competitors.yaml` es estático. No sabemos qué publicó la competencia esta semana.

**Cambio propuesto:** Antes de que el Estratega elija el ángulo, alimentarlo con:
- Qué publicaron los competidores en los últimos 7 días (manual al inicio, scraper después)
- Qué hooks y formatos están repitiendo (señal de que funcionan)
- Qué ángulos no está usando nadie → oportunidad

La Meta Ad Library API es gratuita y funciona para ver qué ads están corriendo los competidores de nuestras marcas, incluso si nosotros no hacemos ads.

### 4. Cadena semanal con días asignados

**Qué hacen ellos:** Lunes = spy, luego gaps, luego creative, luego score, luego health check. Todo en un día.

**Adaptación Viralscope:**
```
Lunes:     Intel competitiva (qué publicaron, qué ads corren)
Martes:    Estratega elige slots informado por los gaps detectados
Miércoles: Bulk copy (10-15) → score → top 3 a art direction
Jueves:    Simulación MiroFish de las 3 ganadoras
Viernes:   Producción de video solo para la variante aprobada
```

No es código, es disciplina operativa.

### 5. Health check periódico del contenido publicado

**Qué hacen ellos:** `/ads meta` revisa fatiga creativa, overlap, frecuencia.

**Equivalente orgánico (cuando tengamos historial):**
- ¿Hay fatiga de formato? (demasiados reels iguales seguidos)
- ¿Los horarios coinciden con picos de audiencia?
- ¿Qué pilares están sobre/sub-representados vs los pesos definidos?

Baja prioridad hoy. Alta prioridad cuando tengamos 8-10 publicaciones.

---

## Observaciones

- El pipeline original es 100% paid ads. La transferencia a orgánico no es 1:1, pero los principios (intel → gaps → bulk → score → filtrar) son universales.
- "20 variaciones en 10 min" es marketing. Con nuestro nivel de detalle por variante, 3 ricas > 20 superficiales. Pero la fase de ideación de copy sí puede ser más amplia antes de comprometerse con art direction.
- El scoring de 6 dimensiones es lo más implementable hoy. Es un prompt, no infraestructura.
