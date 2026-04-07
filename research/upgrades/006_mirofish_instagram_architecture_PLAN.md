# Plan: MiroFish-IG — Llevar MiroFish a Instagram

## Contexto

MiroFish_es ya funciona en español con qwen3-coder-next (validado E2E). Ahora queremos evolucionar hacia una variante especializada para Instagram. Tenemos dos fuentes clave:

- **006_mirofish_instagram_architecture.md** — fundamentos teóricos: señales algorítmicas IG 2026, modelos SEIR de difusión, Social Digital Twins, benchmarks de Stories, neuropsicología del engagement
- **006_mirofish_panel_spec.md** — spec operativa: panel de evaluación de contenido con encuestas estructuradas, composite scores por intención, acciones IG (scroll_past, stop_look, save, share, etc.)

**Problema actual**: MiroFish simula Twitter/Reddit (posts textuales, likes, retweets). Instagram requiere: contenido visual (imagen+copy), acciones diferentes (save, share DM, swipe), múltiples superficies (Feed, Stories, Reels, Explore), y ranking basado en watch time + saves en vez de likes.

## Abordaje: 4 fases incrementales

---

### Fase 1: Panel de Evaluación ~~(inmediato, ~1 semana)~~ COMPLETADA 2026-04-06

**Qué**: Construir el Panel de Evaluación del spec como módulo independiente. No requiere modificar OASIS. Usa agentes persistentes que evalúan contenido real (imagen + copy) con encuesta estructurada.

**Por qué primero**: Es el caso de uso más inmediato para Content Engine (dogfooding con 3 marcas). Genera valor desde el día 1 sin tocar el motor de simulación.

**Componentes**:

1. **`panel_agents` table** en Supabase (ya existe el proyecto Viralscope)
   - Schema del spec: id, project_id, persona_name, persona_profile (jsonb), history, memory_enabled
   - Poblado desde `audiences_yaml` de cada marca

2. **Endpoint de evaluación** (`/api/panel/evaluate`)
   - Input: imagen (base64/URL), copy, contexto (formato, plataforma, pilar, intención)
   - Para cada agente del panel: llamada LLM multimodal con perfil + historial + contenido
   - Output: acciones (multi-select), scores (6 dimensiones), campos cualitativos
   - Modelo: qwen3-coder-next o modelo con vision (qwen3.5-plus tiene Visual Understanding)

3. **Composite Score Engine**
   - Pesos por intención (viral/quality/commercial) del spec
   - Agregación por variante → winner + confidence + reasoning
   - Veredicto con recomendación por variante (publish/story/archive/repurpose)

4. **Preguntas condicionales**
   - intention=commercial → would_buy
   - intention=viral → would_repost_story
   - objective=retention → would_enable_notifications

**Archivos**: Nuevo módulo en Viralscope, no en MiroFish_es
**Estimación**: 4-10 personas × 3 variantes = 12-30 evaluaciones, ~15-30s, ~8-21K tokens

**Implementado**:
- Migración `002_panel.sql`: tablas `panel_agents` + `panel_evaluations`
- Edge function `panel-seed` (v1): expande audiences_yaml → perfiles IG ricos
- Edge function `panel-evaluate` (v2): evaluación multimodal paralela + composite scores + verdict LLM
- Types: PanelAgent, PanelEvaluation, VariantEvaluation, PanelVerdict en `types.ts`
- Data layer: getPanelAgents(), getPanelEvaluation(), getPanelEvaluations() en `data.ts`
- Test E2E: La Cuentería, 14 agentes, 3 variantes → B gana (publish), A reservar, C archivar, 67K tokens

---

### Fase 2: Instagram Action Space (corto plazo, ~2-3 semanas)

**Qué**: Reemplazar el espacio de acciones Twitter/Reddit de OASIS con acciones nativas de Instagram.

**Mapeo de acciones**:

| OASIS actual (Twitter) | → Instagram equivalente | Señal algorítmica |
|------------------------|------------------------|-------------------|
| create_post | publish_post (feed/reel/story) | — |
| like | like (señal débil) | Baja [ref 7,8] |
| retweet | share_dm (señal fuerte) | Crítica [ref 8,16] |
| quote_tweet | repost_story (reshare con context) | Alta |
| comment | comment | Moderada |
| follow | follow | Moderada |
| — (nuevo) | save | Alta [ref 5,7] |
| — (nuevo) | scroll_past (skip) | Negativa [ref 5,16] |
| — (nuevo) | stop_look (atención > 2s) | Alta [ref 7] |
| — (nuevo) | tap_forward / tap_back (Stories) | Retención [ref 9,13] |
| — (nuevo) | watch_complete (Reels) | Crítica [ref 7,9] |

**Implementación**:
- Fork del script `run_parallel_simulation.py` → `run_instagram_simulation.py`
- Nuevo `AVAILABLE_ACTIONS` list con acciones IG
- Modificar los prompts de agentes para que "piensen" en términos de IG (save, share por DM, ver stories)
- Agregar campo `attention_seconds` a cada interacción (derivado del contenido y perfil del agente)

**Dependencia**: Fase 1 no depende de esto. Fase 2 puede desarrollarse en paralelo.

---

### Fase 3: Ranking Algorítmico IG (medio plazo, ~1 mes)

**Qué**: Implementar el sistema de ranking de Instagram 2026 como módulo de recomendación.

**Componentes**:

1. **Audition System** [ref 8]
   - Contenido nuevo se muestra primero a un subconjunto aleatorio de no-seguidores
   - Si performance > threshold → distribución expandida
   - Implementar como "focus group estocástico" dentro de la simulación

2. **Multi-surface routing**
   - Feed: prioriza cercanía relacional + saves
   - Reels: prioriza watch time + completion rate + shares DM
   - Stories: prioriza cercanía + taps + completion rate
   - Explore: prioriza señales de no-seguidores + trending topics

3. **Decaimiento temporal** (Weibull) [ref 14,36]
   - `P(τ) = Λe^(-τ^β)` donde β describe el "estiramiento" de la caída
   - Punto de inflexión ~16 horas post-publicación
   - Implementar como factor multiplicativo en el scoring de visibilidad

4. **Modelo SEIR de difusión** [ref 33-35]
   - Agentes clasificados en: Susceptible → Expuesto → Propagador → Recuperado
   - β = tasa de transmisión (prob. de interactuar dado exposición)
   - σ = tasa de conversión (expuesto → propagador)
   - γ = tasa de recuperación (contenido pierde novedad)

---

### Fase 4: MiroFish-IG Full (largo plazo, ~2-3 meses)

**Qué**: Integración completa con comprensión visual multimodal y Social Digital Twins.

**Componentes**:

1. **Visual Understanding para agentes**
   - Agentes "ven" el contenido (imagen + copy) via modelo multimodal
   - Decisiones basadas en atributos visuales (color, composición, texto overlay, rostros)
   - Modela los "primeros 2 segundos" de Reels [ref 7,16]

2. **Social Digital Twins (SDTs)** [ref 23,39,40]
   - Fine-tuning de personas con datos CRM reales
   - RAG contextual con tendencias visuales actuales
   - 86% de precisión en predicción de comportamiento [ref 40]
   - 0.94 de alineación semántica con reseñas humanas [ref 40]

3. **Estados de creencia duales (Rinsta/Finsta)** [ref 29]
   - Interacciones públicas gobernadas por normas sociales
   - DMs y Close Friends reflejan actitudes "reales"
   - Modelar la dualidad identitaria de Instagram

4. **Detección de CIB** [ref 43,44]
   - Simular comportamiento inauténtico coordinado
   - Bridging/brigading, engaño algorítmico, cámaras de eco
   - Modelar "escasez de atención" para evitar sobrepredecir viralidad [ref 14,21]

5. **Sesgos cognitivos calibrados** [ref 30,31]
   - Automation bias (51%), Normalization (38%), Anchoring (34%), Status Quo (33%)
   - Implementar como factores de ajuste en la toma de decisiones de agentes

---

## Priorización recomendada

```
Fase 1 (Panel) ──────────► COMPLETADA 2026-04-06
     ↓                      14 agentes, composite scores, verdict LLM
Fase 2 (Actions) ────────► COMPLETADA 2026-04-07
     ↓                      16 acciones IG nativas, MiroShark plugin, loop sincronizado
Fase 3 (Ranking) ─────────► COMPLETADA 2026-04-07
     ↓                      Weibull decay, audition system, ranking multi-surface
Fase 4 (Full IG) ─────────► COMPLETADA 2026-04-07
                             Cognitive biases, dual beliefs, visual context, social proof
```

**Fase 1 y Fase 2 pueden desarrollarse en paralelo** — Fase 1 vive en Viralscope, Fase 2 en MiroFish_es.

## Verificación por fase

- **Fase 1**: Evaluar 3 variantes de un reel de La Cuentería con 10 personas del panel → composite score + winner
- **Fase 2**: Correr simulación con 5 agentes usando acciones IG → verificar saves, shares DM, scroll_past en los logs
- **Fase 3**: Publicar contenido en simulación → verificar decaimiento Weibull y distribución multi-etapa
- **Fase 4**: Agentes "ven" imagen real → decisiones basadas en atributos visuales + estados duales

## Referencias clave

- Fuente teórica: `research/upgrades/006_mirofish_instagram_architecture.md` (49 refs)
- Spec operativa: `research/006_mirofish_panel_spec.md`
- Forks relevantes: amadad/mirofish (pi-architecture), nikmcfly/MiroFish-Offline (Neo4j local), aaronjmars/MiroShark
- Motor: camel-ai/oasis (OASIS docs: docs.oasis.camel-ai.org)
