export default function FlowPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Viralscope — Flujo de Produccion</h1>
        <p className="text-sm text-gray-500 mb-10">Actualizado 2026-04-07</p>

        {/* PASO 0 */}
        <Step
          number="0"
          title="Crear Campana"
          subtitle="Wizard Conversacional del Estratega"
          color="purple"
          items={[
            "Config basico: nombre, periodo, plataforma",
            "Estratega entrevista al usuario (chat conversacional)",
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

        {/* PASO 1 */}
        <Step
          number="1"
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

        {/* PASO 1.5 */}
        <Step
          number="1.5"
          title="Hook Funnel"
          subtitle="NUEVO — Filtro de calidad pre-produccion"
          color="amber"
          badge="NUEVO"
          items={[
            "Genera 12 hooks rapidos (4 emocional + 4 educativo + 4 directo)",
            "Auto-scoring 6 dimensiones por hook:",
            "  → hook_strength, emotional_resonance, cta_potential",
            "  → value_promise, scroll_stop, brand_fit",
            "Ranking automatico — top 3 pre-seleccionados",
            "Seleccion manual disponible (checkboxes)",
            "[Generar Variantes desde Hooks] →",
          ]}
        />

        <Arrow />

        {/* PASO 2 */}
        <Step
          number="2"
          title="Contenido"
          subtitle="gemini-3.1-pro-preview (32K output, thinking: low)"
          color="green"
          items={[
            "3 variantes desarrolladas desde los hooks ganadores:",
            "  A: Emocional / Storytelling",
            "  B: Educativo / Datos",
            "  C: Directo / CTA",
            "Cada variante: hook, caption, guion/slides, hashtags, CTA, alt text",
            "Post-scoring: 6 dimensiones por variante completa",
            "[Continuar a Direccion de Arte] → auto-genera arte A, B, C",
          ]}
        />

        <Arrow />

        {/* PASO 3 */}
        <Step
          number="3"
          title="Direccion de Arte"
          subtitle="Auto-pipeline: arte → imagenes"
          color="pink"
          items={[
            "3a. Art Direction (generate-art) — paralelo A, B, C",
            "  Reel/Story: 1 prompt (9:16)",
            "  Carrusel: 1 prompt POR SLIDE (1:1)",
            "  Video: manual (oculto en carrusel)",
            "",
            "3b. Generacion de Imagenes (NanoBanana 2) — auto-trigger",
            "  Modelo: gemini-3.1-flash-image-preview",
            "  Batch: max 3 en paralelo, 2 reintentos automaticos",
            "  Storage: Supabase bucket 'media'",
            "  [Proximamente: refinamiento via AutoLab]",
            "",
            "Vista por variante:",
            "  Izq: Strategy card (foco, hook/CTA, persona, razonamiento)",
            "  Der: Smartphone preview (device frame, caption IG completo)",
            "  Formatos: Reel 9:16 | Story 9:16 | Carrusel 1:1+dots | Post 1:1",
            "[Continuar a Simulacion] →",
          ]}
        />

        <Arrow />

        {/* PASO 4 */}
        <Step
          number="4"
          title="Panel de Evaluacion"
          subtitle="panel-seed + panel-evaluate — Edge Functions desplegadas"
          color="indigo"
          badge="LIVE"
          items={[
            "4a. Seed (una vez por proyecto): panel-seed",
            "  Lee audiences_yaml → Gemini expande a perfiles IG ricos",
            "  14 agentes con demographics, instagram_behavior, psychology, brand_relationship",
            "  Persistentes en tabla panel_agents con memoria activable",
            "",
            "4b. Evaluacion (por slot): panel-evaluate",
            "  1 llamada LLM por agente evaluando TODAS las variantes (multimodal)",
            "  Ejecucion paralela en batches de 5 (Promise.allSettled)",
            "",
            "  Encuesta estructurada por agente:",
            "    Acciones: scroll_past, stop_look, read_caption, like, comment, share, save, follow",
            "    6 dimensiones (1-10): hook, resonancia, claridad, CTA, brand fit, memorabilidad",
            "    Cualitativos: attention_seconds, sentiment, best/worst_thing, would_share_with",
            "    Condicionales: would_buy (commercial), would_repost (viral), notifications (retention)",
            "",
            "4c. Composite Score Engine (sin LLM):",
            "  Pesos por intencion del slot:",
            "    viral → share 25% + comment 15% + like 10%",
            "    quality → save 20% + follow 15% + read_caption 15%",
            "    commercial → cta_action 30% + attention 10% + save 10%",
            "",
            "Resultado: ~67K tokens para 14 personas x 3 variantes (~45s)",
            "Guardado en tabla panel_evaluations",
          ]}
        />

        <Arrow />

        {/* PASO 5 */}
        <Step
          number="5"
          title="Veredicto + Aprobacion"
          subtitle="Ranking automatico + decision humana"
          color="emerald"
          items={[
            "Composite scores por variante (A: 7.2, B: 8.4, C: 6.8)",
            "Radar chart comparativo de 6 dimensiones",
            "Tabla: % acciones por variante (stop, like, share, save...)",
            "Highlights: frases repetidas en best/worst thing",
            "",
            "Recomendacion para CADA variante:",
            "  Ganadora → publish (publicar como principal)",
            "  Perdedoras → story | reserve | repurpose | archive",
            "  Ej: 'Publicar B, usar A para Story, archivar C'",
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
                  <th className="px-4 py-3 text-left">Thinking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  ["Estratega Chat", "gemini-3.1-pro-preview", "low"],
                  ["Parrilla", "gemini-3.1-pro-preview", "medium"],
                  ["Brief", "gemini-3.1-pro-preview", "low"],
                  ["Hook Funnel", "gemini-3.1-pro-preview", "low"],
                  ["Variantes", "gemini-3.1-pro-preview", "low"],
                  ["Art Direction", "gemini-3.1-pro-preview", "low"],
                  ["Imagenes", "gemini-3.1-flash-image-preview", "—"],
                  ["Panel Seed", "gemini-3.1-pro-preview", "low"],
                  ["Panel Evaluate", "gemini-3.1-pro-preview", "low"],
                  ["Panel Verdict", "gemini-3.1-pro-preview", "low"],
                ].map(([fn, model, thinking]) => (
                  <tr key={fn} className="bg-gray-900/50">
                    <td className="px-4 py-2.5 font-medium text-gray-300">{fn}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-purple-400">{model}</td>
                    <td className="px-4 py-2.5 text-gray-500">{thinking}</td>
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
              ["Backend", "Supabase (PostgreSQL + Edge Functions)"],
              ["Storage", "Supabase bucket 'media'"],
              ["Auth", "Supabase Auth + middleware"],
              ["Imagenes", "NanoBanana 2 (Google API)"],
              ["Simulacion", "MiroFish / Panel LLM"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-gray-800/50 border border-gray-700 px-4 py-3">
                <span className="text-xs text-gray-500 uppercase">{label}</span>
                <p className="text-gray-300 mt-0.5">{value}</p>
              </div>
            ))}
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
    purple: "border-purple-500/40",
    blue: "border-blue-500/40",
    amber: "border-amber-500/40",
    green: "border-green-500/40",
    pink: "border-pink-500/40",
    indigo: "border-indigo-500/40",
    emerald: "border-emerald-500/40",
  };
  const numBg: Record<string, string> = {
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
