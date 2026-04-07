"use client";

import { useReducer, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Globe, Instagram, Check, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  createProjectWithOnboardingAction,
  updateProjectYamlsAction,
  updateOnboardingStatusAction,
} from "@/app/actions";
import type { Project, OnboardingPhase, ResearchReport, ChatMessage } from "@/lib/types";

// ─── State ──────────────────────────────────────────────────────────────────

interface OnboardingState {
  phase: OnboardingPhase;
  projectId: string | null;
  projectSlug: string | null;
  report: ResearchReport | null;
  messages: ChatMessage[];
  yamlProgress: Record<string, "empty" | "partial" | "complete">;
  progress: number;
  isLoading: boolean;
  error: string | null;
}

type OnboardingAction =
  | { type: "SET_PROJECT"; id: string; slug: string }
  | { type: "START_RESEARCH" }
  | { type: "SET_REPORT"; report: ResearchReport }
  | { type: "ENTER_WIZARD" }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "UPDATE_PROGRESS"; progress: number; sections?: string[] }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_DONE" };

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, projectId: action.id, projectSlug: action.slug };
    case "START_RESEARCH":
      return { ...state, phase: "researching", isLoading: true, error: null };
    case "SET_REPORT":
      return { ...state, phase: "report", report: action.report, isLoading: false };
    case "ENTER_WIZARD":
      return { ...state, phase: "wizard" };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message], error: null };
    case "UPDATE_PROGRESS": {
      const yp = { ...state.yamlProgress };
      for (const s of action.sections || []) yp[s] = "complete";
      return { ...state, progress: action.progress, yamlProgress: yp };
    }
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "SET_DONE":
      return { ...state, phase: "done", isLoading: false };
    default:
      return state;
  }
}

const initialState: OnboardingState = {
  phase: "input",
  projectId: null,
  projectSlug: null,
  report: null,
  messages: [],
  yamlProgress: {},
  progress: 0,
  isLoading: false,
  error: null,
};

// ─── Component ──────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  existingProject?: Project;
}

export function OnboardingWizard({ existingProject }: OnboardingWizardProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    phase: existingProject?.onboarding_status === "wizard" ? "wizard"
      : existingProject?.onboarding_status === "complete" ? "done"
      : "input",
    projectId: existingProject?.id || null,
    projectSlug: existingProject?.slug || null,
  });
  const router = useRouter();
  const initialWizardSent = useRef(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  const callEdgeFunction = useCallback(
    async (name: string, body: Record<string, unknown>) => {
      const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Error ${res.status}`);
      }
      return res.json();
    },
    [supabaseUrl]
  );

  // ── Phase: Input ───────────────────────────────────────────

  const [inputName, setInputName] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [inputIg, setInputIg] = useState("");

  async function handleSubmitInput() {
    if (!inputName.trim()) return;
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      // Create project via server action (it redirects, but we catch it)
      const formData = new FormData();
      formData.set("name", inputName.trim());
      formData.set("website_url", inputUrl.trim());
      formData.set("instagram_handle", inputIg.trim());

      // We can't use the redirect-based action, so call data layer directly
      const { createProject } = await import("@/lib/data");
      const slug = inputName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const project = await createProject({
        name: inputName.trim(),
        slug,
        website_url: inputUrl.trim() || undefined,
        instagram_handle: inputIg.trim() || undefined,
        onboarding_status: "researching",
      } as Record<string, unknown> & { name: string; slug: string });

      dispatch({ type: "SET_PROJECT", id: project.id, slug: project.slug });
      handleStartResearch(project.id, inputUrl.trim(), inputIg.trim());
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: `Error: ${e instanceof Error ? e.message : e}` });
    }
  }

  // ── Phase: Research ────────────────────────────────────────

  async function handleStartResearch(projectId: string, url: string, ig: string) {
    dispatch({ type: "START_RESEARCH" });

    try {
      const data = await callEdgeFunction("brand-researcher", {
        project_id: projectId,
        website_url: url,
        instagram_handle: ig,
      });

      if (data.success && data.report) {
        dispatch({ type: "SET_REPORT", report: data.report });
      } else {
        dispatch({ type: "SET_ERROR", error: data.error || "Research failed" });
      }
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: `Error: ${e instanceof Error ? e.message : e}` });
    }
  }

  // ── Phase: Wizard (chat) ───────────────────────────────────

  useEffect(() => {
    if (state.phase === "wizard" && state.projectId && state.messages.length === 0 && !initialWizardSent.current) {
      initialWizardSent.current = true;
      sendToWizard([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.projectId]);

  async function sendToWizard(history: { role: string; text: string }[]) {
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const data = await callEdgeFunction("brand-wizard", {
        project_id: state.projectId,
        conversation_history: history,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.message || "",
        quick_responses: data.quick_responses || [],
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", message: assistantMsg });
      dispatch({
        type: "UPDATE_PROGRESS",
        progress: data.progress || 0,
        sections: data.section_complete || [],
      });

      if (data.ready) {
        dispatch({ type: "SET_DONE" });
      }
    } catch (e) {
      dispatch({ type: "SET_ERROR", error: `Error: ${e instanceof Error ? e.message : e}` });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  function handleUserMessage(text: string) {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    dispatch({ type: "ADD_MESSAGE", message: userMsg });

    const history = [...state.messages, userMsg].map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      text: m.content,
    }));
    sendToWizard(history);
  }

  const [userInput, setUserInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  // ── Render ─────────────────────────────────────────────────

  const phases: { key: OnboardingPhase; label: string; icon: React.ReactNode }[] = [
    { key: "input", label: "Datos", icon: <Globe className="h-4 w-4" /> },
    { key: "researching", label: "Research", icon: <Loader2 className="h-4 w-4" /> },
    { key: "report", label: "Reporte", icon: <Check className="h-4 w-4" /> },
    { key: "wizard", label: "Refinamiento", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "done", label: "Listo", icon: <Sparkles className="h-4 w-4" /> },
  ];

  const phaseIdx = phases.findIndex((p) => p.key === state.phase);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {phases.map((p, i) => (
          <div key={p.key} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              i < phaseIdx ? "bg-green-100 text-green-700"
                : i === phaseIdx ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-400"
            )}>
              {p.icon}
              {p.label}
            </div>
            {i < phases.length - 1 && (
              <div className={cn("h-px w-6", i < phaseIdx ? "bg-green-300" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      {state.error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Phase: Input */}
      {state.phase === "input" && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Crear Marca</h2>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa la URL de tu sitio web e Instagram. El sistema investigara tu marca automaticamente.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la marca *</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="La Cuenteria"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del sitio web *</label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://lacuenteria.cl"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (opcional)</label>
              <div className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={inputIg}
                  onChange={(e) => setInputIg(e.target.value)}
                  placeholder="@lacuenteria"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmitInput}
            disabled={!inputName.trim() || !inputUrl.trim() || state.isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {state.isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando proyecto...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Investigar marca</>
            )}
          </Button>
        </div>
      )}

      {/* Phase: Researching */}
      {state.phase === "researching" && (
        <div className="rounded-xl border border-purple-200 bg-white p-8 text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Investigando tu marca...</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Crawleando sitio web...</p>
            <p>Buscando redes sociales...</p>
            <p>Analizando con IA...</p>
          </div>
        </div>
      )}

      {/* Phase: Report */}
      {state.phase === "report" && state.report && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reporte de Research</h2>
            <p className="text-sm text-gray-600 mt-1">{state.report.summary}</p>
          </div>

          {/* Findings */}
          <div className="grid grid-cols-2 gap-3">
            {state.report.website && (
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Globe className="h-4 w-4" /> Web
                </div>
                <p className="text-xs text-gray-500 mt-1">{state.report.website.title}</p>
              </div>
            )}
            {state.report.instagram && (
              <div className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Instagram className="h-4 w-4" /> Instagram
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {state.report.instagram.followers.toLocaleString()} seguidores
                </p>
              </div>
            )}
          </div>

          {/* Confidence by section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-gray-400">Confianza por seccion</span>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(state.report.confidence).map(([key, level]) => (
                <div key={key} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5">
                  <span className="text-xs text-gray-600">{key.replace("_yaml", "")}</span>
                  <Badge className={cn(
                    "text-[10px]",
                    level === "high" ? "bg-green-100 text-green-700"
                      : level === "medium" ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  )}>
                    {level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => dispatch({ type: "ENTER_WIZARD" })}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Refinar con el asistente
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (state.projectId) {
                  updateOnboardingStatusAction(state.projectId, "complete");
                }
                dispatch({ type: "SET_DONE" });
              }}
            >
              Usar como esta
            </Button>
          </div>
        </div>
      )}

      {/* Phase: Wizard (chat) */}
      {state.phase === "wizard" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-purple-600 transition-all duration-500"
              style={{ width: `${state.progress * 100}%` }}
            />
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-3">
            {state.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "ml-auto bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {msg.content}
              </div>
            ))}

            {/* Quick responses */}
            {state.messages.length > 0 && !state.isLoading && (() => {
              const last = state.messages[state.messages.length - 1];
              if (last.role === "assistant" && last.quick_responses?.length) {
                return (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {last.quick_responses.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => handleUserMessage(qr)}
                        className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {state.isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Pensando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userInput.trim() && !state.isLoading) {
                  handleUserMessage(userInput.trim());
                  setUserInput("");
                }
              }}
              placeholder="Escribe tu respuesta..."
              disabled={state.isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
            />
            <Button
              size="sm"
              disabled={!userInput.trim() || state.isLoading}
              onClick={() => {
                handleUserMessage(userInput.trim());
                setUserInput("");
              }}
            >
              Enviar
            </Button>
          </div>
        </div>
      )}

      {/* Phase: Done */}
      {state.phase === "done" && (
        <div className="rounded-xl border border-green-200 bg-white p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Marca configurada</h2>
          <p className="text-sm text-gray-500">
            Tu perfil de marca esta listo. Ahora puedes crear campanas y generar contenido.
          </p>
          <Button
            onClick={() => router.push(`/projects/${state.projectSlug}`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Ir al proyecto
          </Button>
        </div>
      )}
    </div>
  );
}
