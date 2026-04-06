"use client";

import { useReducer, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WizardSteps } from "./wizard-steps";
import { ConfigPhase } from "./config-phase";
import { ChatPhase } from "./chat-phase";
import { ReviewPhase } from "./review-phase";
import { DonePhase } from "./done-phase";
import { createCampaignWithParrillaAction } from "@/app/actions";
import type {
  Project,
  WizardPhase,
  WizardConfig,
  ChatMessage,
  ParrillaSlot,
} from "@/lib/types";

// ─── State ──────────────────────────────────────────────────────────────────

interface WizardState {
  phase: WizardPhase;
  config: WizardConfig | null;
  messages: ChatMessage[];
  collectedAnswers: Record<string, unknown> | null;
  isReady: boolean;
  parrilla: ParrillaSlot[];
  parrillaSummary: string;
  isLoading: boolean;
  error: string | null;
  campaignId: string | null;
}

type WizardAction =
  | { type: "SET_CONFIG"; config: WizardConfig }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "SET_READY"; collectedAnswers: Record<string, unknown> }
  | { type: "CLEAR_READY" }
  | {
      type: "SET_PARRILLA";
      parrilla: ParrillaSlot[];
      summary: string;
    }
  | { type: "UPDATE_SLOT"; index: number; slot: ParrillaSlot }
  | { type: "REMOVE_SLOT"; index: number }
  | { type: "BACK_TO_CHAT" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_DONE"; campaignId: string };

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_CONFIG":
      return { ...state, config: action.config, phase: "chat" };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
        error: null,
      };
    case "SET_READY":
      return {
        ...state,
        isReady: true,
        collectedAnswers: action.collectedAnswers,
      };
    case "CLEAR_READY":
      return { ...state, isReady: false };
    case "SET_PARRILLA":
      return {
        ...state,
        parrilla: action.parrilla,
        parrillaSummary: action.summary,
        phase: "review",
        isLoading: false,
      };
    case "UPDATE_SLOT":
      return {
        ...state,
        parrilla: state.parrilla.map((s, i) =>
          i === action.index ? action.slot : s
        ),
      };
    case "REMOVE_SLOT":
      return {
        ...state,
        parrilla: state.parrilla
          .filter((_, i) => i !== action.index)
          .map((s, i) => ({ ...s, slot_number: i + 1 })),
      };
    case "BACK_TO_CHAT":
      return { ...state, phase: "chat" };
    case "SET_LOADING":
      return { ...state, isLoading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, isLoading: false };
    case "SET_DONE":
      return {
        ...state,
        campaignId: action.campaignId,
        phase: "done",
        isLoading: false,
      };
    default:
      return state;
  }
}

const initialState: WizardState = {
  phase: "config",
  config: null,
  messages: [],
  collectedAnswers: null,
  isReady: false,
  parrilla: [],
  parrillaSummary: "",
  isLoading: false,
  error: null,
  campaignId: null,
};

// ─── Component ──────────────────────────────────────────────────────────────

interface CampaignWizardProps {
  project: Project;
  projectSlug: string;
}

export function CampaignWizard({ project, projectSlug }: CampaignWizardProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();
  const initialChatSent = useRef(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // ── Edge function caller ────────────────────────────────────────────────
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

  // ── Auto-send first message when entering chat phase ────────────────────
  useEffect(() => {
    if (
      state.phase === "chat" &&
      state.config &&
      state.messages.length === 0 &&
      !initialChatSent.current
    ) {
      initialChatSent.current = true;
      sendToEstrategaChat([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.config]);

  // ── Chat: send message to Estratega ─────────────────────────────────────
  async function sendToEstrategaChat(
    history: { role: "user" | "model"; text: string }[]
  ) {
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const data = await callEdgeFunction("estratega-chat", {
        project_id: project.id,
        campaign_config: state.config,
        conversation_history: history,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: data.message || "...",
        quick_responses: data.quick_responses || [],
        timestamp: Date.now(),
      };
      dispatch({ type: "ADD_MESSAGE", message: assistantMsg });

      if (data.ready && data.collected_answers) {
        dispatch({
          type: "SET_READY",
          collectedAnswers: data.collected_answers,
        });
      }
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: `Error del Estratega: ${err instanceof Error ? err.message : err}`,
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }

  function handleSendMessage(text: string) {
    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    dispatch({ type: "ADD_MESSAGE", message: userMsg });

    // Build conversation history for Gemini (map to model/user format)
    const allMessages = [...state.messages, userMsg];
    const history = allMessages.map((m) => ({
      role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
      text: m.content,
    }));

    sendToEstrategaChat(history);
  }

  // ── Generate Parrilla ───────────────────────────────────────────────────
  async function handleGenerateParrilla() {
    if (state.isLoading) return; // Prevent double-click
    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      const data = await callEdgeFunction("generate-parrilla", {
        project_id: project.id,
        campaign_config: state.config,
        collected_answers: state.collectedAnswers,
      });

      if (!data.parrilla || data.parrilla.length === 0) {
        throw new Error("El Estratega no genero ningún slot");
      }

      dispatch({
        type: "SET_PARRILLA",
        parrilla: data.parrilla as ParrillaSlot[],
        summary: data.summary || "",
      });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: `Error generando parrilla: ${err instanceof Error ? err.message : err}`,
      });
    }
  }

  // ── Approve & Create Campaign ───────────────────────────────────────────
  async function handleApprove() {
    if (!state.config || state.parrilla.length === 0 || state.isLoading) return;

    dispatch({ type: "SET_LOADING", loading: true });
    dispatch({ type: "SET_ERROR", error: null });

    try {
      const result = await createCampaignWithParrillaAction({
        project_id: project.id,
        project_slug: projectSlug,
        config: state.config,
        collected_answers: state.collectedAnswers || {},
        parrilla: state.parrilla,
      });

      dispatch({ type: "SET_DONE", campaignId: result.campaignId });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: `Error creando campana: ${err instanceof Error ? err.message : err}`,
      });
    }
  }

  // ── Render by phase ─────────────────────────────────────────────────────
  return (
    <div>
      <WizardSteps currentPhase={state.phase} />

      {state.phase === "config" && (
        <ConfigPhase
          onSubmit={(config) => dispatch({ type: "SET_CONFIG", config })}
        />
      )}

      {state.phase === "chat" && (
        <ChatPhase
          messages={state.messages}
          isLoading={state.isLoading}
          isReady={state.isReady}
          error={state.error}
          onSendMessage={handleSendMessage}
          onGenerateParrilla={handleGenerateParrilla}
          onContinueChat={() => dispatch({ type: "CLEAR_READY" })}
        />
      )}

      {state.phase === "review" && (
        <ReviewPhase
          summary={state.parrillaSummary}
          parrilla={state.parrilla}
          isLoading={state.isLoading}
          error={state.error}
          onUpdateSlot={(idx, slot) =>
            dispatch({ type: "UPDATE_SLOT", index: idx, slot })
          }
          onRemoveSlot={(idx) => dispatch({ type: "REMOVE_SLOT", index: idx })}
          onRegenerate={handleGenerateParrilla}
          onApprove={handleApprove}
          onBackToChat={() => dispatch({ type: "BACK_TO_CHAT" })}
        />
      )}

      {state.phase === "done" && state.config && state.campaignId && (
        <DonePhase
          campaignId={state.campaignId}
          projectSlug={projectSlug}
          campaignName={state.config.name}
          slotsCount={state.parrilla.length}
        />
      )}
    </div>
  );
}
