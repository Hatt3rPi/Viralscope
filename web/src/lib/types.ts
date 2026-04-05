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
  created_at: string;
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
