# Reunión Felipe & Sergio — 6 abril 2026
## Automatización de contenidos y campaña

---

## Contexto
Demo de ViralScope a Sergio. Se revisó el flujo completo: onboarding de marca, estratega de campaña, generación de parrilla, creación de variantes (3 por slot), generación de imágenes y panel de evaluación.

---

## Hallazgos y Problemas Detectados

### UX del Estratega
- **Preguntas agrupadas**: el estratega mezcla dos preguntas en una sola (ej: formato + audiencia). Debe preguntar **una a la vez**.
- **Falta feedback visual de carga**: cuando se genera la parrilla no hay indicador de progreso. Felipe hizo 20 clics por ansiedad la vez anterior y colapsó el sistema.
- **Hooks repetidos**: las 3 variantes (emocional, evocativa, directa) generaron el mismo hook. Deben diferenciarse.

### Contenido generado
- Carruseles salen **sin títulos, sin subtítulos, sin layout** — están "en bruto".
- Falta toda la capa de **post-producción visual**: texto overlay, logo, estructura de slides.
- Algunas imágenes no cargan (optimizar flujo de imágenes).

---

## Acuerdos y Tareas

### Sergio (Dirección de Arte / Diseño)

1. **Navegar ViralScope y reportar bugs/errores** que vaya encontrando.

2. **Crear templates de contenido por formato**:
   - Formatos: **Reel (9:15)** e **Instagram post (4:5 = 1080x1350)**.
   - Estructura base carrusel: **Portada → Contenido interior → Contraportada con logo**.
   - Templates diferenciados por pilar:
     - **Neurociencia**: mezcla imagen + dato (imagen realista + texto con dato duro).
     - **Crianza**: imagen emotiva/llamativa (sin tanto texto).
     - **Emocional**: puede ser más de texto.
     - **Producto/Comercial**: directo a la acción.

3. **Documento de buenas prácticas visuales**:
   - Reglas de composición: tamaño de fuente, tipografía, colores, posición del logo.
   - Coherencia de lenguaje visual (identidad de marca consistente en todas las piezas).
   - Guía para que las imágenes generadas por IA respeten la identidad visual de cada marca.
   - Evitar imágenes "desordenadas" donde no se entiende el mensaje.

4. **Escribir especificaciones funcionales** (con ayuda de IA):
   - Usar la página de flow como contexto.
   - Describir qué debería pasar en cada etapa del flujo (creación de campaña, generación, etc.).
   - Ir acumulando en un archivo grande que Felipe implementará.

5. **Templates en Canva**: Felipe comparte proyecto Canva como owner, Sergio edita los templates ahí. Felipe los consume desde el sistema.

### Felipe (Desarrollo)

1. **Corregir estratega**: una pregunta por interacción, no agrupar.
2. **Agregar feedback visual** durante generación de parrilla.
3. **Diferenciar hooks** entre las 3 variantes de cada slot.
4. **Optimizar flujo de imágenes** (algunas no cargan).
5. **Implementar especificaciones** que Sergio vaya entregando.
6. **Simplificar simulación**: reemplazar focus group conversacional (MiroFish, costoso y lento ~3hrs por publicación) por sistema de **encuestas masivas** tipo estadio.

---

## Especificaciones Técnicas Discutidas

### Sistema de Variantes
- **3 variantes por publicación**: Emocional (A), Evocativa (B), Directa (C).
- Cada variante tiene: hook, copy, llamado a acción, razonamiento.
- Las variantes deben diferenciarse claramente entre sí.

### Panel de Evaluación (6 criterios)
1. **Atención**: ¿capta la mirada?
2. **Resonancia**: ¿conecta con la audiencia?
3. **Compartibilidad**: ¿lo compartirían?
4. **Encaje con la marca**: ¿es coherente con la identidad?
5. **Claridad del CTA**: ¿se entiende qué hacer?
6. **Potencial viral**: ¿tiene chispa?

### Reglas de scoring (propuestas)
- **< 5 puntos**: descartar publicación.
- **5 a 7 puntos**: transformar en historia de reforzamiento.
- **> 7 puntos**: publicar.
- **Potencial viral detectado**: activar loop iterativo para llevar a 10 (1-2 por semana, opcional, costoso).

### Simulación
- ~150 perfiles sintéticos basados en brand voice, competidores y buyer personas.
- Se generan perfiles derivados automáticamente (ej: esposa de Sergio aparece como usuario).
- Insight clave: papás no comparten contenido pero sí compran; llegar al papá **a través de la mamá** que comparte.
- Costo estimado: ~20K CLP por ranking completo.
- Felipe está estudiando papers sobre simulación de comportamientos sociales para mejorar el método.

---

## Modelo de Negocio (Discusión Inicial)

### Sub-productos identificados
1. **Solo contenido**: generación automatizada básica.
2. **Contenido curado**: con templates y post-producción.
3. **Simulaciones/Focus group virtual**: evaluación con perfiles sintéticos.
4. **Pronósticos de resultados**: cliente trae campaña ya hecha, se evalúa.

### Referencias de precio
- Competencia (Razor/similar): desde **$39 USD/mes** (enfocado en CEO/SEO content).
- EcoSignal (Felipe): **$49 USD** por contenido SEO automatizado.
- Target de precio aún por definir — priorizar precios competitivos.

### Mercado objetivo
- **PYMEs pequeñas**: quieren presencia en redes, precio económico, no les importa entender el proceso detrás.
- **Clientes más sofisticados**: quieren el análisis, focus group virtual, simulación pre-lanzamiento.
- Referencia de Sergio: su amigo con agencia tenía 25 clientes a ~300K CLP c/u para social media básico, pero perdía plata por hora-hombre. Con automatización ese modelo se vuelve viable.

---

## Resultados SEO (La Cuentería)

- Blog con contenido automatizado diario (neurociencia con papers + campañas comerciales).
- Desde 25 enero 2026: crecimiento orgánico sostenido.
- 47 páginas indexadas, ~20 más en camino.
- ~140 impresiones diarias orgánicas.
- Técnica de contenido sobre keywords de competencia (ej: "Wonderling" → 29 búsquedas, 2 clics robados).
- SEO + AEO + GEO como estrategia combinada.

---

## Próximos Pasos
1. Sergio navega ViralScope y reporta errores.
2. Sergio crea templates en Canva (compartido) + documento de buenas prácticas + especificaciones.
3. Felipe corrige UX del estratega y optimiza flujo.
4. Felipe implementa especificaciones de Sergio conforme lleguen.
5. Definir marca propia / identidad visual para predicar con el ejemplo.
6. Definir modelo de precios (pendiente para otra conversación).
7. Meta: tener prototipo funcional publicando contenido real en ~2 semanas (Sergio mencionó templates en ~5 semanas para La Cuentería).
