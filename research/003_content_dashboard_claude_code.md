# Research #003 — Content Dashboard con Claude Code

**Fuente:** Tutorial "How to Build a Content Dashboard with Claude Code" (AI Innovators community)
**Fecha:** 2026-04-05
**Categoría:** Dashboard / content management / analytics UI

---

## Qué es

Un tutorial paso a paso para generar un dashboard de gestión de contenido con Claude Code. Stack: Next.js + Tailwind + shadcn/ui, dark theme. Se construye en 6 prompts secuenciales, cada uno genera una sección:

1. **Setup** — Estructura del proyecto + sidebar con 5 secciones + CLAUDE.md
2. **Instagram Manager** — Posts programados, borradores, publicados, backlog. CRUD de ideas con caption, tipo, estado, fecha.
3. **Analytics** — Gráficos de barras y líneas: impresiones, engagement rate, follower growth, top posts. Fuente: Metricool. Date picker.
4. **Content Calendar** — Vista mensual con chips de color por plataforma. Filtros por plataforma (IG, YouTube, etc.).
5. **Competitor Tracker** — Agregar handles, ver posts recientes, engagement, frecuencia, tendencias. Tabla sorteable multi-plataforma.
6. **News Consolidator** — Agrega noticias de nicho vía RSS. Headline, source, fecha, resumen. Filtros por topic.

---

## Ideas para implementar en Viralscope

### 1. Dashboard como interfaz visual del Content Engine

**Qué hacen ellos:** Construyen un dashboard Next.js donde se gestiona todo el contenido: ideas, borradores, publicados, calendario, competidores, analytics.

**Qué hacemos nosotros:** Todo vive en archivos YAML/MD/JSON dentro de carpetas de Git. No hay interfaz visual. Para ver el estado de un slot hay que abrir `resultado.md`. Para ver el calendario hay que leer `calendar.yaml`. Para ver competidores hay que abrir `competitors.yaml`.

**El problema real:** Los archivos funcionan bien para generación, pero no para gestión. No puedes ver de un vistazo: ¿cuántos slots tengo este mes? ¿Cuáles están en borrador, cuáles simulados, cuáles publicados? ¿Qué competidores publicaron esta semana?

**Cambio propuesto:** Viralscope ya tiene un sitio web en Netlify. En vez de un dashboard separado, podríamos agregar vistas que lean los archivos del repo:

- **Vista de parrilla mensual** — Lee las carpetas de `output/` y muestra los slots como cards con estado (brief → variantes → simulado → aprobado → publicado)
- **Vista de slot individual** — Muestra las 3 variantes lado a lado con su copy, art direction, y score/simulación
- **Vista de calendario** — Los slots posicionados en el mes con color por pilar

Esto conecta directamente con la idea #1 de research #002 (calendario mensual). El dashboard sería la visualización de ese calendario.

### 2. Estados explícitos para cada slot

**Qué hacen ellos:** Cada post tiene un estado claro: scheduled, draft, published, backlog.

**Qué hacemos nosotros:** El estado de un slot se infiere de qué archivos existen en la carpeta. Si tiene `brief.yaml` pero no `variante_A/`, está en brief. Si tiene `resultado.md`, fue evaluado. No hay un campo explícito de estado.

**Cambio propuesto:** Agregar un `status` al `brief.yaml` o crear un `status.yaml` por slot:

```yaml
status: simulated  # brief | variants | simulated | approved | published | archived
updated: 2026-04-09
decision: publish_variant_B_hybrid
publish_date: 2026-04-09T18:00:00-04:00
```

Simple, un archivo por slot. Permite que un dashboard (o un script) lea el estado de todos los slots sin abrir cada carpeta.

### 3. Competitor tracker como sección del dashboard

**Qué hacen ellos:** Tabla sorteable con handles de competidores, posts recientes, engagement, frecuencia, trends.

**Qué hacemos nosotros:** `competitors.yaml` es estático. No trackeamos qué publican ni con qué frecuencia.

**Cambio propuesto:** Esto converge con la intel competitiva de research #001 y #002. Si agregamos tracking de competidores (aunque sea manual al inicio), necesita un lugar donde vivir. El dashboard es ese lugar. Una tabla simple:

| Competidor | Tier | Último post | Formato | Hook | Engagement estimado |
|-----------|------|------------|---------|------|-------------------|

Alimenta al Estratega con datos frescos en vez de un YAML estático.

### 4. Lo que NO tiene sentido copiar

**El approach de "6 prompts secuenciales" para construir el dashboard** es un tutorial genérico. No produce un dashboard conectado a datos reales — produce placeholders con UI bonita. Los prompts no incluyen:
- Conexión real a APIs (Metricool, Instagram, RSS)
- Persistencia de datos (todo se pierde al refrescar)
- Autenticación
- Deploy

Para Viralscope el dashboard tendría que leer los archivos del repo (ya tenemos los datos en YAML/MD/JSON). Eso es más simple que conectar APIs externas — los datos ya existen, solo falta la vista.

**El News Consolidator** (RSS de noticias del nicho) es interesante conceptualmente pero no es prioridad. No necesitamos noticias para generar contenido de crianza/lectura infantil.

**Analytics con Metricool** es relevante para el feedback loop (paso 10 de FLOW.md que aún no ejecutamos), pero requiere que primero tengamos historial de publicaciones. Prematura hoy.

---

## Observaciones

- Este tutorial es el más superficial de los 3 que hemos analizado. Es un "vibe code" tutorial — genera UI sin backend ni datos reales. Pero la estructura que propone (qué secciones necesita un content manager) es útil como checklist.
- La idea más valiosa no es el dashboard en sí, sino los **estados explícitos por slot**. Con un `status.yaml` en cada carpeta, todo lo demás (dashboard, reportes, automatización) se vuelve trivial de construir.
- Si construimos dashboard, debería ser una vista del repo, no una app separada con su propia base de datos. Los archivos YAML/JSON/MD son la fuente de verdad.
