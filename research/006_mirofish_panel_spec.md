# MiroFish Panel de Evaluacion — Spec v1

## Resumen

Panel de consumidores persistente que evalua contenido real (imagenes + copy) de forma estructurada, eficiente en tokens, y con resultados comparables entre variantes.

## Agentes

- **Origen:** Todas las personas del `audiences_yaml`
- **Creacion:** Una vez por proyecto, tabla `panel_agents`
- **Memoria hibrida:** Perfil base siempre + historial activable

### Schema

```sql
CREATE TABLE panel_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  persona_name text NOT NULL,
  persona_profile jsonb NOT NULL,
  history jsonb DEFAULT '[]',
  memory_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

## Input por Evaluacion

1. Imagen real generada (base64 o URL) — multimodal
2. Copy completo de Instagram
3. Contexto: formato, plataforma, fecha, pilar, objetivo, intencion
4. Historial del agente (si activo)

## Encuesta Estructurada

### Acciones (multi-select)
```json
{
  "actions": {
    "scroll_past": false,
    "stop_look": true,
    "read_caption": true,
    "like": true,
    "comment": false,
    "share": false,
    "save": true,
    "follow": false
  }
}
```

### Scores (6 dimensiones, 1-10)
```json
{
  "scores": {
    "hook_strength": 8,
    "emotional_resonance": 7,
    "message_clarity": 9,
    "cta_effectiveness": 6,
    "brand_fit": 8,
    "memorability": 7
  }
}
```

### Campos cualitativos
```json
{
  "attention_seconds": 30,
  "sentiment": "informed",
  "best_thing": "El dato sobre lectura dialogica me sorprendio",
  "worst_thing": "El CTA se siente generico",
  "would_share_with": "familiar",
  "comment_if_any": "Mi hija ama los cuentos!"
}
```

### Preguntas condicionales
- `intention === "commercial"` → `"would_buy": true | false | "maybe"`
- `intention === "viral"` → `"would_repost_story": true | false`
- `objective === "retention"` → `"would_enable_notifications": true | false`

### Recall Test (opcional por slot)
```json
{
  "recall_text": "Era sobre una mama leyendo con su hijo...",
  "recall_accuracy": 7
}
```

## Composite Score — Pesos por Intencion

```
                    viral    quality    commercial
stop_look (%)        0.10     0.10       0.10
read_caption (%)     0.05     0.15       0.10
like (%)             0.10     0.10       0.05
comment (%)          0.15     0.10       0.05
share (%)            0.25     0.05       0.05
save (%)             0.10     0.20       0.10
follow (%)           0.10     0.15       0.10
attention_avg        0.05     0.10       0.10
sentiment_positive   0.05     0.05       0.05
cta_action           0.05     0.00       0.30
```

## Veredicto Final

```json
{
  "winner": "B",
  "composite_scores": { "A": 7.2, "B": 8.4, "C": 6.8 },
  "confidence": "alta",
  "reasoning": "Variante B domina en save y read_caption...",
  "risk_flags": ["Podria percibirse demasiado educativa para segmento joven"],
  "variant_recommendations": {
    "A": { "action": "story", "reason": "Alto share, ideal para difusion en stories" },
    "B": { "action": "publish", "reason": "Ganadora en composite score" },
    "C": { "action": "archive", "reason": "Bajo engagement, CTA no resono" }
  }
}
```

Acciones para perdedoras: `publish | story | reserve | repurpose | archive`

## Estimaciones

| Personas | Variantes | Evaluaciones | Tokens | Tiempo |
|----------|-----------|-------------|--------|--------|
| 4        | 3         | 12          | ~8K    | ~15s   |
| 10       | 3         | 30          | ~21K   | ~30s   |
| 53       | 3         | 159         | ~111K  | ~3 min |
