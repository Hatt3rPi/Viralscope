# Agente Experto en Redes Sociales — La Cuenteria Chile

Base de conocimiento consolidada de 3 investigaciones + aprendizajes de produccion real. Este documento se inyecta como contexto en generate-variantes, generate-art, y estratega-chat.

---

## 1. ALGORITMO INSTAGRAM 2026 — Ranking de senales

1. **Shares/envios por DM** — senal #1. Instagram lo confirmo publicamente
2. **Watch time + replays** — tiempo total, no solo completion rate
3. **Saves** — senal de contenido valioso
4. **Comentarios** — especialmente los primeros 30 minutos
5. **Likes** — senal mas debil, solo desempata

**Implicacion para contenido:** disenar para SHARES primero (contenido que la gente quiere enviar a alguien), luego para SAVES (contenido util que quieren guardar).

---

## 2. REELS — Anatomia y reglas

### Estructura segundo a segundo
| Segundo | Fase | Que hacer |
|---------|------|-----------|
| 0-3s | HOOK | Pattern interrupt. 50% se va aqui. El 3-second hold rate determina todo |
| 3-7s | PROMESA | Decir que gana el viewer si se queda |
| 7-15s | ENTREGA + CTA | Entregar valor + CTA con keyword |

### Duracion optima: 7-15 segundos
- Completion rate 60-80%
- Un reel de 10s visto 3 veces supera a uno de 60s visto una vez

### Texto overlay: SIEMPRE
- 85% de videos se ven sin sonido
- Aumenta engagement ~50%
- Safe zones: evitar top 15% y bottom 25% del frame (UI de Instagram)

### Audio: estrategia hibrida
- Trending audio a volumen bajo (30%) + voiceover encima
- Trending audio: boost de discovery en Explore
- Voiceover: construye voz de marca

### Formatos que viralizan (ranked para La Cuenteria)
1. **Reaccion/Unboxing** — el producto ES el contenido. Hooray Heroes construyo su marca con "crying dad" videos
2. **POV emocional** — "POV: tu hijo ve su nombre en un libro por primera vez"
3. **Before/After** — "De idea a sus manos" con beat-drop transition
4. **Tutorial/How-to** — genera saves
5. **Myth-bust educativo** — genera comentarios y debate

### 3 tipos de reel
- **Emocional**: hook emocional + narrativa + CTA "Etiqueta/Comparte" → disenar para SHARES
- **Educativo**: dato sorprendente + tips numerados + "Guarda esto" → disenar para SAVES
- **Directo**: urgencia + producto + precio + keyword CTA → disenar para CONVERSION

---

## 3. CARRUSELES — Estructura y reglas

### Estructura AIDA (framework universal, no invento de influencers)
- **Slide 1 (Atencion)**: Hook visual + texto potente. Debe detener el scroll
- **Slides 2-6 (Interes/Deseo)**: Un punto por slide, texto conciso, valor progresivo
- **Slide final (Accion)**: CTA claro + resumen de 1 linea

### Specs tecnicas (hipotesis a testear)
- Formato: 3:4 (1080x1440) vertical — A/B test vs 4:5
- Headline: 50pt+ para legibilidad
- Body: 14pt+ minimo
- Max 2 fuentes, max 3 colores
- Safe zones: margenes generosos (180/50/120px como guia, no dogma)

### 3 tipos de carrusel
- **Emocional**: storytelling maternal, AIDA 7 slides, engagement bait "Like para Parte 2"
- **Educativo**: tips/datos, AIDA 7 slides, "Guarda esto"
- **Directo**: beneficios + precios + comment bait "Comenta CUENTO"

---

## 4. FUNNEL MANYCHAT — Comment keyword → DM → Conversion

### El funnel con mayor conversion (15-25% vs 1-3% link in bio)
```
Reel/Carrusel con CTA verbal + texto overlay ("Comenta MAMA")
  → Usuario comenta keyword
  → ManyChat envia DM automatico con incentivo
  → Usuario hace click → checkout
```

### Tacticas
- Pinned comment: repetir CTA como comentario fijado
- Decir la keyword verbalmente + texto overlay (doble refuerzo)
- Cada slot puede tener su propia keyword para segmentar
- Caption CTA en la primera linea (solo 15% lee el caption)

### Respuestas ManyChat (en espanol, alineadas con marca)
- Reply publico: "Listo! Te enviamos la magia a tu DM"
- DM: incentivo concreto (descuento, capitulo gratis, guia)
- Boton CTA en el DM: "Crear mi cuento con X% off"

---

## 5. MODELO DE CONTENIDO — Ser @pequefelicidad, no @wonderbly

### El error: solo producto = engagement muerto
- Wonderbly (569K): 0.016% engagement (solo fotos de producto)
- Hooray Heroes (253K): 0.05% engagement

### El modelo: comunidad de crianza que vende libros
- @pequefelicidad (1.1M): 0.3-0.5% engagement (10-20x mas)
- Contenido de crianza genera confianza → la gente compra libros/asesorias

### Mix recomendado para La Cuenteria
| Tipo | % | Objetivo |
|------|---|----------|
| Reels emocionales | 35% | Shares, awareness |
| Carruseles educativos | 30% | Saves, autoridad |
| Contenido ludico | 15% | Engagement organico |
| UGC producto | 10% | Prueba social |
| Comment bait + DM | 10% | Conversion directa |

---

## 6. UGC Y PRUEBA SOCIAL

- En Latam, 77% de consumidores prefiere reviews de usuarios reales sobre influencers
- Hashtag de marca: #MiCuenteria
- Micro-influencers (1K-10K) > macro-influencers para autenticidad
- Clips UGC de 10-45s tienen mayor completion rate

---

## 7. PRODUCCION DE VIDEO — Seedance 2.0

### Capacidades confirmadas (produccion real, abril 2026)
- Genera videos de 15s de calidad excepcional via image-to-video
- SI puede incluir textos overlay en el video (otros modelos NO)
- Toma foto real del producto como referencia y la replica fielmente
- Emociones humanas muy realistas (llanto, sorpresa, sonrisa)
- Movimientos organicos, no roboticos

### Aprendizajes de produccion
- **Usar foto real del libro** como reference image, NO preview IA
- **Dedicatoria manuscrita** en vez de ilustraciones interiores (evita inconsistencias visuales)
- **Incluir contexto estacional** en el prompt (elementos visuales de la campana)
- **Incluir TEXT OVERLAY** en el prompt con los textos exactos por escena
- **Negative prompt**: text on screen, subtitles solo para modelos que NO sean Seedance

### Estructura del prompt para Seedance
```
Video sequence with text overlays:
Scene 1 (0-3s): [descripcion visual]. TEXT OVERLAY: [hook text]
Scene 2 (3-10s): [descripcion visual]. TEXT OVERLAY: [body text]
Scene 3 (10-15s): [descripcion visual]. TEXT OVERLAY: [CTA text]
```

### Producto fisico en video
- Libro cuadrado 23x23cm, tapa dura, 0.7cm de espesor
- Borde/marco de color alrededor de ilustracion central cartoon
- Logo "La Cuenteria" en esquina inferior derecha de la portada
- Interior: ilustraciones cartoon a pagina completa con personajes personalizados

---

## 8. PRODUCCION DE IMAGENES — Gemini 3.1 (NanoBanana2)

### Para carruseles: generacion slide-by-slide
- Modelo: gemini-3.1-flash-lite-preview (rapido, 3s por slide)
- 3 slides en paralelo para velocidad
- Formato vertical 3:4 (1080x1440)
- Negative prompt incluir: "dimension markers, rulers, arrows, safe zone indicators"

### Para reels: imagen de preview/thumbnail
- Modelo: gemini-3.1-pro-preview (mejor calidad)
- Formato vertical 9:16
- La imagen sirve como thumbnail, NO como frame del video

---

## 9. ESTRATEGIA ESTACIONAL

| Fecha | Hook | Formato |
|-------|------|---------|
| Dia de la Mama (mayo) | "El regalo que hizo llorar a mama" | Reaccion emocional + comment bait |
| Dia del Nino (agosto) | Compilacion de reacciones de ninos | UGC montaje |
| Navidad | "12 dias de Cuenteria" countdown | Serie de reels |
| Cumpleanos | "El mejor regalo para un nino que cumple 4" | Age-specific + tutorial |

Empezar contenido estacional 3-4 semanas antes. Urgencia: "Aun llegas a pedirlo".

---

## 10. REGLAS DE PRODUCCION PARA IA

1. **Video limpio**: Seedance genera video sin texto solo si se le indica. Si quieres texto, pedirlo explicitamente con TEXT OVERLAY
2. **No inventar datos**: marcar con [dato verificar] las estadisticas no confirmadas
3. **Idioma**: Espanol chileno (es-CL). Anglicismos aceptados si la marca los usa
4. **Emojis**: con moderacion, alineados al tono calido de la marca
5. **Producto real**: siempre describir el libro como cuadrado 23x23cm con borde de color, NO como libro rectangular generico
6. **Dedicatoria > ilustraciones**: para mostrar el interior del libro en video, preferir pagina de dedicatoria manuscrita sobre paginas ilustradas (evita inconsistencias de IA)
7. **Estilo visual**:
   - Fotografia editorial calida o ilustracion conceptual sofisticada
   - Paleta: tonos calidos (ambar, crema, terracota suave) con acentos purpura de marca
   - Composicion: profundidad de campo, iluminacion natural lateral, elemento focal claro
   - Referentes: Kinfolk, Cereal Magazine, portadas de libros de crianza consciente
   - Audiencia visual: para padres/adultos — credibilidad, calidez y profesionalismo, NO estetica infantil
