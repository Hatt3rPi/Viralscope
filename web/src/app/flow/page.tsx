export default function FlowPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Viralscope — Flujo E2E</h1>
        <p className="text-sm text-gray-500 mb-10">Actualizado 2026-04-08 v2</p>

        {/* FASE 0: ONBOARDING */}
        <div className="rounded-xl border border-gray-600 bg-gray-900/60 px-6 py-3 mb-6 text-center">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Fase 0 — Onboarding de Marca</span>
        </div>

        <Step
          number="0a"
          title="Input: URL + Instagram"
          subtitle="El usuario solo ingresa nombre, URL web y @instagram"
          color="slate"
          badge="LIVE"
          items={[
            "Formulario minimo: nombre de la marca, URL del sitio web, @instagram (opcional)",
            "Crea proyecto en Supabase con onboarding_status: 'researching'",
            "Redirige a /projects/[slug]/onboarding",
          ]}
        />

        <Arrow />

        <Step
          number="0b"
          title="Research Automatico"
          subtitle="brand-researcher — crawl web + IG + analisis LLM"
          color="slate"
          badge="LIVE"
          items={[
            "1. Crawl sitio web via Railway /fetch-url (JS rendering, SSRF protection)",
            "2. Extrae links de redes sociales del contenido (IG, TikTok, FB, Twitter, YouTube, LinkedIn)",
            "3. Instagram: scrape perfil publico (bio, followers, posts desde meta tags og:description)",
            "4. Gemini analiza todo → genera version inicial de 8 YAMLs:",
            "  brand_yaml (ALTA), voice_yaml (MEDIA), audiences_yaml (BAJA)",
            "  pillars_yaml (MEDIA), competitors_yaml (BAJA), platforms_yaml (MEDIA)",
            "  metrics_yaml (BAJA), calendar_yaml (MEDIA)",
            "5. Muestra Reporte de Research con confianza por seccion",
          ]}
        />

        <Arrow />

        <Step
          number="0c"
          title="Wizard Conversacional"
          subtitle="brand-wizard — refina YAMLs, 1 pregunta por turno"
          color="slate"
          badge="LIVE"
          items={[
            "Agente tiene todo el research como contexto",
            "Prioriza secciones con confianza BAJA",
            "Valida lo encontrado: 'Encontre estos productos: X, Y, Z. Correcto?'",
            "Expande audiencias: de 2-4 segmentos basicos a 50+ personas detalladas",
            "Cada respuesta incluye yaml_updates → deep merge progresivo en Supabase",
            "Barra de progreso + sidebar con estado de cada YAML",
            "Al completar: 8 YAMLs listos → onboarding_status: 'complete'",
            "Auto-trigger panel-seed para crear agentes de evaluacion",
          ]}
        />

        <Arrow />

        {/* FASE 1: PRODUCCION */}
        <div className="rounded-xl border border-gray-600 bg-gray-900/60 px-6 py-3 mb-6 text-center">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Fase 1 — Produccion de Contenido</span>
        </div>

        <Step
          number="1"
          title="Crear Campana"
          subtitle="Wizard Conversacional del Estratega (1 pregunta por turno)"
          color="purple"
          items={[
            "Config basico: nombre, periodo, plataforma",
            "Estratega entrevista al usuario (chat conversacional, 1 pregunta por turno)",
            "Objetivo, mix intencion, fechas clave, formatos, audiencia",
            "Genera parrilla estrategica con N slots",
            "Review editable → Aprobar → Crea campaign + slots + briefs",
          ]}
        />

        <Arrow />

        <div className="rounded-xl border border-gray-700 bg-gray-900/50 px-6 py-3 mb-6 text-center">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Por cada slot de la parrilla</span>
        </div>

        <Arrow />

        <Step
          number="2"
          title="Brief"
          subtitle="Creado por el Estratega"
          color="blue"
          items={[
            "topic, topic_angle, hook_direction, cta_direction",
            "persona_target, reasoning, confidence",
            "tensions[], uncertainties[], date_reference",
            "[Aprobar Brief] →",
          ]}
        />

        <Arrow />

        <Step
          number="2.5"
          title="Hook Funnel"
          subtitle="Filtro de calidad pre-produccion"
          color="amber"
          items={[
            "Genera 12 hooks (4 emocional + 4 educativo + 4 directo)",
            "Auto-scoring 6 dimensiones: hook_strength, emotional_resonance, cta_potential, value_promise, scroll_stop, brand_fit",
            "Ranking automatico — top 3 pre-seleccionados",
            "[Generar Variantes desde Hooks] →",
          ]}
        />

        <Arrow />

        <Step
          number="3"
          title="Contenido"
          subtitle="3 variantes A/B/C desde los hooks ganadores"
          color="green"
          items={[
            "A: Emocional / Storytelling",
            "B: Educativo / Datos",
            "C: Directo / CTA",
            "Cada variante: hook, caption, guion/slides, hashtags, CTA",
            "[Continuar a Direccion de Arte] →",
          ]}
        />

        <Arrow />

        <Step
          number="4"
          title="Direccion de Arte + Imagenes"
          subtitle="Auto-pipeline: arte → NanoBanana 2 → imagenes generadas"
          color="pink"
          items={[
            "Art Direction (generate-art) — paralelo A, B, C",
            "Generacion de Imagenes (NanoBanana 2) — auto-trigger",
            "  Modelo: gemini-3.1-flash-image-preview",
            "  Storage: Supabase bucket 'media'",
            "Vista: Strategy card + Smartphone preview por variante",
            "[Continuar a Simulacion] →",
          ]}
        />

        <Arrow />

        {/* FASE 2: SIMULACION */}
        <div className="rounded-xl border border-gray-600 bg-gray-900/60 px-6 py-3 mb-6 text-center">
          <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Fase 2 — Simulacion y Prediccion</span>
        </div>

        <Step
          number="5a"
          title="Panel de Evaluacion Rapida"
          subtitle="Supabase Edge Function — panel-evaluate (~45s)"
          color="indigo"
          badge="LIVE"
          items={[
            "14 agentes persistentes evaluan variantes con encuesta estructurada",
            "Acciones: scroll_past, stop_look, read_caption, like, comment, share, save, follow",
            "Scores 1-10: hook, resonancia, claridad, CTA, brand fit, memorabilidad",
            "Composite Score ponderado por intencion (viral/quality/commercial)",
            "Veredicto: winner + confidence + recomendaciones por variante",
            "~67K tokens, ~45 segundos",
          ]}
        />

        <Arrow />

        <Step
          number="5b"
          title="Simulacion Profunda"
          subtitle="Railway (MiroShark) — 50-100+ agentes, multiples rondas"
          color="purple"
          badge="LIVE"
          items={[
            "Viralscope envia 8 YAMLs + variantes → Railway via simulate-deep",
            "",
            "Pipeline en Railway:",
            "  1. persona_builder: narrativa rica desde datos reales",
            "  2. Neo4j: extrae 150-300 entidades del texto narrativo",
            "  3. OasisProfileGenerator: perfil detallado por entidad",
            "  4. Simulacion Instagram multi-ronda (24h simuladas)",
            "",
            "Motor Instagram (MiroShark plugin):",
            "  16 acciones IG nativas (save, share_dm, view_feed, post_reel...)",
            "  Ranking: Weibull decay + audition system + multi-surface",
            "  Vision: agentes VEN imagenes y videos (Qwen3.5 Omni multimodal)",
            "  Sesgos cognitivos: bandwagon, anchoring, social proof, Rinsta/Finsta",
            "  SEIR: modelo de difusion epidemiologica para predecir viralidad",
            "  Cross-platform: agentes IG ven actividad de Twitter/Reddit",
            "",
            "Resultado: action distribution + SEIR trajectory + engagement predicho",
          ]}
        />

        <Arrow />

        <Step
          number="6"
          title="Veredicto + Aprobacion"
          subtitle="Panel rapido + Simulacion profunda → decision informada"
          color="emerald"
          items={[
            "Composite scores por variante (panel rapido)",
            "Action distribution + SEIR reach (simulacion profunda)",
            "Radar chart + tabla de acciones + risk flags",
            "",
            "Recomendacion para CADA variante:",
            "  Ganadora → publish",
            "  Perdedoras → story | reserve | repurpose | archive",
            "",
            "[Aprobar para Publicacion]",
            "Status: ready → published",
          ]}
        />

        {/* Models table */}
        <div className="mt-16 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Modelos Usados</h2>
          <div className="overflow-hidden rounded-xl border border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Funcion</th>
                  <th className="px-4 py-3 text-left">Modelo</th>
                  <th className="px-4 py-3 text-left">Donde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  ["Estratega Chat", "gemini-3.1-pro-preview", "Supabase"],
                  ["Parrilla", "gemini-3.1-pro-preview", "Supabase"],
                  ["Brief", "gemini-3.1-pro-preview", "Supabase"],
                  ["Hook Funnel", "gemini-3.1-pro-preview", "Supabase"],
                  ["Variantes", "gemini-3.1-pro-preview", "Supabase"],
                  ["Art Direction", "gemini-3.1-pro-preview", "Supabase"],
                  ["Imagenes", "gemini-3.1-flash-image-preview", "Supabase"],
                  ["Brand Researcher", "gemini-3.1-pro-preview", "Supabase"],
                  ["Brand Wizard", "gemini-3.1-pro-preview", "Supabase"],
                  ["Panel Seed", "gemini-3.1-pro-preview", "Supabase"],
                  ["Panel Evaluate", "gemini-3.1-pro-preview", "Supabase"],
                  ["Panel Verdict", "gemini-3.1-pro-preview", "Supabase"],
                  ["Persona Builder", "qwen3.5-omni (OpenRouter)", "Railway"],
                  ["Simulacion IG", "qwen3.5-omni (OpenRouter)", "Railway"],
                  ["Vision (img+video)", "qwen3.5-omni (OpenRouter)", "Railway"],
                  ["Neo4j NER", "qwen3.5-omni (OpenRouter)", "Railway"],
                ].map(([fn, model, where]) => (
                  <tr key={fn} className="bg-gray-900/50">
                    <td className="px-4 py-2.5 font-medium text-gray-300">{fn}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-purple-400">{model}</td>
                    <td className="px-4 py-2.5 text-gray-500">{where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Infra */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Infraestructura</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Frontend", "Next.js 16 → Netlify"],
              ["API + DB", "Supabase (PostgreSQL + Edge Functions)"],
              ["Storage", "Supabase bucket 'media'"],
              ["Auth", "Supabase Auth + middleware"],
              ["Imagenes", "NanoBanana 2 (Gemini Flash)"],
              ["Simulacion", "MiroShark → Railway (Python + OASIS)"],
              ["Grafo", "Neo4j Aura (entidades + relaciones)"],
              ["LLM Cloud", "OpenRouter (Qwen3.5 Omni multimodal)"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3">
                <span className="text-xs text-gray-500 uppercase">{label}</span>
                <p className="text-gray-300 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Arquitectura</h2>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
            {/* Left: Viralscope */}
            <div className="rounded-xl border border-indigo-500/30 bg-gray-900/50 p-4 space-y-3">
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Viralscope (Netlify)</div>
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
                <div className="text-xs font-semibold text-gray-300">Next.js 16 Frontend</div>
                <div className="text-xs text-gray-500">Slot Timeline, Panel Evaluate, Deep Simulation</div>
              </div>
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
                <div className="text-xs font-semibold text-gray-300">Supabase</div>
                <div className="text-xs text-gray-500">12 Edge Functions, PostgreSQL, panel_agents, panel_evaluations, Storage</div>
              </div>
            </div>

            {/* Center: arrows */}
            <div className="flex flex-col items-center justify-center gap-2 pt-12">
              <div className="text-xs text-gray-500">simulate-deep</div>
              <div className="text-purple-400 text-lg">{"-->"}</div>
              <div className="text-purple-400 text-lg">{"<--"}</div>
              <div className="text-xs text-gray-500">results</div>
            </div>

            {/* Right: Viralscope_sim */}
            <div className="rounded-xl border border-purple-500/30 bg-gray-900/50 p-4 space-y-3">
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Viralscope_sim (Railway)</div>
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
                <div className="text-xs font-semibold text-gray-300">MiroShark Backend</div>
                <div className="text-xs text-gray-500">persona_builder, Neo4j graph_builder, OASIS ProfileGen</div>
              </div>
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
                <div className="text-xs font-semibold text-gray-300">Instagram Engine</div>
                <div className="text-xs text-gray-500">16 acciones IG, Weibull ranking, SEIR difusion, Vision multimodal, Cognitive biases</div>
              </div>
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
                <div className="text-xs font-semibold text-gray-300">Servicios</div>
                <div className="text-xs text-gray-500">Neo4j Aura (grafo), OpenRouter / Qwen3.5 Omni (LLM multimodal)</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-12">
          Viralscope Content Engine — viral-scope.netlify.app
        </p>
      </div>
    </div>
  );
}

// ─── Components ─────────────────────────────────────────────────────────────

function Step({
  number,
  title,
  subtitle,
  color,
  items,
  badge,
}: {
  number: string;
  title: string;
  subtitle: string;
  color: string;
  items: string[];
  badge?: string;
}) {
  const borderColor: Record<string, string> = {
    slate: "border-gray-500/40",
    purple: "border-purple-500/40",
    blue: "border-blue-500/40",
    amber: "border-amber-500/40",
    green: "border-green-500/40",
    pink: "border-pink-500/40",
    indigo: "border-indigo-500/40",
    emerald: "border-emerald-500/40",
  };
  const numBg: Record<string, string> = {
    slate: "bg-gray-600",
    purple: "bg-purple-600",
    blue: "bg-blue-600",
    amber: "bg-amber-600",
    green: "bg-green-600",
    pink: "bg-pink-600",
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
  };
  const badgeBg: Record<string, string> = {
    amber: "bg-amber-500/20 text-amber-400",
    indigo: "bg-indigo-500/20 text-indigo-400",
    purple: "bg-purple-500/20 text-purple-400",
    slate: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className={`rounded-xl border ${borderColor[color] || "border-gray-700"} bg-gray-900/30 p-6 mb-2`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${numBg[color] || "bg-gray-600"}`}>
          {number}
        </span>
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {badge && (
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeBg[color] || "bg-gray-700 text-gray-400"}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1 pl-11">
        {items.map((item, i) => (
          <p key={i} className={`text-sm ${item.startsWith("  ") ? "text-gray-500 pl-3" : item.startsWith("[") ? "text-purple-400 font-medium mt-2" : item === "" ? "h-2" : "text-gray-400"}`}>
            {item || "\u00A0"}
          </p>
        ))}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center py-2">
      <div className="h-6 w-px bg-gradient-to-b from-gray-600 to-gray-700" />
    </div>
  );
}
