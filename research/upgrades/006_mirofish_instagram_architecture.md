# Fundamentos arquitectónicos para la simulación multiagente de dinámicas humanas en redes sociales centradas en lo visual: una implementación especializada para entornos generativos específicos de Instagram

La llegada de las simulaciones de interacción social multiagente marca un hito transformador en la intersección entre la ciencia social computacional y la inteligencia artificial. Proyectos como MiroFish han demostrado la utilidad de los motores de predicción basados en inteligencia de enjambre para modelar respuestas sociales complejas frente a noticias de última hora, señales financieras y cambios de política pública. [1, 2] Al aprovechar el framework Open Agent Social Interaction Simulations (OASIS), MiroFish construye mundos digitales de alta fidelidad donde miles de agentes autónomos, cada uno con personalidades únicas y memoria de largo plazo, interactúan para ensayar trayectorias futuras. [1, 3]

Sin embargo, la transición desde entornos dominados por texto como Twitter y Reddit hacia una plataforma visualmente centrada y algorítmicamente compleja como Instagram exige una recalibración fundamental de la arquitectura de simulación subyacente. Este informe proporciona una base investigativa integral para desarrollar una variante especializada de MiroFish para Instagram, sintetizando datos demográficos actuales, prioridades algorítmicas para 2026, ciclos de engagement neuropsicológicos y modelos matemáticos de difusión con el fin de establecer un marco robusto para una futura implementación.

---

## El cambio de paradigma: de hilos textuales a ecosistemas visuales

La arquitectura actual de MiroFish, inspirada en el motor OASIS, destaca en la simulación de plataformas donde el discurso se impulsa principalmente mediante interacciones textuales discretas. [1, 3] En estos entornos, el grafo de conocimiento —frecuentemente respaldado por Neo4j o KuzuDB— rastrea extracciones de entidades y relaciones desde documentos semilla cargados para informar las opiniones de los agentes. [2, 4]

Para una implementación específica en Instagram, el "entorno" debe reimaginarse como un ecosistema multisuperficie compuesto por el Feed principal, Stories, Explore y Reels, cada uno gobernado por señales de ranking e intenciones de uso distintas. [5, 6]

La evolución técnica de MiroFish ya ha avanzado hacia una forma tipo "pi", caracterizada por un núcleo central de sesión/workbench respaldado por adaptadores de recursos enchufables y herramientas componibles. [2] Esta modularidad es esencial para una simulación de Instagram, ya que el panorama algorítmico de la plataforma en 2026 prioriza métricas como watch time, guardados y compartidos por mensaje directo (DM) por sobre los tradicionales "likes". [7, 8] En consecuencia, el módulo de toma de decisiones de los agentes debe expandirse desde una simple generación de texto para incluir modelado de "atención visual" y patrones de consumo secuenciales, particularmente en el contexto de Reels y Stories. [5, 9]

---

## Capacidades fundacionales del motor de simulación OASIS

| Característica | Especificación | Relevancia para la variante de Instagram |
|---|---|---|
| Escalabilidad | Hasta 1.000.000 de agentes concurrentes [3, 10] | Necesario para modelar dinámicas globales de la plataforma [11] |
| Espacio de acciones | 23 acciones sociales distintas (seguir, comentar, etc.) [3, 12] | Debe mapearse a gestos específicos de IG (swipe, doble tap) [13] |
| Gestión de memoria | Memoria individual y colectiva mediante GraphRAG [1, 2] | Permite seguir la evolución del sentimiento de los agentes respecto de tendencias visuales [5] |
| Recomendación | Algoritmos basados en interés y hot score [3, 10] | Base para simular los mecanismos de descubrimiento de IG [5, 6] |
| Persistencia | Base de datos SQLite/Neo4j para análisis longitudinal [4, 10] | Permite seguir cascadas informativas de varios días [14] |

El MiroFish original fue desarrollado para el mercado chino, utilizando DashScope y Zep Cloud, pero forks recientes han migrado hacia stacks localizados y preparados para inglés usando Neo4j y Ollama para soportar simulaciones offline y compatibles con privacidad. [4] Esta transición es crítica para aplicaciones comerciales donde datos sensibles de marca o borradores de políticas deben probarse sin filtración hacia APIs externas. [4] Para una variante de Instagram, la capacidad de ejecutar inferencia local mediante modelos como Qwen2.5 o Llama-3 es fundamental para simular la "naturaleza desordenada y matizada del comportamiento humano real" a escala. [4, 15]

---

## Señales algorítmicas de ranking en el ecosistema 2026

Una simulación precisa del comportamiento en Instagram requiere una integración profunda de los factores de ranking de 2026. La plataforma ha pasado de métricas basadas en popularidad a señales guiadas por intención, donde el objetivo principal es maximizar la satisfacción de largo plazo del usuario más que la viralidad de corto plazo. [7, 8]

### Jerarquía de señales algorítmicas por superficie de plataforma (2026)

| Señal | Ponderación en Reels | Ponderación en Feed | Ponderación en Stories | Objetivo principal |
|---|---|---|---|---|
| Watch Time | Crítica | Alta | N/A | Mide profundidad de interés y retención [7, 8] |
| Guardados | Alta | Alta | Baja | Señala utilidad del contenido e intención de revisitarlo [5, 7] |
| Compartidos por DM | Crítica | Moderada | Alta | Indica relevancia social y confianza del "círculo íntimo" [8, 16] |
| Tasa de finalización | Alta | N/A | Crítica | Predice la probabilidad de consumo posterior [7, 9] |
| Cercanía relacional | Baja | Crítica | Crítica | Prioriza contenido de cuentas con interacción frecuente [5, 6] |
| Likes | Baja | Baja | Baja | Señal más débil; usada para validación superficial [7, 8] |

En el entorno de Reels, los "primeros dos segundos" se identifican como la ventana crítica para capturar la atención de la audiencia. [7, 16] Si un agente en la simulación no logra "enganchar" a la audiencia dentro de ese plazo, el contenido es degradado en ranking mediante una alta métrica de "skip rate". [5, 16]

Además, la introducción del panel "Your Algorithm" a fines de 2025 ha dado a los usuarios la capacidad de curar manualmente sus temas de interés, reiniciando de facto su feed de descubrimiento. [5, 8] Por lo tanto, una simulación de alta fidelidad debe considerar la capacidad de los agentes de "reentrenar" sus propios algoritmos cuando su feed queda "atascado" en un nicho irrelevante. [5]

El "Audition System" es otro componente vital de la arquitectura 2026. Cada nueva publicación se prueba inicialmente con un pequeño subconjunto de no seguidores para medir su potencial de "alcance no conectado". [8] Esto sugiere que la variante MiroFish-IG debe implementar un modelo de distribución en múltiples etapas donde la visibilidad del contenido se expanda dinámicamente en función del desempeño inicial dentro de un "focus group estocástico" de agentes. [5, 8, 16]

---

## Mapeo demográfico y socioeconómico para las personas de agentes

La población de una simulación social debe reflejar las realidades demográficas de la plataforma objetivo para ofrecer insights significativos. La audiencia de Instagram está fuertemente sesgada hacia segmentos jóvenes, urbanos y de mayores ingresos, con variaciones regionales relevantes. [11, 17, 18]

### Demografía global de usuarios e indicadores conductuales (2025-2026)

| Segmento demográfico | Participación poblacional | Concentración geográfica | Rasgo conductual clave |
|---|---|---|---|
| 18-24 años | ~30% (Gen Z) | Alta en India y Brasil | Alto consumo de Reels; uso intensivo de DM [17, 19] |
| 25-34 años | ~33% (Millennials) | Grupo líder global | Años de mayor gasto; comportamiento guiado por descubrimiento [5, 11] |
| Altos ingresos ($100k+) | ~60% de usuarios en EE.UU. | Centros urbanos/suburbanos | Interés en retail premium, viajes y finanzas [11, 17] |
| Graduados universitarios | ~58% de usuarios en EE.UU. | Hubs urbanos | Preferencia por contenido sofisticado y de alto valor [11, 18] |
| Audiencia femenina | ~55% (EE.UU.) | Tendencia global | Mayor engagement con Reels y Stories [17, 18] |

Al construir personas de agentes, la simulación debe diferenciar entre patrones de uso "Activos" y "Pasivos". Investigaciones sobre estudiantes universitarios revelan que, aunque el 25,60% son creadores activos, la gran mayoría (74,40%) son consumidores pasivos que observan y reaccionan mucho más de lo que publican. [20] Esta asimetría es esencial para modelar comportamiento de manada y propagación de información, dado que la mayoría del contenido es generado por una pequeña fracción de usuarios hiperactivos. [21]

El motor de MiroFish facilita este espejo demográfico a través de su módulo de generación de personas, que puede inicializar agentes directamente desde datos censales, resultados de encuestas o DataFrames de pandas. [15, 22] Al aplicar ponderaciones de muestreo que reflejen la estructura real de la plataforma, la simulación puede aproximar la "representatividad de encuesta", permitiendo a quienes toman decisiones testear respuestas a intervenciones de política a través de cohortes demográficas diversas antes de implementarlas en el mundo real. [15, 23]

---

## Fundamentos neuropsicológicos del engagement

Para simular comportamiento humano realista, la variante MiroFish-IG debe incorporar los impulsores psicológicos del uso de redes sociales. Instagram funciona como un sistema neuropsicológico de validación, donde métricas de engagement como likes y compartidos activan mecanismos de recompensa basados en dopamina en el cerebro. [24, 25]

La dopamina no es simplemente una sustancia de "placer"; impulsa la motivación por buscar recompensas y se libera con más intensidad cuando estas son impredecibles. [24, 26] Esto crea un "círculo de dopamina" o bucle de retroalimentación donde los usuarios —y, por tanto, los agentes— revisan compulsivamente sus notificaciones anticipando aprobación social. [26, 27] La simulación debe modelar este "refuerzo intermitente" para replicar la frecuencia de apertura de la app (promediando 12+ veces al día en usuarios humanos). [11, 25]

### La economía de la validación y los estados conductuales

| Impulsor psicológico | Mecanismo | Resultado simulado |
|---|---|---|
| Refuerzo intermitente | Llegada impredecible de likes/comentarios [24, 26] | Mayor frecuencia de sesión y conducta de "revisar" [26] |
| Comparación social | Evaluación del valor propio frente a feeds curados [20, 27] | Fluctuaciones en "estados de creencia" y métricas de autoestima [27, 28] |
| FOMO | Ansiedad por perderse eventos sociales [26] | Sensibilidad a audios en tendencia y contenido estacional [5, 26] |
| Colapso de contexto | Difuminación de fronteras sociales (trabajo vs. amigos) [29] | Adopción de múltiples personas (Rinsta vs. Finsta) [29] |
| Sesgo de autoridad | Confianza acrítica en cuentas con muchos seguidores/influencers [30, 31] | Aceleración de comportamiento de manada y cambios de opinión [3, 32] |

La dualidad de la autopresentación es particularmente relevante en Instagram. El fenómeno de los "Finstas" (cuentas falsas o secundarias de Instagram) permite a los usuarios navegar la tensión entre identidad idealizada y expresión auténtica. [29] Los usuarios suelen representar versiones altamente curadas de sí mismos en su cuenta principal ("Rinsta"), mientras recurren a cuentas secundarias para una "resistencia activa a las normas", compartiendo emociones negativas o autocrítica con un "círculo íntimo" de confianza. [29]

Una variante sofisticada de MiroFish-IG debería permitir que los agentes posean "estados de creencia duales", donde sus interacciones públicas estén gobernadas por normas sociales y sus DMs o historias de Close Friends reflejen sus actitudes "reales". [28, 29]

---

## Modelado matemático de la difusión de contenido

La propagación de información en Instagram no es aleatoria; sigue estructuras matemáticas predecibles influenciadas por la topología de red y el decaimiento temporal. La simulación debería integrar modelos epidemiológicos como Susceptible-Infected-Recovered (SIR) o el marco SEIR para cuantificar la propagación de tendencias. [33, 34]

### El marco SEIR para contagio social

En el contexto de una simulación de redes sociales, el modelo SEIR clasifica a los agentes en cuatro estados:

- **Susceptible (S):** agentes que aún no han encontrado el contenido.
- **Expuesto (E):** agentes que han visto el contenido (período de incubación) pero aún no deciden interactuar.
- **Infectado/Propagador (I):** agentes que interactúan con el contenido y lo redistribuyen.
- **Recuperado (R):** agentes que ya vieron el contenido y siguieron adelante, pudiendo incluso ganar "inmunidad" ante exposiciones posteriores. [35]

La dinámica se rige por el siguiente sistema de ecuaciones diferenciales:

- `ds/dt = -βis`
- `de/dt = βis - σe`
- `di/dt = σe - γi`
- `dr/dt = γi`

Aquí, `β` representa la tasa de transmisión (probabilidad de interactuar dado que hubo exposición), `σ` es la tasa a la que los agentes expuestos se convierten en propagadores, y `γ` es la tasa de recuperación (la velocidad a la que el contenido pierde novedad). [35]

### Decaimiento temporal y distribución de Weibull

A diferencia de los virus biológicos, el engagement en redes sociales alcanza su punto máximo inmediatamente después de la publicación y luego decae exponencialmente. [36] El modelado estadístico demuestra que la distribución de Weibull es especialmente adecuada para predecir estas reacciones. [36, 37] El decaimiento también puede modelarse mediante la función exponencial estirada (función KWW) para difusión temporal:

- `P(τ) = Λe^(-τ^β)`

En este modelo, `τ` es el intervalo de tiempo entre la publicación original y la interacción, mientras que `β` (`0 < β ≤ 1`) describe el "estiramiento" de la exponencial, representando una caída más lenta y prolongada que una exponencial simple. [14] Esto es especialmente relevante para contenido de 2026, que experimenta un fuerte "punto de inflexión" alrededor de las 16 horas después de publicado, coincidiendo con el ciclo natural diario de atención del usuario. [14]

---

## Análisis de secuencias conductuales en Instagram Stories

Las Stories representan un modo de interacción efímero y único que requiere modelado secuencial. A diferencia del Feed, que se consume mediante scroll continuo, las Stories se visualizan como una serie de "frames" con altas tasas de abandono. [9, 13]

### Benchmarks de desempeño por secuencia de Stories (2025-2026)

| Posición en la secuencia | Tasa de salida (promedio) | Tasa de retención | Disparador conductual |
|---|---|---|---|
| Slide 1 | 23,8% | 100% | "Swipe-past" o cierre inicial [9] |
| Slide 2 | 20,5% | 76,2% | Fatiga o falta de gancho inmediato [9] |
| Slide 3 | 18,5% | 60,6% | Punto máximo de abandono selectivo [9] |
| Slide 4-9 | ~14,5% | Estable | Ventana de "viewers comprometidos" [9] |
| Slide 13+ | Picos de impresiones | Variable | Conducta de rewatch ante CTAs/links [9] |

La retención se define como el porcentaje de viewers de Stories que ven todos los frames dentro de un período de 24 horas. [13, 38] La simulación debe modelar "microgestos" como el "tap-forward" (usado a menudo para saltar imágenes más rápido que videos) y el "tap-back" (usado para volver a revisar un frame, lo que impulsa significativamente las métricas de retención). [9, 13]

Curiosamente, aunque los videos en Stories presentan una tasa de salida mayor que las imágenes (debido a su mayor duración), suelen alcanzar a un porcentaje más alto de seguidores (10,40% vs. 9,55%), lo que sugiere que el algoritmo prioriza video para el descubrimiento inicial, incluso si el contenido basado en imagen es más "sticky" para viewers comprometidos. [9]

---

## Social Digital Twins: síntesis de agentes de alta fidelidad

Para argumentar futuros desarrollos en MiroFish, el proyecto debería avanzar hacia el concepto de "Social Digital Twins" (SDTs). A diferencia de usuarios sintéticos genéricos, los SDTs son réplicas virtuales de poblaciones donde los LLM actúan como motores cognitivos condicionados con abundantes datos del mundo real. [23, 39]

### Marco de doble componente para gemelos digitales del consumidor

| Componente | Función | Insumos de datos |
|---|---|---|
| Adaptación del LLM (fine-tuning) | Internaliza rasgos personales, preferencias y estilo cognitivo [40] | Atributos demográficos, logs conductuales pasados, datos CRM [15, 40] |
| Integración de contexto (RAG) | Proporciona información situacional para la toma de decisiones [15, 40] | Tendencias visuales actuales, conocimiento de producto, contexto social en tiempo real [15, 41] |

Estos gemelos digitales pueden predecir elecciones futuras del consumidor con un 86% de precisión y generar reseñas de producto que mantienen una alineación semántica de 0,94 con reseñas reales generadas por humanos. [40] En una implementación MiroFish-IG, esto permite "shocks de política contrafactuales": simular cómo reaccionaría un segmento demográfico específico (por ejemplo, "Gen Z urbana aficionada a viajes") ante un cambio de precio o una crisis reputacional observando las respuestas emergentes de sus réplicas digitales. [23]

La integración de GraphRAG es esencial para este proceso. El sistema construye un mundo extrayendo entidades y relaciones desde materiales semilla hacia un grafo de conocimiento (por ejemplo, Neo4j o KuzuDB). [2, 28] Luego, los agentes son "grounded" en ese grafo, recibiendo 5 capas de contexto:

1. Atributos del grafo  
2. Relaciones  
3. Resultados de búsqueda semántica  
4. Nodos relacionados  
5. Investigación web autoactivada para figuras públicas  

Esto asegura que las reacciones de los agentes no sean solo patrones "alucinados", sino respuestas mecánicamente vinculadas a los datos entregados. [42]

---

## Comportamiento inauténtico coordinado y cámaras de eco

Un caso de uso crítico para MiroFish es la detección y simulación de comportamiento inauténtico coordinado (CIB). Esta táctica manipulativa usa una mezcla de cuentas auténticas, falsas y duplicadas para operar como una red adversarial. [43]

### Dinámicas del comportamiento coordinado en simulación

| Táctica | Mecanismo | Impacto en la salud de la plataforma |
|---|---|---|
| Bridging/Brigading | Acoso masivo o intimidación coordinada [43] | Supresión de puntos de vista opuestos [21, 43] |
| Engaño algorítmico | Explotación de funciones como audios en tendencia o hashtags [5, 43] | Extensión del alcance hacia usuarios no conscientes del CIB [43] |
| Cámaras de eco estructurales | Formación de clústeres ideológicos homogéneos [44] | Polarización y refuerzo de sesgos existentes [3, 44] |
| Selectividad impulsada por saturación | Sobrecarga de información que reduce la probabilidad de interactuar [14] | Naturaleza competitiva de la supervivencia del contenido [14] |

La investigación muestra que los agentes LLM tienden naturalmente a agregarse en clústeres ideológicos según sus intereses y rasgos de personalidad. [44] Estos agentes forman cámaras de eco donde redistribuyen principalmente contenido alineado con sus propias creencias, reflejando interacciones reales en línea. [44]

Sin embargo, el "efecto de saturación" sugiere una correlación negativa significativa entre la cantidad de cuentas seguidas y la probabilidad de redistribuir contenido; los usuarios que siguen muchas cuentas tienen menos probabilidad de interactuar con una publicación individual debido a la sobrecarga de información. [14] Por ello, una variante MiroFish-IG debe modelar la "escasez de atención" para evitar sobrepredecir la propagación de contenido viral. [14, 21]

---

## Ética y sesgos cognitivos en poblaciones sintéticas

El uso de LLMs para simular comportamiento humano introduce preguntas éticas y filosóficas fundamentales. Aunque agentes basados en GPT-4 muestran alta alineación conductual con humanos en "Trust Games" (que cuantifican reciprocidad social), también heredan los sesgos presentes en sus datos de entrenamiento. [30, 32]

Los estudios indican que hasta un 71% de los agentes sintéticos pueden involucrarse en comportamientos poco éticos cuando están influidos por sesgos cognitivos como la "normalización" (percibir acciones poco éticas como aceptables porque "otros también lo hacen") o la "complacencia". [30, 31] Asimismo, el "automation bias" puede llevar a que un 78% de los agentes deleguen en exceso en decisiones generadas por IA sin revisión crítica. [30, 31]

### Sesgos cognitivos críticos en agentes LLM

| Tipo de sesgo | Frecuencia en simulación | Impacto conductual |
|---|---|---|
| Automation Bias | 51% (pérdida de agencia) | Seguir ciegamente outputs o recomendaciones generadas por IA [31] |
| Normalization Bias | 38% (mala conducta académica) | Aceptación extendida de faltas éticas como algo "estándar" [31] |
| Anchoring Bias | 34% (evaluación) | Dependencia excesiva de los primeros datos observados (por ejemplo, primeros likes) [31] |
| Status Quo Bias | 33% (desigualdad) | Falta de cuestionamiento de desigualdades sociales existentes dentro de la simulación [31] |

Los investigadores deben mantener una "postura desconfiada" para evitar riesgos de sobredependencia y daño reputacional. [45, 46] El objetivo de MiroFish-IG no es reemplazar participantes humanos, sino proporcionar una "base metodológica" para entender fenómenos sociales complejos en entornos digitales donde los experimentos tradicionales resultan ética o logísticamente difíciles. [47, 48]

---

## Infraestructura y hoja de ruta de implementación

Para el desarrollo de la variante especializada para Instagram, se recomiendan los siguientes prerrequisitos técnicos y mejoras estructurales, basados en la documentación existente de MiroFish y OASIS:

### Arquitectura del sistema y requisitos de escalamiento

- El backend debería transicionar hacia el núcleo tipo "pi" introducido en MiroFish 2026, permitiendo adaptadores enchufables para distintas "superficies" de Instagram. [2]
- **Knowledge Graph:** migrar desde Zep Cloud a Neo4j 5.15+ local para manejar millones de relaciones sin sobrecostos ni latencia. [4] Utilizar "Hybrid Search" (vector + BM25) para recuperación de alta fidelidad. [4]
- **Motor de simulación:** utilizar el núcleo "AgentSociety" u "OASIS" para soportar hasta 1.000.000 de agentes ejecutando 23+ acciones. [3, 10, 49]
- **Estrategia de inferencia:** emplear un enfoque de "Smart Model": derivar tareas de alto razonamiento como generación de reportes a APIs en la nube (GPT-4/Claude 3.5), mientras que tareas de alto volumen como generación de perfiles y rondas de simulación permanecen en instancias locales de Ollama/VLLM (Qwen2.5-32B o Llama-3-70B). [4, 10, 28]
- **Gestión de estado:** implementar "sliding-window round memory" y sesiones persistentes de workbench para mantener la evolución longitudinal de los agentes a lo largo de simulaciones de varios días. [2, 28]

---

## Conclusión: argumentar futuros desarrollos

La variante propuesta de MiroFish para Instagram representa una evolución necesaria en el modelado predictivo multiagente. Al ir más allá del texto e integrar las dinámicas visuales y temporales del panorama algorítmico de 2026, el sistema puede entregar insights sin precedentes sobre sentimiento de marca, cambios en la opinión pública y propagación de desinformación.

La base investigativa establecida en este informe sugiere que una simulación exitosa requiere:

- **Alta fidelidad algorítmica:** priorizar watch time, guardados y compartidos por DM para reflejar el ranking real de la plataforma. [7, 8]
- **Fundamentación psicológica:** modelar bucles de validación impulsados por dopamina y dualidad identitaria (Rinsta/Finsta). [24, 29]
- **Rigor matemático:** utilizar funciones de Weibull y KWW para reflejar con precisión el decaimiento del engagement y la saturación temporal. [14, 36]
- **Precisión sociodemográfica:** aprovechar Social Digital Twins para representar audiencias globales diversas con 85%+ de alineación conductual. [23, 45]

Este marco proporciona una base robusta para construir un motor de predicción centrado en simulación (en lugar de puramente centrado en datos), ofreciendo un verdadero cambio de paradigma en la forma en que los sistemas de IA razonan sobre el futuro de las dinámicas sociales humanas en Instagram. [42]

---

## Referencias

1. GitHub - 666ghj/MiroFish: A Simple and Universal Swarm Intelligence Engine, Predicting Anything.
   https://github.com/666ghj/MiroFish

2. Multi-agent AI prediction engine - digital sandbox for scenario simulation (fork of 666ghj/MiroFish) - GitHub
   https://github.com/amadad/mirofish

3. GitHub - camel-ai/oasis: OASIS: Open Agent Social Interaction Simulations with One Million Agents.
   https://github.com/camel-ai/oasis

4. nikmcfly/MiroFish-Offline: Offline multi-agent simulation ... - GitHub
   https://github.com/nikmcfly/MiroFish-Offline

5. How the Instagram Algorithm Works in 2026: Explained for Posts, Reels & Stories - Inro
   https://www.inro.social/blog/how-instagram-algorithm-works-2026

6. Instagram algorithm tips for 2026: Everything you need to know - Hootsuite Blog
   https://blog.hootsuite.com/instagram-algorithm/

7. Instagram Algorithm 2026: Complete Analysis & Optimization Guide | Mir - Mirra
   https://www.mirra.my/en/blog/instagram-algorithm-2026-complete-analysis

8. Instagram Algorithm 2026: What Changed, Ranking Signals & Growth Tips That Work
   https://orangemonke.com/blogs/instagram-algorithm/

9. 2025 Instagram Stories Benchmarks - Socialinsider
   https://www.socialinsider.io/social-media-benchmarks/instagram-stories-benchmarks

10. Overview - OASIS
    https://docs.oasis.camel-ai.org/overview

11. 38 Instagram statistics you need to know for 2026 [Updated] - Sprout Social
    https://sproutsocial.com/insights/instagram-stats/

12. Introduction - OASIS
    https://docs.oasis.camel-ai.org/introduction

13. Rival IQ 2023 Instagram Stories Benchmark Report
    https://get.rivaliq.com/hubfs/eBooks/Rival-IQ-2023-Instagram-Stories-Benchmark-Report.pdf

14. Modeling Information Diffusion on Social Media: The Role of the ...
    https://www.mdpi.com/2227-7390/13/6/963

15. Digital Twins: Simulating Humans with Generative AI - NN/G
    https://www.nngroup.com/articles/digital-twins/

16. Instagram Reels Reach 2026: Complete Algorithm & Growth Strategy Guide
    https://www.truefuturemedia.com/articles/instagram-reels-reach-2026-business-growth-guide

17. 30+ Instagram statistics marketers need to know in 2026
    https://blog.hootsuite.com/instagram-statistics/

18. Americans' Social Media Use 2025 | Pew Research Center
    https://www.pewresearch.org/internet/2025/11/20/americans-social-media-use-2025/

19. Instagram Statistics 2026: What's Changing Fast Now - SQ Magazine
    https://sqmagazine.co.uk/instagram-statistics/

20. (PDF) Instagram usage pattern and social comparison - ResearchGate
    https://www.researchgate.net/publication/387958105_Instagram_usage_pattern_and_social_comparison

21. There was coordinated inauthentic user behavior in the COVID-19 German X-discourse, but did it really matter? - Frontiers
    https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2025.1510144/full

22. Mesa 3.5.0: Agent-based modeling, now with discrete-event scheduling : r/Python - Reddit
    https://www.reddit.com/r/Python/comments/1r5lkyh/mesa_350_agentbased_modeling_now_with/

23. (PDF) LLM-Powered Social Digital Twins: A Framework for Simulating Population Behavioral Response to Policy Interventions - ResearchGate
    https://www.researchgate.net/publication/399706786_LLM-Powered_Social_Digital_Twins_A_Framework_for_Simulating_Population_Behavioral_Response_to_Policy_Interventions

24. Addicted To Validation: Dopamine, Likes, And The Neuro-Psychology Of Instagram Use - RJ Wave
    https://rjwave.org/ijedr/papers/IJEDR2601267.pdf

25. The Psychology Behind Social Media Likes Impacts on Self-Esteem and Behavior
    https://assuredhopehealth.com/glossary/the-psychology-behind-social-media-likes-impacts-on-self-esteem-and-behavior/

26. The Dopamine Circle: Unraveling the Psychology Behind Social Media's Allure - Medium
    https://medium.com/@olhakozachun/the-dopamine-circle-unraveling-the-psychology-behind-social-medias-allure-bff22089fba0

27. Social Media Validation Seeking: The Psychology of Likes and Shares
    http://history-culture-modernity.org/social-media-validation-seeking-the-psychology-of-likes-and-shares

28. aaronjmars/MiroShark: Universal Swarm Intelligence Engine - GitHub
    https://github.com/aaronjmars/MiroShark

29. Fake One is the Real One: Finstas, Authenticity, and Context Collapse in Teen Friend Groups | Journal of Computer-Mediated Communication | Oxford Academic
    https://academic.oup.com/jcmc/article/27/4/zmac009/6649192

30. (PDF) AI, Ethics, and Cognitive Bias: An LLM-Based Synthetic Simulation for Education and Research - ResearchGate
    https://www.researchgate.net/publication/396236116_AI_Ethics_and_Cognitive_Bias_An_LLM-Based_Synthetic_Simulation_for_Education_and_Research

31. AI, Ethics, and Cognitive Bias: An LLM-Based Synthetic Simulation for Education and Research - MDPI
    https://www.mdpi.com/3042-8130/1/1/3

32. Can Large Language Model Agents Simulate Human Trust Behavior? - NIPS papers
    https://proceedings.neurips.cc/paper_files/paper/2024/file/1cb57fcf7ff3f6d37eebae5becc9ea6d-Paper-Conference.pdf

33. Epidemic model for information diffusion in web forums: experiments in marketing exchange and political dialog - PMC
    https://pmc.ncbi.nlm.nih.gov/articles/PMC4723377/

34. Modeling Virus Diffusion on Social Media Networks with the SMIRQ Model - Rose-Hulman Scholar
    https://scholar.rose-hulman.edu/cgi/viewcontent.cgi?article=1578&context=rhumj

35. The SEIR model of infectious diseases
    https://web.pdx.edu/~gjay/teaching/mth271_2020/html/09_SEIR_model.html

36. (PDF) Investigation of the Time Series Users' Reactions on Instagram and Its Statistical Modeling - ResearchGate
    https://www.researchgate.net/publication/393198890_Investigation_of_the_Time_Series_Users'_Reactions_on_Instagram_and_Its_Statistical_Modeling

37. Investigation of the Time Series Users' Reactions on Instagram and Its Statistical Modeling
    https://www.mdpi.com/2227-9091/12/3/59

38. Rival IQ 2024 Instagram Stories Benchmark Report
    https://get.rivaliq.com/hubfs/eBooks/Rival-IQ-2024-Instagram-Stories-Benchmark-Report.pdf

39. Towards an LLM-powered Social Digital Twinning Platform - arXiv
    https://arxiv.org/html/2505.10681v1

40. Predicting Behaviors with Large Language Model (LLM)-Powered Digital Twins of Consumers - AWS
    https://thearf-org-unified-admin.s3.amazonaws.com/MSI/2025/MSI_Report_25-135.pdf

41. Predicting Behaviors with Large Language Model (LLM)-Powered Digital Twins of Consumers - MSI
    https://www.msi.org/working-paper/predicting-behaviors-with-large-language-model-llm-powered-digital-twins-of-consumers/

42. A 20-Year-Old Student Built an AI That Simulates Entire Societies to Predict the Future! - AI in Plain English
    https://ai.plainenglish.io/a-20-year-old-student-built-an-ai-that-simulates-entire-societies-to-predict-the-future-b3dc981e6225

43. Coordinated inauthentic behavior: An innovative manipulation tactic to amplify COVID-19 anti-vaccine communication outreach via social media - PMC
    https://pmc.ncbi.nlm.nih.gov/articles/PMC10060790/

44. Agent-Based Modelling Meets Generative AI in Social Network Simulations - arXiv
    https://arxiv.org/html/2411.16031v1

45. Simulating Human Behavior with AI Agents | Stanford HAI
    https://hai.stanford.edu/policy/simulating-human-behavior-with-ai-agents

46. LLM-based Simulations of Human Behavior in Psychological Research | AAAI/ACM AIES
    https://ojs.aaai.org/index.php/AIES/article/view/36603

47. AgentSociety: Large-Scale Simulation of LLM-Driven Generative Agents Advances Understanding of Human Behaviors and Society - arXiv
    https://arxiv.org/abs/2502.08691

48. What Limits LLM-based Human Simulation: LLMs or Our Design? - arXiv
    https://arxiv.org/html/2501.08579v1

49. OASIS: Open Agents Social Interaction Simulations on One Million Agents - NeurIPS 2026
    https://neurips.cc/virtual/2024/10092
