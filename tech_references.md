# Referencias Técnicas — Viralscope

---

## MiroFish

- **Repo:** https://github.com/666ghj/MiroFish
- **Qué es:** Motor de simulación multi-agente ("Swarm Intelligence Engine"). Crea agentes con personalidades independientes y memoria a largo plazo. Se le da información semilla y devuelve predicciones/reportes.
- **Licencia:** AGPL-3.0 (derivados deben ser open source)

### Pipeline (5 stages)

```
Upload seed files (PDF/MD/TXT) + simulation_requirement
        ↓
[Stage 1] LLM genera ontología (10 tipos entidad) → Zep Cloud construye Knowledge Graph
        ↓
[Stage 2] Leer entidades del grafo → LLM genera perfiles (~2000 palabras c/u) → Config de simulación
        ↓
[Stage 3] OASIS simula Twitter + Reddit en paralelo → Acciones retroalimentan el grafo Zep
        ↓
[Stage 4] ReportAgent (patrón ReACT) genera informe analítico
        ↓
[Stage 5] Usuario puede entrevistar agentes individuales o chatear con ReportAgent
```

### Generación de Perfiles (lo más relevante para Viralscope)

**Modelo de personalidad:** MBTI (16 tipos), NO Big Five/OCEAN.

**Estructura de un perfil de agente:**
```python
OasisAgentProfile:
  user_id: int              # ID numérico
  user_name: str            # username (ej: "camila_rodriguez_427")
  name: str                 # Nombre real
  bio: str                  # Biografía corta (~200 chars)
  persona: str              # Persona narrativa (~2000 palabras)
  age: int                  # Edad
  gender: str               # "male" / "female" / "other"
  mbti: str                 # Tipo MBTI (ej: "ENFJ")
  country: str              # País
  profession: str           # Profesión
  interested_topics: list   # Temas de interés
  karma: int                # Karma (Reddit)
  follower_count: int       # Seguidores
```

**El campo `persona` (~2000 palabras) incluye:**
- Información básica (edad, profesión, educación, ubicación)
- Trasfondo personal (experiencias, relaciones sociales)
- Rasgos de personalidad (MBTI, personalidad central, modo de expresión emocional)
- Comportamiento en redes sociales (frecuencia, preferencias, estilo de interacción, muletillas)
- Posiciones y opiniones (actitud ante temas, lo que le enoja o conmueve)
- Rasgos únicos (muletillas, experiencias especiales, hobbies)
- Memoria personal (relación con el evento, acciones y reacciones previas)

**Proceso de generación:**
1. Seed material (PDF/MD/TXT) se sube al sistema
2. LLM genera ontología (10 tipos de entidad, 6-10 tipos de relación)
3. Zep Cloud construye knowledge graph automáticamente (GraphRAG)
4. Para cada entidad del grafo: búsqueda híbrida en Zep (edges + nodes, reranker RRF) para contexto enriquecido
5. LLM genera perfil de ~2000 palabras con prompt especializado (distinto para individuos vs instituciones)

**Tipos de entidad individual:** student, alumni, professor, person, publicfigure, expert, faculty, official, journalist, activist
**Tipos de entidad grupal:** university, governmentagency, organization, ngo, mediaoutlet, company, institution, group, community

**Archivo clave:** `backend/app/services/oasis_profile_generator.py` (1205 líneas)

### Configuración de Actividad por Agente

Además del perfil narrativo, cada agente tiene parámetros de comportamiento:
```python
AgentActivityConfig:
  activity_level: float     # 0.0-1.0
  posts_per_hour: float     # Frecuencia de posts
  comments_per_hour: float  # Frecuencia de comentarios
  active_hours: list        # Horas activas (0-23)
  response_delay_min: int   # Delay mínimo (minutos simulados)
  response_delay_max: int   # Delay máximo
  sentiment_bias: float     # -1.0 a 1.0
  stance: str               # supportive / opposing / neutral / observer
  influence_weight: float   # Peso de influencia
```

### Ejecución: Web + CLI

- **Preparación (generar perfiles + config):** Requiere la web o invocar las clases Python directamente
- **Simulación:** 100% ejecutable desde CLI

```bash
# Ejecutar simulación Twitter + Reddit en paralelo
python run_parallel_simulation.py --config /path/to/simulation_config.json

# Solo Twitter
python run_parallel_simulation.py --config /path/to/config.json --twitter-only

# Limitar rondas
python run_parallel_simulation.py --config /path/to/config.json --max-rounds 50
```

### Reutilización de Audiencia (clave para Viralscope)

**Los perfiles son archivos planos** (JSON para Reddit, CSV para Twitter). Se pueden reutilizar:

1. Generar perfiles de Camila, Francisca, Valentina, Tomás **una sola vez**
2. Los archivos quedan en `uploads/simulations/sim_XXX/`:
   - `reddit_profiles.json`
   - `twitter_profiles.csv`
3. Para cada nuevo contenido a simular:
   - Copiar los mismos archivos de perfiles a un directorio nuevo
   - Crear un `simulation_config.json` nuevo cambiando solo `event_config.initial_posts`
   - Ejecutar vía CLI
4. El contenido semilla (`initial_posts`) es independiente de los perfiles

**No hay función nativa de "cargar perfiles existentes"**, pero la arquitectura de archivos planos hace trivial la reutilización.

### Memoria de los Agentes (3 niveles)

1. **Memoria inyectada en el perfil:** El campo `persona` incluye "memoria personal/institucional" del evento (viene del grafo Zep)
2. **Memoria dinámica durante simulación:** `ZepGraphMemoryUpdater` captura todas las acciones y actualiza el grafo Zep en tiempo real
3. **Memoria OASIS:** Base de datos SQLite con historial de acciones, consultable por el LLM

### Seed Material

- **Formatos aceptados:** PDF, Markdown (.md), TXT
- **NO acepta URLs directamente** — solo archivos subidos
- **Tamaño máximo:** 50 MB
- **Para la ontología:** texto truncado a 50,000 caracteres
- **Para el grafo:** chunks de 500 chars con 50 de overlap

### Stack Técnico

| Componente | Tecnología |
|-----------|------------|
| LLM | Cualquier OpenAI SDK-compatible (default: Qwen-plus, fallback: gpt-4o-mini) |
| Knowledge Graph | Zep Cloud (SaaS) — requiere API key |
| Motor de simulación | OASIS (camel-ai/oasis v0.2.5) |
| Plataformas simuladas | Twitter + Reddit (NO Instagram nativo) |
| Backend | Flask + Python 3.11-3.12 |
| Frontend | Vue.js 3 |
| DB simulación | SQLite (una por simulación) |

### Limitaciones para Viralscope

1. **Simula Twitter/Reddit, no Instagram.** Las acciones (CREATE_POST, LIKE, REPOST) son de Twitter. Para contenido IG se usaría como proxy.
2. **Zep Cloud es SaaS.** El grafo vive en la nube. Hay fork offline con Neo4j + Ollama pero es menos estable.
3. **AGPL-3.0.** Si se productiza Viralscope, derivados deben ser open source. Evaluar alternativa o mantener uso interno.

---

## autoresearch (Karpathy)

- **Repo:** https://github.com/karpathy/autoresearch
- **Qué es:** Agente autónomo que ejecuta ~100 experimentos de ML overnight en una sola GPU. Modifica código, entrena 5 min, evalúa, conserva mejoras, descarta fallos, repite.
- **Concepto clave:** `program.md` define instrucciones para el agente (análogo a `CLAUDE.md`). Un solo archivo editable (`train.py`). Métrica fija (`val_bpb`) para comparación justa.
- **Features clave:**
  - Single-file experimentation (solo edita `train.py`)
  - Budget fijo de 5 min por experimento (comparabilidad directa)
  - Human-in-the-loop vía Markdown (`program.md`)
  - Self-contained: una GPU, un archivo, una métrica
- **Stack:** Python, PyTorch, single NVIDIA GPU, `uv` package manager.
- **Licencia:** MIT
- **Rol en Viralscope:** Patrón de iteración autónoma transferible. En vez de experimentos ML, el agente itera sobre variantes de contenido: genera → simula → mide → conserva ganadoras → descarta → repite.

---

## Mapeo de Patrones: autoresearch → Viralscope

| autoresearch | Viralscope |
|---|---|
| `train.py` (el agente edita) | Variantes de contenido |
| `program.md` (instrucciones) | `CLAUDE.md` + brand guidelines |
| `val_bpb` (métrica fija) | Engagement score simulado (scorecard 6 ejes) |
| 5 min budget por experimento | 1 simulación por variante |
| 100 experimentos overnight | N variantes evaluadas por batch |

---

## Integración MiroFish en Viralscope

### Flujo propuesto para simular contenido de La Cuentería:

```
[Una sola vez]
1. Preparar seed files con perfiles narrativos de Camila, Francisca, Valentina, Tomás
2. Subir a MiroFish como seed material (MD/TXT)
3. Generar perfiles vía web → obtener reddit_profiles.json + twitter_profiles.csv
4. Guardar estos archivos como "audiencia fija" de La Cuentería

[Por cada contenido a simular]
1. El Analista de Viralización genera simulation_config.json con:
   - Los mismos perfiles (copiados)
   - El contenido a evaluar en event_config.initial_posts
2. Ejecutar vía CLI: python run_parallel_simulation.py --config config.json
3. Recoger resultados de la simulación
4. El Analista interpreta y rankea

[Automatización]
Script Python que:
- Recibe N variantes de contenido
- Genera N simulation_config.json (mismos perfiles, distinto contenido)
- Ejecuta N simulaciones secuenciales o paralelas
- Recopila resultados y genera ranking
```

### Adaptación MBTI para buyer personas de Viralscope

| Persona | MBTI sugerido | Justificación |
|---------|--------------|---------------|
| Camila (mamá profesional) | ENFJ | Empática, organizada, busca conexión, líder social |
| Francisca (abuela activa) | ESFJ | Cálida, tradicional, orientada a familia, comparte |
| Valentina (profesional salud) | INTJ | Analítica, busca datos, estratégica, independiente |
| Tomás (papá millennial) | ENTP | Curioso, tech-friendly, busca innovación, directo |
