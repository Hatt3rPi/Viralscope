# Referencias Técnicas — Content Engine

---

## MiroFish

- **Repo:** https://github.com/666ghj/MiroFish
- **Qué es:** Motor de simulación multi-agente ("Swarm Intelligence Engine"). Crea miles de agentes con personalidades independientes y memoria a largo plazo. Se le da información semilla y devuelve predicciones/reportes.
- **Pipeline:** Graph Building → Environment Setup → Simulation → Report → Deep Interaction
- **Features clave:**
  - GraphRAG para construcción de knowledge graph desde información semilla
  - Agentes con memoria dinámica que se actualiza durante la simulación
  - ReportAgent para análisis post-simulación
  - Chat directo con agentes simulados
  - "God's-eye view" para inyectar variables y ajustar trayectorias
- **Stack:** Python 3.11-3.12 + Vue + Docker. Compatible con cualquier LLM vía OpenAI SDK (Qwen-plus recomendado). Usa Zep Cloud para memoria de agentes.
- **Licencia:** AGPL-3.0 (derivados deben ser open source)
- **Rol en Content Engine:** Capa de simulación de impacto. Crear personas (mamá 28-35, papá 30-40, abuela 55+, profesional salud) → "mostrarles" variantes de contenido → obtener engagement score simulado.

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
- **Rol en Content Engine:** Patrón de iteración autónoma transferible. En vez de experimentos ML, el agente itera sobre variantes de contenido: genera → simula → mide → conserva ganadoras → descarta → repite.

---

## Mapeo de Patrones: autoresearch → Content Engine

| autoresearch | Content Engine |
|---|---|
| `train.py` (el agente edita) | Variantes de contenido |
| `program.md` (instrucciones) | `CLAUDE.md` + brand guidelines |
| `val_bpb` (métrica fija) | Engagement score simulado |
| 5 min budget por experimento | 1 simulación por variante |
| 100 experimentos overnight | N variantes evaluadas por batch |

---

## Cómo se integran

- **MiroFish** = motor de evaluación (simula audiencia, genera scores)
- **autoresearch** = patrón de iteración autónoma (loop de mejora continua)
- **Juntos** resuelven el pipeline de Fase 1 (generación de variantes) + Fase 2 (simulación de impacto) del Content Engine.

### Alternativa ligera a MiroFish

Si MiroFish resulta demasiado pesado (Docker, VPS, AGPL), un "panel de jueces LLM" puede replicar el concepto core:

- 3-5 prompts con personas distintas (definidas por demografía, comportamiento, plataforma)
- Cada persona evalúa las variantes con un scorecard fijo
- Se rankea y selecciona sin infraestructura adicional
- Misma lógica, sin la complejidad del framework completo
