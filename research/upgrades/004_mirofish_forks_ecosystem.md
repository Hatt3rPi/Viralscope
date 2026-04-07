# MiroFish — Forks, Alternativas y Roadmap de Upgrade

**Fecha:** 2026-04-05
**Contexto:** Evaluación del ecosistema MiroFish para encontrar/construir una solución que cumpla: CLI 100%, agentes persistentes por marca, español/inglés, mecanismo de encuestas.

---

## 1. Repo original

| Campo | Valor |
|-------|-------|
| **URL** | https://github.com/666ghj/MiroFish |
| **Website** | https://mirofish.ai |
| **Stars** | ~50,000 |
| **Forks** | ~7,350 |
| **Licencia** | AGPL-3.0 |
| **Stack** | Python (backend) + Vue.js (frontend) |
| **Último push** | 2026-04-02 |
| **i18n** | zh, **en**, **es**, fr, pt, ru, de (built-in) |
| **Motor subyacente** | CAMEL-AI/OASIS |

El repo está muy activo. Ya incluye español nativo en `locales/languages.json`, lo que debería resolver el problema de "perfiles en chino" que experimentamos en la sesión 001.

---

## 2. Forks destacados

| Fork | Stars | Último push | Notas |
|------|-------|-------------|-------|
| **ByeongkiJeong/MiroFish-Ko** | 207 | 2026-03-19 | Traducción coreana. Fork más popular. |
| **JayFarei/MiroFish** | 68 | 2026-03-20 | Fork general, activo. |
| **ChinmayShringi/MicroFish-En** | 34 | 2026-04-05 | Traducción inglesa ("MicroFish"). |
| **arshmakker/MiroFish** | 34 | 2026-04-03 | Fork general activo. |
| **newway-anshul/MiroFish-EN** | 24 | 2026-03-11 | Fork enfocado en inglés. |
| **DragonJAR/MiroFish-ES** | 3 | 2026-04-04 | **Fork español**. README, docs y guía Docker en español. DragonJAR es comunidad LATAM de seguridad/tech. |
| **fantasyslr/MiroFishmoody** | 5 | 2026-03-18 | Variante con énfasis emocional/mood. Interesante para contenido. |
| **Blubobo1010/MiroFish-IT** | 3 | 2026-03-22 | Fork italiano con "Institutional Calibration Framework" para poblaciones sintéticas EU. |

**Fork más relevante para nosotros:** DragonJAR/MiroFish-ES, aunque el repo original ya incluye `es` en i18n — el fork podría volverse redundante.

---

## 3. Alternativas para encuestas y simulación CLI

### Enfocadas en encuestas / market research

| Proyecto | Stars | Licencia | CLI | Encuestas | Persistencia | Idiomas |
|----------|-------|----------|-----|-----------|--------------|---------|
| **BayramAnnakov/synthetic-market-research** | 23 | MIT | Si | Si (core) | No | EN |
| **wuzengqing001225/SmartAgentSurvey** | 12 | CC0 | Si | Si (core) | Limitada | EN |
| **arrudafranco/panel-twin-modeller** | 1 | -- | Python CLI + React | Si | Si | EN |
| **lingchowc/aurapop** | 0 | -- | No (dashboard) | Si | No | EN |
| **asanaei/FocusGroup** | 1 | -- | No | Si | No | EN |

### Plataformas de simulación de agentes (adaptables)

| Proyecto | Stars | Licencia | CLI | Notas |
|----------|-------|----------|-----|-------|
| **camel-ai/oasis** | 4,119 | Apache 2.0 | Si | Motor de MiroFish. Hasta 1M agentes. Persistencia. |
| **joonspk-research/generative_agents** | 21,062 | -- | Si | Paper original de Stanford. Fundación del campo. |
| **AM-2304/murm** | 4 | -- | Si | "Multi-agent Uncertainty Resolution Machine". Local-first, sin DBs. |
| **victoriano/swarm-predict** | 2 | MIT | Si | Local-first, solo JSON + LLM APIs. Muy simple. |
| **grahamhome/llm-ant-farm** | 57 | -- | Si | Reimplementación de generative agents con LLMs locales. |

---

## 4. Matriz de requisitos

| Requisito | MiroFish original | DragonJAR/MiroFish-ES | OASIS | murm | SmartAgentSurvey |
|-----------|-------------------|----------------------|-------|------|------------------|
| CLI 100% | No (web app) | No (web app) | **Si** | **Si** | **Si** |
| Agentes persistentes por marca | Si (Zep Cloud) | Si (Zep Cloud) | **Si** | No | No |
| Español/Inglés | **Si** (i18n nativo) | **Si** | No | No | No |
| Encuestas a agentes | No (predictivo) | No (predictivo) | No | No | **Si** |

**Conclusión:** Ninguna herramienta cumple los 4 requisitos. La mejor base es **OASIS** + capa custom.

---

## 5. Recomendación: wrapper CLI sobre OASIS

OASIS es el motor que MiroFish usa por debajo, pero expuesto como SDK Python puro (sin web UI obligatoria).

### Componentes a construir

1. **Brand Universe Manager**
   - Crear/cargar/guardar universos de agentes por marca
   - Input: seed YAML (buyer personas con MBTI, demografía, comportamiento)
   - Output: agentes persistentes con memoria a largo plazo
   - Comando: `mirofish universe create --brand lacuenteria --seed personas.yaml`

2. **Survey Engine**
   - Inyectar encuestas/cuestionarios al universo
   - Cada agente responde según su personalidad, MBTI, memoria acumulada
   - Agregación automática de resultados (cuanti + cuali)
   - Comando: `mirofish survey run --universe lacuenteria --survey encuesta.yaml`

3. **Capa de idioma**
   - System prompts en español para que los agentes "piensen" en español
   - Templates de encuesta bilingües

4. **Reporter**
   - Análisis automatizado de respuestas
   - Segmentación por persona type, MBTI, demographics
   - Export a JSON/CSV para integración con Viralscope
   - Comando: `mirofish report --survey-id 001 --format json`

### Referencia de código para surveys

- `SmartAgentSurvey`: patrón de generación de respuestas sintéticas
- `synthetic-market-research`: Semantic Similarity Rating (SSR) para validación

---

## 6. Alternativa rápida (si no queremos construir)

Para algo inmediato sin desarrollo:

1. **Actualizar MiroFish** a la última versión (i18n español resuelto)
2. Usar **SmartAgentSurvey** por separado para encuestas
3. Conectar ambos manualmente vía export/import de perfiles

Desventaja: dos herramientas, sin persistencia cruzada, workflow manual.

---

## 7. Problemas conocidos de MiroFish en Windows (sesión 001)

- `state.json` se desincroniza de `run_state.json`
- SQLite `.db` se bloquea (PermissionError) al re-ejecutar
- Refrescar la web puede relanzar simulación
- Simula Twitter/Reddit, no Instagram
- ~2.7 horas por simulación

Estos problemas son del web app. Un wrapper CLI sobre OASIS los evitaría por diseño.

---

## 8. Update (2026-04-05): MiroFish_es creado

Se creó `referencias/MiroFish_es/` — copia con:
- **UI en español**: `locales/es.json` (665 líneas)
- **Prompts LLM en inglés**: 6 archivos de servicios traducidos (zh→en)
- **Decisión**: prompts en inglés (no español) por compatibilidad con modelos chinos
- **`get_language_instruction()`** sigue pidiendo output en español al LLM
- **Original intacto** como fallback: `referencias/MiroFish/`
- **Estado**: UI validada, pendiente simulación completa E2E
