# Viralscope — Documento Fundacional

**Autor:** Felipe Abarca
**Fecha:** 3 abril 2026
**Estado:** Pre-validación / Diseño
**Versión:** 0.2

---

## 1. Qué es Viralscope

Viralscope es un sistema de generación, simulación y selección inteligente de contenido social para marcas. No es otra herramienta de generación de contenido. Es un **orquestador que pre-testea antes de publicar** y entrega parrillas mensuales completas, listas para aprobar.

**En una línea:** Le das una marca, un mes, y objetivos → te devuelve 30 contenidos ganadores con assets listos, distribuidos estratégicamente en un calendario.

---

## 2. El Problema

| Dolor | Impacto |
|-------|---------|
| No hay equipo (CM + diseñador + editor) | Las PyMEs no pueden mantener consistencia |
| Pagar diseñador ≠ contenido óptimo | Gastas y cruzas los dedos |
| Las herramientas de IA generan pero no filtran | 10 opciones sin saber cuál publicar |
| No hay pre-testing | Publicas, rezas, ves qué pasa |
| No hay visión mensual | Contenido reactivo en vez de estratégico |
| No se adapta a fechas locales ni tendencias | Oportunidades perdidas |

---

## 3. La Solución

### Pipeline completo

```
┌──────────────────────────────────────────────────────────────────┐
│  1. BRAND SETUP                                                  │
│     URL web + perfil IG → auto-genera DESIGN.md + brand voice    │
│     Preguntas de refinamiento → perfil final de marca            │
│     Pilares de contenido + objetivos                             │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. INTELIGENCIA                                                 │
│     Competitor tracking → qué publica la competencia             │
│     Trend detection → tendencias en tiempo real                  │
│     Calendario local → fechas importantes del país/nicho         │
│     Feedback loop → resultados reales retroalimentan el sistema  │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. PLANIFICACIÓN DE PARRILLA                                    │
│                                                                  │
│     Input: marca + mes + objetivos + plataformas                 │
│                                                                  │
│     Distribuir N contenidos en el mes, balanceados por:          │
│     ├── Pilares de marca (educativo, emocional, comercial...)    │
│     ├── Objetivos (ventas, seguidores IG, TikTok, LinkedIn...)   │
│     ├── Mix de intención (ej: 4 virales + 26 calidad)            │
│     ├── Fechas importantes (día de la mamá, navidad, etc.)       │
│     ├── Tendencias detectadas                                    │
│     └── Formatos por plataforma seleccionada                     │
│                                                                  │
│     Output: calendario mensual con tema + formato + objetivo     │
│             por cada slot                                        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. GENERACIÓN DE VARIANTES                                      │
│                                                                  │
│     Por cada slot del calendario:                                │
│     ├── Variante A: tono emocional/testimonial                   │
│     ├── Variante B: tono educativo/datos                         │
│     └── Variante C: tono directo/CTA fuerte                     │
│                                                                  │
│     Cada variante incluye:                                       │
│     • Copy completo (caption, hashtags, CTA)                     │
│     • Prompt para generación de imagen (NanoBanana)              │
│     • Prompt para generación de video (Higgsfield/Freepik)       │
│     • Hook de los primeros 3 segundos (reel)                     │
│     • Alt text para accesibilidad                                │
│     • Adaptación por plataforma seleccionada                     │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. GENERACIÓN DE ASSETS (configurable por run)                  │
│                                                                  │
│     Modo mínimo: solo copy + prompts                             │
│     Modo imagen: copy + imágenes vía NanoBanana                  │
│     Modo completo: copy + imágenes + video                       │
│                                                                  │
│     Automatizado vía Playwright MCP + Higgsfield                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. SIMULACIÓN DE IMPACTO (core, innegociable)                   │
│                                                                  │
│     Personas simuladas basadas en datos reales:                  │
│     (construidas desde IG Insights + GA4 + buyer personas)       │
│                                                                  │
│     Cada persona "ve" las variantes y reporta:                   │
│     • ¿Le daría like? ¿Lo compartiría? ¿Haría click?            │
│     • ¿Qué emoción le genera?                                    │
│     • ¿Lo recuerda después de 5 minutos?                         │
│                                                                  │
│     Output: score por variante × persona × formato               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  7. RANKING Y SELECCIÓN                                          │
│                                                                  │
│     Score ≥ umbral → PUBLICAR ✅                                 │
│     Score medio → RESERVA (banco de contenido)                   │
│     Score bajo → ARCHIVO (se guarda, no se publica)              │
│                                                                  │
│     TODAS las variantes se guardan con sus scores                │
│     (historial completo para calibración futura)                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  8. APROBACIÓN HUMANA                                            │
│                                                                  │
│     El humano:                                                   │
│     • Define el tema/dirección (input inicial)                   │
│     • Revisa la parrilla + variantes ganadoras                   │
│     • Aprueba o rechaza antes de publicar                        │
│     • NO edita variantes (el sistema regenera si rechaza)        │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  9. PUBLICACIÓN                                                  │
│                                                                  │
│     Scheduling vía APIs (Meta, TikTok, LinkedIn)                 │
│     Horario óptimo sugerido por datos históricos                 │
│     Plataforma(s) seleccionada(s) por el usuario en la run       │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│  10. FEEDBACK LOOP                                               │
│                                                                  │
│      Resultados reales (likes, shares, saves, comments, reach)   │
│      se comparan con scores simulados                            │
│      → Calibración automática de las personas simuladas          │
│      → El sistema mejora con cada ciclo                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuración por Ejecución (Run)

Cada ejecución de Viralscope es configurable. El usuario selecciona:

| Parámetro | Opciones | Default |
|-----------|----------|---------|
| Marca | Cualquiera registrada | — (obligatorio) |
| Mes/período | Mes calendario o rango custom | Mes siguiente |
| Plataformas | IG, TikTok, LinkedIn, Facebook, YouTube Shorts, X | Todas activas de la marca |
| Número de contenidos | N total para el período | 30 |
| Mix de intención | % viral / % calidad / % comercial | 15% / 75% / 10% |
| Generación de assets | Solo copy+prompts / +imágenes / +video | Copy+prompts |
| Nivel de simulación | Panel LLM ligero / MiroFish completo | Panel LLM |

---

## 5. Parrilla de Contenidos — Estructura

La parrilla mensual no es una lista de posts. Es una distribución estratégica:

### 5.1 Pilares de Marca
Cada marca define sus pilares (ej. La Cuentería):
- Educativo (crianza consciente)
- Emocional (historias de conexión padre-hijo)
- Producto (cuentos, lanzamientos)
- Comunidad (testimonios, preguntas)

La parrilla balancea estos pilares a lo largo del mes.

### 5.2 Objetivos
Cada contenido tiene un objetivo primario:
- Comercial (venta directa, tráfico web)
- Seguidores IG
- Seguidores TikTok
- Seguidores LinkedIn
- Engagement (comentarios, guardados, compartidos)
- Brand awareness

La parrilla balancea objetivos según prioridades del mes.

### 5.3 Mix de Intención
- **Contenido viral** (~4/mes): Diseñado para máximo alcance. Temas polémicos, trending, alta compartibilidad. Sacrifica conversión por distribución.
- **Contenido de calidad** (~22-26/mes): Valor real para la audiencia. Educativo, útil, guardable. El "relleno de calidad" que mantiene presencia.
- **Contenido comercial** (~2-4/mes): CTA directo. Producto, oferta, lanzamiento. Se apoya en el alcance de los virales.

### 5.4 Calendario de Fechas Importantes
El sistema debe conocer fechas relevantes por país/nicho:
- **Chile:** Día de la mamá (mayo), día del papá (junio), fiestas patrias (sept), navidad, año nuevo
- **Nicho-específicas:** Día del libro, vuelta a clases, Black Friday, etc.

Estas fechas se marcan en la parrilla y generan contenido temático automáticamente.

---

## 6. Brand Setup — Flujo de Onboarding

### Fase 1 (MVP): Manual
- El usuario genera los archivos seed (DESIGN.md, brand voice) en una sesión de Claude Code
- Pega métricas de IG Insights / GA4 manualmente
- Define buyer personas manualmente

### Fase 2 (Deseable): Semi-automático
```
Input: URL web + perfil Instagram
                │
                ▼
    Scraping automático:
    ├── Paleta de colores (de la web)
    ├── Tono y voz (de los posts de IG)
    ├── Audiencia (de los comentarios/seguidores)
    ├── Competidores (sugeridos)
    └── Pilares detectados
                │
                ▼
    Auto-genera DESIGN.md + brand voice (borrador)
                │
                ▼
    Preguntas de refinamiento:
    ├── ¿Este tono es correcto? ¿Más formal/informal?
    ├── ¿Estos pilares representan tu marca?
    ├── ¿Qué objetivos priorizas este trimestre?
    └── ¿Hay restricciones de marca? (no decir X, no usar Y)
                │
                ▼
    Perfil final de marca (editable)
```

---

## 7. Inteligencia — Fuentes de Datos

### 7.1 Competitor Tracking
- Input: URLs/perfiles de competidores
- Análisis: qué publican, con qué frecuencia, qué les funciona
- Output: oportunidades de contenido (temas que les funcionan y tú no cubres)

### 7.2 Trend Detection
- PyTrends (Google Trends) — ya operativo
- Trending audio/hashtags por plataforma
- Noticias del nicho
- Output: temas reactivos con ventana de oportunidad

### 7.3 Feedback Loop
- Métricas reales post-publicación (manual o API)
- Comparación: score simulado vs engagement real
- Calibración: ajustar personas simuladas y pesos del ranking
- El sistema mejora con cada ciclo mensual

---

## 8. Almacenamiento — Todo se Guarda

| Elemento | Se guarda | Para qué |
|----------|-----------|----------|
| Todas las variantes generadas | ✅ | Historial + banco de contenido |
| Scores de simulación | ✅ | Calibración del modelo |
| Variantes publicadas | ✅ | Correlación con resultados reales |
| Resultados reales | ✅ | Feedback loop |
| Variantes descartadas | ✅ | Reciclaje futuro + entrenamiento |
| Parrillas históricas | ✅ | Patrón de qué funcionó por mes/temporada |

---

## 9. Capacidades Avanzadas

Ideas integradas del análisis competitivo (ver `COMPETITIVE_LANDSCAPE.md`).

### 9.1 Scoring Multi-dimensional
Cada variante no recibe un score único, sino un radar de 6 ejes:
- **Atención:** ¿Detiene el scroll?
- **Resonancia emocional:** ¿Conecta emocionalmente?
- **Shareability:** ¿Lo compartirían activamente?
- **Brand fit:** ¿Suena a la marca?
- **Claridad del CTA:** ¿Se entiende qué hacer?
- **Memorabilidad:** ¿Lo recuerda en 5 minutos?

Cada eje se puntúa del 1 al 10. El peso de cada eje varía según el objetivo del slot (un contenido viral prioriza shareability; uno comercial prioriza claridad del CTA).

*Inspirado en: Brainsuite (6 drivers neurocientíficos), Limbik (Resonance + Spread)*

### 9.2 Modelo MBTI para Personas Simuladas
Las buyer personas en `audiences.yaml` incluyen tipo MBTI (16 tipos de personalidad), compatible con MiroFish:
- 4 dicotomías: Introversión/Extroversión, Sensing/iNtuición, Thinking/Feeling, Judging/Perceiving
- Resultado: tipo de 4 letras (ej: "ENFJ", "INTJ")
- Cada tipo implica patrones de comportamiento, estilo de comunicación y triggers de acción

Los perfiles de MiroFish usan MBTI como parte del campo `persona` (~2000 palabras narrativas por agente).

*Compatible con: MiroFish (MBTI nativo). Alternativa: Deepsona usa Big Five/OCEAN con 74-90% de correlación.*

### 9.3 Resonance vs Spread como Métricas Separadas
Dos métricas independientes por variante:
- **Resonance:** ¿Qué % de la audiencia conecta con esto?
- **Spread:** ¿Cuántos lo compartirían activamente?

Un contenido puede resonar mucho pero no compartirse (algo muy personal) o compartirse mucho sin resonar (un meme). El sistema selecciona según el objetivo del slot.

*Inspirado en: Limbik (modelos Resonance + Spread)*

### 9.4 Voice Model Auto-generado desde Analytics
En vez de escribir `voice.yaml` manualmente, el sistema analiza los 10-20 posts con mejor engagement de la marca y extrae patrones: largo de frase, palabras frecuentes, tono, estructura, tipo de hook. Genera el brand voice desde datos reales.

*Inspirado en: Lately AI (Voice Model desde analytics)*

### 9.5 Fan Out: 5-8 Variantes por Slot
En vez de 3 variantes fijas, generar 5-8 con combinaciones de:
- Tono × formato × hook × CTA
- Más variantes = mejor selección post-simulación
- El costo adicional en tokens se justifica con mejor selección

*Inspirado en: Ask Rally (8 variaciones), Pencil (miles de variaciones)*

### 9.6 Content Repurposing Chain
Un contenido ganador alimenta automáticamente otros formatos:
```
Reel exitoso
├── Carrusel con los puntos clave
├── Post estático con la frase más fuerte
├── Story con encuesta relacionada
├── Thread de LinkedIn
└── Tweet/post de X
```
Un contenido → 4-5 formatos sin esfuerzo adicional.

*Inspirado en: Lately AI (longform → highlights por plataforma)*

### 9.7 Visual Attention Prediction
Antes de publicar una imagen generada, evaluar con modelo multimodal:
- ¿Dónde mira el ojo primero?
- ¿El texto se lee claramente?
- ¿El producto/sujeto es el foco?
- ¿El hook visual funciona en miniatura (thumbnail)?

*Inspirado en: Dash Social (Vision AI), Neurons (eye-tracking)*

### 9.8 Competitive Content Gaps
No solo trackear qué publica la competencia, sino detectar:
- Temas que ellos cubren y tú no → oportunidades
- Temas que tú cubres y ellos no → diferenciador a explotar
- Formatos que les funcionan y tú no usas

Los gaps alimentan automáticamente la generación de parrilla.

*Inspirado en: Crayon (intelligence gaps), Socialinsider (AI content pillars)*

### 9.9 Contenido Reactivo con Ventana de Oportunidad
Cuando se detecta una tendencia, el sistema:
1. Calcula ventana de vida útil (ej: "este audio tiene 48hrs")
2. Genera contenido reactivo alineado a la marca
3. Lo inserta en la parrilla con prioridad alta
4. Si la ventana cierra, lo descarta automáticamente

*Inspirado en: trend detection de Metricool, Hootsuite/Talkwalker*

### 9.10 A/B contra Histórico Propio
Antes de simular con personas, comparar cada variante contra los top 5 posts históricos de la marca:
- ¿Es mejor que lo que ya te funcionó?
- Si no supera tu propio baseline, se descarta antes de gastar en simulación
- Filtro rápido que reduce costos de simulación

*Inspirado en: Pencil (scoring contra $1B+ de data histórica)*

### 9.11 Arco Emocional Mensual
La parrilla no es una lista de posts, es una narrativa:
```
Semana 1: Inspiración / conexión emocional
Semana 2: Educación / valor práctico
Semana 3: Controversia / opinión / engagement fuerte
Semana 4: Comunidad + cierre comercial
```
Como el guión de una serie. El sistema planifica el arco y asigna tonos por semana.

### 9.12 Detección de Fatiga de Contenido
El sistema detecta cuándo un tema/formato se está sobreusando:
- "Llevas 4 carruseles educativos seguidos"
- "Este tema apareció 3 veces en las últimas 2 semanas"
- Ajuste automático del mix para evitar saturación de la audiencia

### 9.13 Content Series / Serialización
Contenido en partes que genera anticipación:
- "Parte 1 de 3", series semanales, sagas temáticas
- El sistema planifica series dentro de la parrilla
- Mantiene coherencia narrativa entre partes
- Cada parte tiene su propio hook pero conecta con las demás

### 9.14 Save-bait y Comment-bait Patterns
Biblioteca de patrones probados según objetivo:
- **Para guardados:** listas, checklists, "guarda esto para después", infografías
- **Para comentarios:** dilemas ("¿cuál prefieres?"), confesiones ("yo también"), mini desafíos
- El sistema aplica el patrón correcto según el objetivo del slot

### 9.15 Story-to-Feed Funnel
Usar stories como calentamiento antes de un post importante:
```
Story 1: Teaser / pregunta ("¿Sabías que...?")
Story 2: Encuesta relacionada al tema
Story 3: "Mira el post que acabo de subir"
→ Post principal en feed
```
El sistema genera automáticamente 2-3 stories previas por cada post clave del día.

### 9.16 Dark Social Optimization
Contenido diseñado para ser compartido por DM/WhatsApp (donde ocurre ~80% del sharing real):
- Formato "envíale esto a alguien que..."
- Contenido que funciona fuera de contexto (no requiere ver el perfil)
- Imágenes con texto autocontenido (se entienden sin caption)

### 9.17 Algorithm Awareness por Plataforma
El sistema mantiene un perfil actualizado de preferencias de cada algoritmo:
- IG: duración ideal de Reels, frecuencia óptima, señales de ranking actuales
- TikTok: watch time targets, trending sounds, completion rate
- LinkedIn: weight de comentarios vs likes, longitud óptima, formato preferido

Los formatos, duración y CTAs se ajustan según las reglas actuales de cada plataforma.

### 9.18 Iteración Nocturna (Patrón autoresearch)
Ciclo de mejora autónomo:
```
Generar variantes v1 → Simular → Conservar ganadoras
                                        ↓
                              Generar variantes v2
                              (inspiradas en ganadoras)
                                        ↓
                                    Simular → Conservar ganadoras
                                                    ↓
                                          ... repetir N veces
                                                    ↓
                                          Presentar top refinado
```
El sistema "duerme" iterando. Al día siguiente presenta solo el top ya refinado.

*Inspirado en: autoresearch (Karpathy) — 100 experimentos overnight*

### 9.19 Recomendación de Colaboraciones
Basado en análisis de competidores y cuentas del nicho:
- Sugerir perfiles para collabs que amplifiquen alcance
- Detectar cuentas con audiencia complementaria (no competidora)
- Generar propuesta de collab con tema sugerido

### 9.20 Cross-pollination entre Marcas
Para operadores multi-marca (como Viralscope interno):
- Detectar aprendizajes transferibles entre marcas
- "Este hook funcionó en La Cuentería → adaptable para Tu Magistral"
- Patrones de éxito que cruzan nichos
- Base de conocimiento compartida que mejora con cada marca

---

## 10. Stack Técnico

| Capa | Herramienta | Estado |
|------|------------|--------|
| Orquestación | Python / n8n | ✅ Disponible |
| Copy / guiones | LLM (Opus, Sonnet) | ✅ Disponible |
| Imágenes | NanoBanana 2 (via Higgsfield) | ✅ Disponible |
| Video prompts | Higgsfield / Freepik AI Video | 🟡 Manual |
| Automatización browser | Playwright MCP + Claude Code | ✅ Operativo |
| Simulación | MiroFish o Panel de Jueces LLM | 🟡 Por implementar |
| Brand system | DESIGN.md + brand voice | ✅ Patrón existente |
| Datos audiencia | IG Insights + GA4 (manual) | ✅ Disponible |
| Trend detection | PyTrends | ✅ Operativo |
| Scheduling | API Meta / TikTok / LinkedIn | 🔴 Fase posterior |
| Interfaz | CLI (ahora) → Web app (después) | CLI ✅ |

---

## 11. Interfaz

### Fase actual: CLI
Todo se ejecuta desde Claude Code en terminal:
```
> Genera la parrilla de abril para La Cuentería.
  30 contenidos. IG + TikTok. Solo copy + prompts.
  Mix: 4 virales, 24 calidad, 2 comerciales.
```

### Fase futura: Web app
- Dashboard por marca
- Vista calendario de la parrilla
- Comparador de variantes con scores
- Botón de aprobación/rechazo
- Historial de publicaciones vs resultados

---

## 12. Rol del Humano

| El humano hace | El sistema hace |
|----------------|-----------------|
| Define marca (una vez) | Genera perfil + brand voice |
| Da el tema/dirección del mes | Planifica la parrilla completa |
| Selecciona plataformas y parámetros | Genera variantes por slot |
| — | Simula impacto |
| — | Rankea y selecciona ganadoras |
| Aprueba o rechaza | Regenera si se rechaza |
| — | Publica en horario óptimo |
| — | Recolecta resultados y calibra |

---

## 13. Marcas Piloto

| Marca | Nicho | Audiencia | Plataformas | Datos disponibles |
|-------|-------|-----------|-------------|-------------------|
| La Cuentería | Crianza + lectura infantil | Mamás/papás 25-40, Chile | IG, TikTok | GA4, IG Insights, PostHog, PyTrends |
| EchoSignal | SEO + marketing PyMEs | Marketers, dueños PyMEs | LinkedIn, IG | GSC, blog analytics |
| Tu Magistral | Farmacia magistral | Farmacéuticos, médicos, pacientes | IG | Limitados (marca nueva) |

---

## 14. Fases de Implementación

### Fase 1: Brand Setup + Parrilla (2 semanas)
- [ ] Definir estructura de archivos seed por marca (DESIGN.md, brand_voice, pilares, objetivos)
- [ ] Crear seed files para La Cuentería manualmente
- [ ] Calendario de fechas importantes Chile 2026
- [ ] Prompt template que genera parrilla mensual balanceada
- [ ] Generar parrilla de prueba para mayo 2026

### Fase 2: Generación de Variantes (2 semanas)
- [ ] Prompt templates para generación de variantes (copy + prompts de imagen + prompts de video)
- [ ] Adaptación por plataforma (IG, TikTok, LinkedIn)
- [ ] Sistema de almacenamiento de variantes (todas se guardan)
- [ ] Testear con 5 slots de la parrilla de mayo

### Fase 3: Simulación de Impacto (2 semanas)
- [ ] Implementar panel de jueces LLM como MVP de simulación
- [ ] Crear personas simuladas desde datos reales de La Cuentería
- [ ] Scoring y ranking de variantes
- [ ] Validación: publicar top + bottom durante 30 días, medir correlación

### Fase 4: Inteligencia (2 semanas)
- [ ] Competitor tracking básico (scraping de perfiles)
- [ ] Trend detection (PyTrends + trending hashtags)
- [ ] Integrar insights de competencia y tendencias en la generación de parrilla

### Fase 5: Feedback Loop + Calibración (ongoing)
- [ ] Input manual de resultados reales post-publicación
- [ ] Comparación score simulado vs engagement real
- [ ] Ajuste de personas simuladas y pesos de ranking

### Fase 6: Automatización de Assets (paralela)
- [ ] Generación automática de imágenes vía NanoBanana + Playwright
- [ ] Prompts de video listos para Higgsfield/Freepik
- [ ] Pipeline configurable: solo copy / +imágenes / +video

### Fase 7: Publicación + Web App (posterior)
- [ ] Scheduling vía APIs de plataformas
- [ ] Dashboard web para revisión y aprobación
- [ ] Vista calendario interactiva

---

## 15. Métricas de Éxito

| Métrica | Baseline | Target Fase 3 | Target Fase 7 |
|---------|----------|---------------|---------------|
| Contenidos/mes La Cuentería | 12-16 | 30 | 30+ |
| Engagement rate IG | ~2.5% | >3.5% | >4.5% |
| Tiempo humano por mes de contenido | ~20 hrs | ~3 hrs (review) | ~1 hr (approve) |
| Correlación simulación vs real | N/A | Medir | >0.6 |
| Costo por contenido | Variable (diseñador) | ~$0.5 | ~$0.3 |
| % contenido publicado sin edición | N/A | >60% | >80% |

---

## 16. Decisiones Pendientes

1. **¿MiroFish o panel de jueces LLM?** — MiroFish es potente pero pesado (AGPL, Docker, VPS). Un panel de 3-5 jueces LLM con personas definidas puede ser suficiente como MVP.

2. **¿Video self-hosted o servicio?** — Higgsfield/Freepik como servicio es más rápido. Self-hosted requiere GPU dedicada.

3. **¿Cuántas variantes por slot?** — ¿3 es suficiente? ¿5 es demasiado costoso en tokens?

4. **¿Cómo manejar contenido YMYL (Tu Magistral)?** — Review humano obligatorio siempre, o solo en ciertos temas.

5. **¿Estructura de datos?** — JSON, Markdown, base de datos. Definir cómo se almacenan parrillas, variantes, scores, resultados.

---

*Este es el documento vivo de Viralscope. Se actualiza a medida que se validan supuestos y se avanzan fases.*
