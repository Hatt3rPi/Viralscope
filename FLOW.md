# Viralscope — Flujo Visual

Lo que hicimos hoy, paso a paso.

---

## El flujo completo (lo que ejecutamos en la sesión 1)

```
╔══════════════════════════════════════════════════════════════╗
║  TÚ (Felipe)                                                ║
║  "Genera un contenido para La Cuentería esta semana"         ║
╚══════════════════════════╤═══════════════════════════════════╝
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  📁 SEED FILES (ya poblados, se leen automáticamente)        │
│                                                              │
│  brand.yaml ──── quién es La Cuentería                       │
│  voice.yaml ──── cómo habla                                  │
│  audiences.yaml ── 53 personas con MBTI y datos reales       │
│  pillars.yaml ── 5 pilares con pesos                         │
│  objectives.yaml ── objetivos + mix viral/calidad/comercial  │
│  competitors.yaml ── Wonderbly, Emotions, etc.               │
│  calendar.yaml ── fechas importantes Chile                   │
│  platforms.yaml ── IG specs, horarios, formatos              │
│  metrics.yaml ── 1006 followers, 59K reach, ROAS 0.84        │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  todos los seed files alimentan a...
                           ▼
╔══════════════════════════════════════════════════════════════╗
║  🧠 AGENTE 1: ESTRATEGA (Sonnet)                             ║
║                                                              ║
║  Lee todos los seed files y decide:                          ║
║  • Qué día publicar (jueves 9 abril, 18:00)                  ║
║  • Qué pilar usar (neurociencia, peso 0.25)                  ║
║  • Qué objetivo (followers_ig)                               ║
║  • Qué formato (reel)                                        ║
║  • Qué tema específico (lectura dialógica)                   ║
║  • Qué ángulo (no es leer más, es leer diferente)            ║
║  • A quién apuntar (Camila, mamá 35-42)                      ║
║                                                              ║
║  Output: brief.yaml (1 slot definido)                        ║
╚══════════════════════════╤═══════════════════════════════════╝
                           │
                           │  el brief alimenta a 2 agentes en paralelo...
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
╔═══════════════════════╗  ╔═══════════════════════════╗
║  ✍️ AGENTE 2:          ║  ║  🎨 AGENTE 3:              ║
║  GENERADOR (Sonnet)   ║  ║  DIRECTOR DE ARTE (Sonnet) ║
║                       ║  ║                            ║
║  Crea 3 variantes:    ║  ║  Por cada variante crea:   ║
║                       ║  ║                            ║
║  A: emocional         ║  ║  • JSON imagen             ║
║     hook storytelling ║  ║    (composición, luz,      ║
║     caption cálido    ║  ║     sujetos, anti-IA)      ║
║                       ║  ║                            ║
║  B: educativo         ║  ║  • JSON video              ║
║     hook con dato     ║  ║    (escenas, cámara,       ║
║     3 preguntas       ║  ║     audio, color grading)  ║
║                       ║  ║                            ║
║  C: directo           ║  ║  • Clips por generador:    ║
║     hook urgente      ║  ║    - Seedance (3 x 15s)    ║
║     CTA fuerte        ║  ║    - Veo 3.1 (5 x 8s)     ║
║                       ║  ║                            ║
║  Cada una incluye:    ║  ║  Videos SIN subtítulos     ║
║  • Guión por escenas  ║  ║  (se agregan después)      ║
║  • Caption + hashtags ║  ║                            ║
║  • CTA comentarios    ║  ║                            ║
║  • Alt text           ║  ║                            ║
╚═══════════╤═══════════╝  ╚═════════════╤══════════════╝
            │                            │
            └────────────┬───────────────┘
                         │
                         │  3 variantes completas (copy + visual)
                         ▼
╔══════════════════════════════════════════════════════════════╗
║  🔬 AGENTE 4: ANALISTA DE VIRALIZACIÓN (Opus)                ║
║                                                              ║
║  Tiene 2 trabajos:                                           ║
║                                                              ║
║  TRABAJO A: Preparar seed para MiroFish                      ║
║  • Toma las 3 variantes + 53 personas                        ║
║  • Crea el seed document (MD en inglés)                      ║
║  • Crea el simulation_requirement                            ║
║  • Lo sube a MiroFish                                        ║
║                                                              ║
║  TRABAJO B: Interpretar resultados                           ║
║  • Lee el reporte de MiroFish (en chino)                     ║
║  • Traduce y analiza                                         ║
║  • Rankea las variantes                                      ║
║  • Detecta problemas (brand fit, sesgo, riesgos)             ║
║  • Recomienda: publicar, reservar, o descartar               ║
╚══════════════════════════╤═══════════════════════════════════╝
                           │
                           │  el seed document va a...
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  🐟 MIROFISH (motor externo, NO es un agente)                │
│                                                              │
│  1. Recibe el seed document                                  │
│  2. Construye knowledge graph en Zep Cloud (GraphRAG)        │
│  3. Genera 41 perfiles de ~2000 palabras c/u (MBTI, bio,     │
│     personalidad, comportamiento en redes, memoria)          │
│  4. Los agentes "ven" las 3 variantes como posts             │
│  5. Simulan 72 rondas de interacciones:                      │
│     LIKE, REPOST (share), QUOTE_POST (comment),              │
│     FOLLOW, CREATE_COMMENT, DO_NOTHING (ignore)              │
│  6. 947 acciones totales en ~2.7 horas                       │
│  7. ReportAgent genera informe analítico (~20 min)           │
│                                                              │
│  Output: reporte en chino con predicciones por variante      │
│                                                              │
│  ⚠️ El grafo y perfiles quedan guardados en Zep Cloud.       │
│     Se pueden reutilizar para futuras simulaciones            │
│     sin regenerar personas.                                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  el reporte vuelve al Analista...
                           ▼
╔══════════════════════════════════════════════════════════════╗
║  📊 RESULTADO FINAL                                          ║
║                                                              ║
║  Panel LLM dijo:  Variante A gana (emocional, score 65.25)  ║
║  MiroFish dijo:   Variante B gana (educativo, más follows)   ║
║                                                              ║
║  ➜ Se prioriza MiroFish (simuló interacciones reales)        ║
║                                                              ║
║  DECISIÓN: Publicar Variante B HÍBRIDA                       ║
║  • Estructura: B (datos, 3 preguntas, Whitehurst)            ║
║  • Hook: de A (emocional, "hacías todo bien")                ║
║  • Visual: de A (estética Kinfolk, cálida)                   ║
║  • CTA: "¿Cuál de las 3 preguntas vas a probar hoy?"        ║
║                                                              ║
║  Variante A → RESERVA (usar para slot futuro emocional)      ║
║  Variante C → ARCHIVO (brand fit bajo, solo nicho hombres)   ║
╚══════════════════════════╤═══════════════════════════════════╝
                           │
                           ▼
╔══════════════════════════════════════════════════════════════╗
║  👤 TÚ (Felipe) — APROBACIÓN                                ║
║                                                              ║
║  Revisas el resultado y decides:                             ║
║  ✅ Aprobar → va a publicación                               ║
║  ❌ Rechazar → el sistema regenera o presenta alternativa     ║
║  ✏️ Editar → modificas el copy, se re-simula                 ║
╚══════════════════════════╤═══════════════════════════════════╝
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  📱 PUBLICACIÓN                                              │
│                                                              │
│  • Jueves 9 abril, 18:00 hrs Chile                           │
│  • Stories de calentamiento a las 16:00                       │
│  • Reel con variante B híbrida                               │
│  • Comentario fijado: "Desafío: esta noche, hazle UNA        │
│    pregunta antes de pasar la página"                        │
│                                                              │
│  (hoy manual, futuro: scheduling vía API Meta)               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │  después de 7 días...
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  🔄 FEEDBACK LOOP (Paso 10 — aún no ejecutado)               │
│                                                              │
│  • Recoger métricas reales (likes, saves, shares, follows)   │
│  • Comparar con lo que MiroFish predijo                      │
│  • ¿Acertó? → refuerza confianza en la simulación            │
│  • ¿Falló? → calibrar personas y pesos                       │
│  • Aprendizajes alimentan la PRÓXIMA parrilla                │
│                                                              │
│  ⚠️ Esta es la pieza que falta para cerrar el ciclo          │
└──────────────────────────────────────────────────────────────┘
```

---

## Resumen en una línea por paso

```
Tú defines qué quieres
    → Estratega elige el mejor slot
        → Generador crea 3 versiones del contenido
        → Director de Arte crea la dirección visual
            → Analista prepara todo para MiroFish
                → MiroFish simula con 41 personas durante 2.7 hrs
                    → Analista interpreta y recomienda la ganadora
                        → Tú apruebas
                            → Se publica
                                → Se miden resultados reales
                                    → El sistema aprende para la próxima vez
```

---

## Los archivos que se generaron en cada paso

```
output/lacuenteria/2026-04/slot_001_reel_neurociencia/
│
├── brief.yaml                          ← ESTRATEGA
│
├── variante_A/                         ← GENERADOR + DIRECTOR DE ARTE
│   ├── copy.md                            guión + caption + CTAs
│   ├── art_direction_image.json           dirección visual imagen
│   └── art_direction_video.json           dirección visual video
│
├── variante_B/                         ← GENERADOR + DIRECTOR DE ARTE
│   ├── copy.md
│   ├── art_direction_image.json
│   ├── art_direction_video.json
│   ├── seedance_clips/                 ← DIRECTOR DE ARTE (split 15s)
│   │   ├── clip_1_hook_context.json
│   │   ├── clip_2_data_framework.json
│   │   └── clip_3_cta_close.json
│   └── veo31_clips/                    ← DIRECTOR DE ARTE (split 8s)
│       ├── clip_1_hook.json
│       ├── clip_2_passive_reading.json
│       ├── clip_3_dialogic_reading.json
│       ├── clip_4_mother_questions.json
│       └── clip_5_cta_close.json
│
├── variante_C/                         ← GENERADOR + DIRECTOR DE ARTE
│   ├── copy.md
│   ├── art_direction_image.json
│   └── art_direction_video.json
│
├── simulation.md                       ← ANALISTA (panel LLM)
├── mirofish_report.md                  ← MIROFISH (reporte en chino)
├── mirofish_report_es.md               ← ANALISTA (traducción español)
└── resultado.md                        ← ANALISTA (decisión final)
```
