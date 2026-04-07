export interface Project {
  id: string;
  name: string;
  slug: string;
  brand_yaml: Record<string, unknown>;
  voice_yaml: Record<string, unknown>;
  audiences_yaml: Record<string, unknown>;
  pillars_yaml: Record<string, unknown>;
  competitors_yaml: Record<string, unknown>;
  platforms_yaml: Record<string, unknown>;
  metrics_yaml: Record<string, unknown>;
  calendar_yaml: Record<string, unknown>;
  website_url?: string;
  instagram_handle?: string;
  onboarding_status: "pending" | "researching" | "wizard" | "complete";
  research_data: Record<string, unknown>;
  created_at: string;
}

// ─── Onboarding Types ───

export type OnboardingPhase = "input" | "researching" | "report" | "wizard" | "done";

export interface ResearchReport {
  website: {
    title: string;
    text: string;
    url: string;
    pages_fetched: number;
  } | null;
  instagram: {
    bio: string;
    followers: number;
    posts_count: number;
  } | null;
  social_links: Array<{ platform: string; url: string; handle: string }>;
  yamls_populated: string[];
  confidence: Record<string, "high" | "medium" | "low">;
  summary: string;
}

export interface Campaign {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  period_start: string;
  period_end: string;
  platform: string;
  objectives_json: Record<string, unknown>;
  created_at: string;
}

export type SlotStatus =
  | "draft"
  | "brief_review"
  | "generating"
  | "art_review"
  | "simulating"
  | "ready"
  | "published";

export type SlotStep =
  | "1-brief"
  | "2-content"
  | "3-art"
  | "4-simulation"
  | "5-approved";

export interface Slot {
  id: string;
  campaign_id: string;
  slot_number: number;
  date: string;
  format: string;
  pillar: string;
  objective: string;
  intention: string;
  topic: string;
  status: SlotStatus;
  current_step: SlotStep;
  simulation_md: string | null;
  created_at: string;
}

export interface Brief {
  id: string;
  slot_id: string;
  brief_yaml: Record<string, unknown>;
  version: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface Variante {
  id: string;
  slot_id: string;
  variant_label: "A" | "B" | "C";
  copy_md: string;
  art_direction_image_json: Record<string, unknown>;
  art_direction_video_json: Record<string, unknown>;
  image_url: string | null;
  video_url: string | null;
  video_prompt_json: Record<string, unknown> | null;
  simulation_score: number | null;
  simulation_detail_json: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

// ─── Wizard Types ───

export type WizardPhase = "config" | "chat" | "review" | "done";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  quick_responses?: string[];
  timestamp: number;
}

export interface ParrillaSlot {
  slot_number: number;
  date: string;
  format: string;
  pillar: string;
  objective: string;
  intention: string;
  topic: string;
  topic_angle: string;
  hook_direction: string;
  cta_direction: string;
  persona_target: string;
  reasoning: string;
  confidence: "alta" | "media" | "baja";
  tensions: string[];
  uncertainties: string[];
  date_reference: string | null;
}

export interface WizardConfig {
  name: string;
  period_start: string;
  period_end: string;
  platform: string;
}

// ─── Hook Funnel Types ───

export interface HookScores {
  hook_strength: number;
  emotional_resonance: number;
  cta_potential: number;
  value_promise: number;
  scroll_stop: number;
  brand_fit: number;
}

export interface Hook {
  id: number;
  text: string;
  tone: "emocional" | "educativo" | "directo";
  scores: HookScores;
  total: number;
  reasoning: string;
}

export interface Feedback {
  id: string;
  slot_id: string;
  variante_id: string | null;
  user_id: string;
  user_email?: string;
  step: "brief" | "content" | "art" | "simulation";
  comment: string;
  requested_changes_json: Record<string, unknown> | null;
  resolved: boolean;
  created_at: string;
}

// ─── Panel de Evaluacion Types ───

export interface PanelAgent {
  id: string;
  project_id: string;
  persona_name: string;
  persona_profile: Record<string, unknown>;
  history: Record<string, unknown>[];
  memory_enabled: boolean;
  created_at: string;
}

export interface VariantEvaluation {
  actions: {
    scroll_past: boolean;
    stop_look: boolean;
    read_caption: boolean;
    like: boolean;
    comment: boolean;
    share: boolean;
    save: boolean;
    follow: boolean;
  };
  scores: {
    hook_strength: number;
    emotional_resonance: number;
    message_clarity: number;
    cta_effectiveness: number;
    brand_fit: number;
    memorability: number;
  };
  qualitative: {
    attention_seconds: number;
    sentiment: string;
    best_thing: string;
    worst_thing: string;
    would_share_with: string;
    comment_if_any: string | null;
    would_buy?: boolean | string;
    would_repost_story?: boolean;
    would_enable_notifications?: boolean;
  };
}

export interface PanelVerdict {
  winner: string;
  composite_scores: Record<string, number>;
  confidence: "alta" | "media" | "baja";
  reasoning: string;
  risk_flags: string[];
  variant_recommendations: Record<string, { action: string; reason: string }>;
}

export interface PanelEvaluation {
  id: string;
  slot_id: string;
  intention: string;
  agent_results: Array<{
    agent_name: string;
    agent_id: string;
    evaluations: Record<string, VariantEvaluation>;
  }>;
  composite_scores: Record<string, number>;
  verdict: PanelVerdict;
  total_tokens_used: number | null;
  created_at: string;
}
