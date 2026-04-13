# Integración MuAPI — Seedance 2.0 para generación de video

Documento técnico para eventual integración de MuAPI como proveedor de video en Viralscope.
Basado en ingeniería inversa del cliente MuAPI de Open-Generative-AI (MIT).

## 1. Por qué MuAPI

| Criterio | Freepik (actual) | MuAPI (candidato) |
|----------|-------------------|-------------------|
| Precio/15s video | ~$0.54 | ~$0.30 (720p) |
| API REST | Sí | Sí |
| Multi-reference I2V | No documentado | Hasta 9 imágenes (images_list) |
| Seedance 2.0 Extend | No | Sí (continuar video existente) |
| Resolución | 1080p | 480p / 720p |
| Modelo de pago | Suscripción + créditos | Pay-as-you-go |

**Caso de uso principal:** Reels que necesitan múltiples imágenes de referencia (ej: reel de imprenta con 5 portadas).

## 2. API Overview

### Base URL
```
https://api.muapi.ai
```

### Autenticación
```
Header: x-api-key: <MUAPI_API_KEY>
```

### Flujo de generación (async polling)
```
1. POST /api/v1/{endpoint}  →  { request_id: "abc-123" }
2. GET  /api/v1/predictions/{request_id}/result  →  { status: "processing" }
3. GET  /api/v1/predictions/{request_id}/result  →  { status: "completed", outputs: ["https://...mp4"] }
```

Polling: cada 2 segundos, máximo 900 intentos (~30 min timeout para video).

## 3. Endpoints relevantes para Viralscope

### Text-to-Video: Seedance 2.0
```
POST /api/v1/seedance-v2.0-t2v
```
```json
{
  "prompt": "ASMR cinematic video...",
  "aspect_ratio": "9:16",
  "duration": 15,
  "quality": "high"
}
```
| Param | Valores | Default |
|-------|---------|---------|
| aspect_ratio | 16:9, 9:16, 4:3, 3:4 | 16:9 |
| duration | 5, 10, 15 | 5 |
| quality | high, basic | basic |

### Image-to-Video: Seedance 2.0 I2V
```
POST /api/v1/seedance-v2.0-i2v
```
```json
{
  "prompt": "ASMR cinematic video...",
  "images_list": [
    "https://storage.example.com/portada1.jpg",
    "https://storage.example.com/portada2.jpg",
    "https://storage.example.com/portada3.jpg"
  ],
  "aspect_ratio": "9:16",
  "duration": 15,
  "quality": "high"
}
```
**IMPORTANTE:** El campo de imagen es `images_list` (array), NO `image_url` (string).
Soporta hasta 9 imágenes de referencia simultáneas.

### Seedance 2.0 Extend (continuar video)
```
POST /api/v1/seedance-v2.0-extend
```
```json
{
  "request_id": "abc-123-del-video-original",
  "prompt": "Continue with the next scene...",
  "duration": 10,
  "quality": "high"
}
```
Requiere el `request_id` de una generación previa de Seedance 2.0.
Preserva estilo, movimiento y audio del video original.

### Upload de archivo (para reference images)
```
POST /api/v1/upload_file
Content-Type: multipart/form-data

file: <binary>
```
Retorna: `{ url: "https://hosted-url.muapi.ai/..." }`

## 4. Respuesta del polling
```json
{
  "status": "completed",
  "outputs": ["https://cdn.muapi.ai/video/abc123.mp4"],
  "request_id": "abc-123"
}
```
Posibles estados: `processing`, `pending`, `completed`, `succeeded`, `success`, `failed`, `error`.

## 5. Diseño de edge function: generate-video-muapi

### Responsabilidades
1. Recibir `variante_id` y `take_number` (o generar todas las takes)
2. Leer el `art_direction_video_json` de la variante
3. Extraer el prompt del take correspondiente (flatten el positive_prompt JSON a texto)
4. Subir reference images a MuAPI si son URLs de Supabase
5. Llamar a Seedance 2.0 T2V o I2V según si hay imágenes
6. Polling hasta completar
7. Descargar el video y subirlo a Supabase Storage
8. Actualizar `variante.video_url`
9. Log en `generation_logs`

### Flatten de positive_prompt JSON a texto
El `positive_prompt` en nuestro formato es un JSON estructurado con escenas.
MuAPI espera un string de texto plano. La función debe:
```
positive_prompt.global → "ASMR cinematic video, 9:16 vertical, warm golden light."
positive_prompt.scenes[0] → "SECOND 0-3: Medium wide shot facing..."
positive_prompt.scenes[1] → "SECOND 3-7: Macro close-up of..."
...
```
Concatenar todo en un solo string coherente.

### Include/exclude text overlay
Si `include_text_overlay` es true:
- Agregar "TEXT OVERLAY: {text}" al final de la escena correspondiente
Si false:
- Agregar al negative_prompt: "text on screen, written words, captions, subtitles"

### Manejo de takes múltiples
Para un reel de 40s (3 takes de 15+15+10):
1. Generar Take 1 (T2V o I2V con references)
2. Generar Take 2 (T2V o I2V, independiente)
3. Generar Take 3 (T2V o I2V, independiente)
4. Los 3 videos se unen en post-producción (fuera del scope del engine)

Alternativa con Extend:
1. Generar Take 1
2. Usar Seedance 2.0 Extend con el request_id de Take 1 para Take 2
3. Usar Extend con el request_id de Take 2 para Take 3
Ventaja: continuidad visual. Desventaja: si Take 1 falla, todo falla.

## 6. Variables de entorno necesarias
```
MUAPI_API_KEY=<key>
```
Agregar a Supabase Edge Functions via dashboard.

## 7. Esquema de costos estimado

| Acción | Costo estimado |
|--------|---------------|
| 1 video 15s 720p quality=basic | ~$0.30 |
| 1 video 15s 720p quality=high | ~$0.45 |
| 1 reel completo (3 takes) | ~$0.90-1.35 |
| Upload de archivo | Gratis (incluido) |
| Polling | Gratis (incluido) |

Para una campaña de 7 reels con 3 variantes cada uno = 21 reels × 3 takes = 63 videos.
Costo total: ~$57-85 USD.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| MuAPI es plataforma nueva, puede cambiar pricing | Pay-as-you-go, sin lock-in. Migrar a fal.ai o PiAPI si necesario |
| 720p max (vs 1080p en Freepik) | Para reels de IG, 720p es suficiente. El algoritmo no penaliza 720p |
| Documentación escasa | Tenemos el cliente JS completo (Open-Generative-AI) como referencia |
| Video generado se pierde si no se descarga | Descargar inmediatamente a Supabase Storage |
| Polling timeout (video complejo) | Max 30 min timeout, retry con quality=basic si falla en high |

## 9. Integración con VideoPromptCard

El botón "Copiar take" ya genera el JSON en el formato correcto.
Para integración directa, agregar un botón "Generar en MuAPI" que:
1. Tome el JSON del take
2. Flatten el positive_prompt a texto
3. Llame a la edge function
4. Muestre progreso de polling
5. Al completar, guarde el video en Supabase y muestre el player

## 10. Próximos pasos
- [ ] Crear cuenta MuAPI y obtener API key
- [ ] Probar manualmente: subir imagen, generar 1 video de 5s quality=basic
- [ ] Crear edge function `generate-video-muapi`
- [ ] Agregar botón "Generar video" en VideoPromptCard
- [ ] Implementar flatten de positive_prompt JSON a texto
- [ ] Test con el reel de imprenta (5 portadas como reference)
