# Content Engine — Generador de Contenido Social con Simulación de Impacto

**Autor:** Felipe Abarca / Bolt
**Fecha:** 3 abril 2026
**Estado:** Idea / Pre-validación
**Aplicación inicial:** La Cuentería, EchoSignal, Tu Magistral

---

## 1. El Problema

Toda marca necesita publicar contenido en redes sociales de forma consistente, pero:

- **No hay equipo** — las PyMEs no tienen CM + diseñador + editor de video
- **El contenido genérico no funciona** — debe estar alineado a la marca, audiencia y objetivo
- **No sabes qué va a funcionar** — publicas, cruzas los dedos, y ves qué pasa
- **Las herramientas de IA generan, pero no filtran** — te dan 10 opciones pero no te dicen cuál publicar

## 2. La Idea

Un orquestador que genera contenido en variantes, lo somete a simulación de impacto con agentes IA, y te entrega solo las ganadoras listas para publicar.

**No es otra herramienta de generación.** Es un **sistema de selección inteligente** que usa las mejores herramientas que ya existen.

```
Tema + Marca + Objetivo
        ↓
  Generar variantes
  (3-5 por publicación)
        ↓
  Simular impacto
  (audiencia virtual)
        ↓
  Rankear y seleccionar
        ↓
  Assets listos para publicar
```

## 3. Stack Técnico

| Capa | Herramienta | Estado | Costo |
|------|------------|--------|-------|
| Copy / guiones | LLM (Opus, Sonnet, Codex) | ✅ Disponible | Plan existente |
| Imágenes | NanoBanana 2 | ✅ Disponible | Ya operativo |
| Video prompts | Higgsfield / Freepik AI Video | 🟡 Manual con prompts generados | Freemium / API |
| Simulación | MiroFish (agentes multiagente) | 🟡 Requiere setup | Open source (AGPL) |
| Brand system | DESIGN.md + brand guidelines | ✅ Implementado en EchoSignal | $0 |
| Scheduling | API Meta / TikTok / LinkedIn | 🟡 Fase posterior | API costs |
| Orquestación | n8n o script Python | ✅ Infraestructura existente | $0 |

### Flujo detallado

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT                                 │
│                                                         │
│  Tema: "Cuentos para manejar celos entre hermanos"      │
│  Marca: La Cuentería (DESIGN.md + brand voice)          │
│  Objetivo: engagement + tráfico web                     │
│  Formatos: carrusel IG + reel + post LinkedIn           │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              GENERACIÓN DE VARIANTES                     │
│                                                         │
│  LLM genera por cada formato:                           │
│  ├── Variante A: tono emocional/testimonial             │
│  ├── Variante B: tono educativo/datos                   │
│  └── Variante C: tono directo/CTA fuerte                │
│                                                         │
│  Cada variante incluye:                                 │
│  • Copy completo (caption, hashtags, CTA)               │
│  • Prompt para NanoBanana (imágenes)                    │
│  • Prompt para Higgsfield/Freepik (video)               │
│  • Hook de los primeros 3 segundos (reel)               │
│  • Alt text para accesibilidad                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              GENERACIÓN DE ASSETS                        │
│                                                         │
│  NanoBanana 2 → imágenes para cada variante             │
│  Prompts de video → listos para Higgsfield/Freepik      │
│  (ejecución manual o API según disponibilidad)          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              SIMULACIÓN DE IMPACTO (MiroFish)            │
│                                                         │
│  Personas simuladas basadas en datos reales:            │
│  ├── Mamá 28-35, Chile, IG heavy user                   │
│  ├── Papá 30-40, busca regalo, low engagement           │
│  ├── Abuela 55+, Facebook, comparte todo                │
│  └── Profesional salud infantil, LinkedIn               │
│                                                         │
│  Cada persona "ve" las 3 variantes y reporta:           │
│  • ¿Le daría like? ¿Lo compartiría? ¿Haría click?      │
│  • ¿Qué emoción le genera?                              │
│  • ¿Lo recuerda después de 5 minutos?                   │
│                                                         │
│  Output: Score por variante × persona × formato         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              RANKING Y SELECCIÓN                         │
│                                                         │
│  Variante B (educativo) → Score 8.2 → PUBLICAR ✅       │
│  Variante A (emocional) → Score 7.5 → RESERVA           │
│  Variante C (CTA fuerte) → Score 5.1 → DESCARTAR ❌     │
│                                                         │
│  La variante ganadora sale con:                         │
│  • Copy final                                           │
│  • Imágenes generadas                                   │
│  • Video (o prompt listo para generar)                   │
│  • Mejor horario sugerido (datos IG Insights)           │
│  • Hashtags optimizados                                 │
└─────────────────────────────────────────────────────────┘
```

## 4. Marcas Piloto

### La Cuentería
- **Audiencia:** Mamás/papás 25-40, Chile, interesados en crianza y lectura infantil
- **Formatos:** Reels (antes/después del cuento), carruseles educativos, testimonios
- **Datos disponibles:** GA4, IG Insights (T-Rex), PostHog, PyTrends diario
- **Volumen:** 5-7 posts/semana

### EchoSignal
- **Audiencia:** Marketers, dueños de PyMEs, SEO practitioners
- **Formatos:** Posts educativos LinkedIn, threads, infografías
- **Datos disponibles:** GSC, blog analytics
- **Volumen:** 3-4 posts/semana

### Tu Magistral
- **Audiencia:** Farmacéuticos, médicos, pacientes con receta magistral
- **Formatos:** Posts informativos IG, contenido educativo, antes/después
- **Datos disponibles:** Limitados (marca nueva)
- **Volumen:** 3 posts/semana

## 5. Ventaja Competitiva

| Lo que otros hacen | Lo que nosotros hacemos |
|-------|---------|
| Generan contenido | Generan variantes + simulan impacto + seleccionan |
| Usan 1 modelo de IA | Orquestan los mejores: LLM + NanoBanana + Higgsfield |
| Publican y rezan | Pre-testean con audiencia virtual antes de gastar |
| Brand guidelines manuales | DESIGN.md leído por agentes automáticamente |
| A/B testing con plata real | A/B testing simulado antes de publicar ($0) |

## 6. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| MiroFish no predice engagement real | El ranking no sirve | Calibrar: publicar top + bottom durante 1 mes, medir correlación |
| Calidad de imágenes inconsistente | Daña la marca | Review humano antes de publicar (al menos en Fase 1) |
| Scope creep (demasiados sistemas) | No terminas nada | Fases estrictas, dogfooding primero |
| Licencia AGPL de MiroFish | Riesgo si se productiza | Fase interna solo; evaluar fork o alternativa si se comercializa |
| GPU para generación de video | Costo alto | Higgsfield/Freepik como servicio, no self-hosted |

## 7. Plan de Fases

### Fase 1: Pipeline de Variantes (2 semanas)
**Objetivo:** Generar 3 variantes de contenido por tema, alineadas a la marca.

- [ ] Crear brand voice doc para cada marca (basado en DESIGN.md)
- [ ] LLM prompt template que genera 3 variantes con copy + prompts de imagen + prompts de video
- [ ] Integrar NanoBanana para generación automática de imágenes
- [ ] Exportar prompts de video listos para Higgsfield/Freepik
- [ ] Testear con 5 temas de La Cuentería

**Entregable:** Script/n8n workflow que recibe tema → entrega 3 packs completos de contenido.

### Fase 2: Simulación con MiroFish (2 semanas)
**Objetivo:** Validar si la simulación correlaciona con engagement real.

- [ ] Setup MiroFish (Docker, VPS dedicado)
- [ ] Crear personas basadas en datos reales de GA4 + IG Insights de La Cuentería
- [ ] Someter las variantes de Fase 1 a simulación
- [ ] Publicar la variante top Y la bottom durante 30 días
- [ ] Medir correlación: ¿MiroFish predijo bien?

**Entregable:** Reporte de correlación simulación vs realidad. Go/no-go para Fase 3.

### Fase 3: Automatización y Multicanal (2 semanas)
**Objetivo:** Pipeline end-to-end automatizado.

- [ ] Scheduling automático vía API Meta (IG) + LinkedIn
- [ ] Dashboard de resultados (simulado vs real)
- [ ] Aplicar a EchoSignal y Tu Magistral
- [ ] Flujo semanal: lunes genera → martes simula → miércoles aprueba → jueves-domingo publica

**Entregable:** Pipeline operativo para 3 marcas.

### Fase 4: Productización (si Fase 2 valida)
**Objetivo:** Convertir en servicio o producto.

- [ ] UI para clientes (subir brand guidelines, ver variantes, aprobar)
- [ ] Pricing model (por marca, por post, por mes)
- [ ] Caso de estudio con datos reales de La Cuentería

## 8. Métricas de Éxito

| Métrica | Baseline (hoy) | Target Fase 1 | Target Fase 3 |
|---------|----------------|---------------|---------------|
| Posts/semana La Cuentería | 3-4 | 5-7 | 7-10 |
| Engagement rate IG | ~2.5% | >3.5% | >4.5% |
| Tiempo humano por post | ~45 min | ~15 min (review) | ~5 min (approve) |
| Correlación simulación vs real | N/A | Medir | >0.6 |
| Costo por post | ~$0 (T-Rex) | ~$0.5 (GPU) | ~$0.3 (escala) |

## 9. Decisiones Pendientes

1. **¿MiroFish o alternativa más simple?** — MiroFish es AGPL y pesado. Quizás un "panel de jueces LLM" más liviano (3 prompts con personas distintas evaluando el contenido) sea suficiente para la simulación sin la complejidad de MiroFish.

2. **¿Video self-hosted o servicio?** — Higgsfield/Freepik como servicio es más rápido de implementar. Self-hosted (Mochi, CogVideo) requiere GPU dedicada.

3. **¿Review humano obligatorio?** — En Fase 1 sí. ¿En Fase 3 se puede automatizar completamente para contenido no-YMYL?

---

*Este documento es la base para la discusión. Las fases se ejecutan secuencialmente — no avanzar a la siguiente sin validar la anterior.*
