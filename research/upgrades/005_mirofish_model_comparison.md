# Comparación de modelos LLM para MiroFish_es

**Fecha:** 2026-04-06
**Endpoint:** `https://coding-intl.dashscope.aliyuncs.com/v1` (DashScope International)
**Test:** Generar un post de redes sociales como Pedro Soto (director de colegio chileno), con prompt en inglés + instrucción "Por favor, responde en español."

---

## Resultados

| Modelo | Idioma | Tiempo | Calidad del post | Recomendación |
|--------|--------|--------|-----------------|---------------|
| **kimi-k2.5** | ESPAÑOL | 4.0s | Excelente — usa hashtags, tono personal, coherente con el personaje | **RECOMENDADO** |
| **qwen3-coder-next** | ESPAÑOL | 2.4s | Excelente — retórico, emotivo, muy en personaje | Top pick si velocidad importa |
| **MiniMax-M2.5** | ESPAÑOL | 3.6s | Muy bueno — coloquial, auténtico, con escepticismo creíble | Buena alternativa |
| **qwen3-coder-plus** | ESPAÑOL | 3.9s | Bueno — más genérico, menos personalidad | OK |
| **qwen3-max-2026-01-23** | ESPAÑOL | 5.8s | Muy bueno — usa hashtag #EducaciónReal, detallado | Buena alternativa |
| **glm-4.7** | ESPAÑOL | 16.7s | Bueno — directo, corto, en personaje | Lento |
| **glm-5** | ESPAÑOL | 20.0s | Bueno — elaborado, profesional | Muy lento |
| **qwen3.5-plus** | ESPAÑOL | ~120s+ | Bueno pero TIMEOUT frecuente | **NO recomendado** (actual) |

---

## Análisis detallado

### Tier 1: Rápidos + Excelente español (< 5s)

**kimi-k2.5** (4.0s)
> "Otra app 'gratuita' que promete educar a nuestros niños con juegos. Llevo 25 años viendo cómo la tecnología promete y luego deja a los profesores solos. ¿Dónde está el maestro en esto? La conexión humana no se descarga, se construye en el aula. #EducaciónReal #Rancagua"

- Deep Thinking capability (razonamiento)
- Visual Understanding
- Muy buena adherencia al personaje
- Usa hashtags relevantes y geolocalización

**qwen3-coder-next** (2.4s)
> "¿EduPlay? Suena bonito, pero ¿quién va a enseñarles a pensar, a preguntar, a compartir? Los juegos pueden entretener, pero no sustituyen la mirada atenta de un maestro..."

- El más rápido de todos
- Retórica persuasiva, tono emocional
- Excelente español

**MiniMax-M2.5** (3.6s)
> "Otra app más para niños de 4-8 años... ¿Y la interacción con el profesor? ¿El contacto humano? Llevo 25 años en educación y nada reemplaza una buena clase con tiza y pizarra."

- Deep Thinking capability
- Tono coloquial y auténtico
- Buen balance velocidad/calidad

### Tier 2: Buenos pero lentos (> 15s)

**glm-5** y **glm-4.7**: Ambos responden bien en español pero toman 16-20 segundos por request. En una simulación con 8 agentes × 48 rondas = ~384 llamadas, esto significaría horas extra de simulación.

### Tier 3: No recomendado

**qwen3.5-plus** (actual): Timeout frecuente (>120s). Es el modelo más lento y el que está configurado actualmente. Además, durante la simulación E2E, los posts salieron en chino — probablemente porque OASIS usa un flujo diferente donde la instrucción de idioma se pierde.

---

## Recomendación

**Cambiar a `kimi-k2.5`** en `.env`:

```
LLM_MODEL_NAME=kimi-k2.5
```

Razones:
1. **Español perfecto** con adherencia al personaje
2. **4s por request** — simulación completa en ~25 min vs horas con qwen3.5-plus
3. **Deep Thinking** — razonamiento similar a o1/Claude para análisis complejos
4. **Visual Understanding** — útil si se agregan imágenes al seed

Alternativa si Kimi falla: `qwen3-coder-next` (2.4s, sin Deep Thinking pero el más rápido).

---

## Respuestas completas

### qwen3.5-plus (ACTUAL - timeout frecuente)
> ¿EduPlay? Como director, dudo que una app reemplace al profesor. Necesitamos evidencia, no modas.

### qwen3-max-2026-01-23
> Acabo de enterarme de "EduPlay", una app de juegos para niños de 4 a 8 años. ¿Otra pantalla más? En mi escuela creemos que el aprendizaje real sigue estando en el aula, con lápiz, papel y un buen profesor. La tecnología no reemplaza la mirada, la paciencia ni el ejemplo. #EducaciónReal

### qwen3-coder-next
> ¿EduPlay? Suena bonito, pero ¿quién va a enseñarles a pensar, a preguntar, a compartir? Los juegos pueden entretener, pero no sustituyen la mirada atenta de un maestro, el diálogo en clase ni el afecto que solo un adulto comprometido puede dar. ¡No confundamos herramientas con propósito! #EducaciónReal

### qwen3-coder-plus
> Acabo de enterarme de esta app EduPlay que dicen que ayuda a los niños de 4 a 8 años. Con tantas tecnologías nuevas, me preocupa que estemos reemplazando el contacto humano y el aprendizaje tradicional con juegos digitales. La educación necesita más que pantallas.

### glm-5
> Otra app más prometiendo "revolucionar" la educación. EduPlay y sus juegos para niños de 4 a 8 años... En mis 25 años como director he visto pasar muchas modas. Nada reemplaza al docente en el aula, la interacción real, el aprendizaje presencial. La tecnología es complemento, no maestro.

### glm-4.7
> Otra app "educativa" gratis, ahora EduPlay para niños de 4 a 8 años. Muy bien, pero que nadie crea que la tecnología va a reemplazar al profesor explicando en la pizarra. La educación requiere contacto humano, no solo pantallas. Tengo mis reservas.

### kimi-k2.5
> Otra app "gratuita" que promete educar a nuestros niños con juegos. Llevo 25 años viendo cómo la tecnología promete y luego deja a los profesores solos. ¿Dónde está el maestro en esto? La conexión humana no se descarga, se construye en el aula. #EducaciónReal #Rancagua

### MiniMax-M2.5
> Otra app más para niños de 4-8 años... ¿Y la interacción con el profesor? ¿El contacto humano? Llevo 25 años en educación y nada reemplaza una buena clase con tiza y pizarra. EduPlay gratis dice... veamos si realmente aprende algo. Esceptico estoy.
