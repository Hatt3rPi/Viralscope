-- ViralScope: Templates, Brand Assets & Visual Specs
-- Run after 003_onboarding.sql

-- ═══════════════════════════════════════════════════════════════════
-- 1. content_templates — system-wide generic templates
-- ═══════════════════════════════════════════════════════════════════

create table content_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  format text not null check (format in ('carrusel','reel','story','static','video')),
  tone text not null check (tone in ('emocional','educativo','directo')),
  structure_json jsonb not null default '{}',
  composition_rules jsonb not null default '{}',
  prompt_injection text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════
-- 2. project_templates — junction: project ↔ templates
-- ═══════════════════════════════════════════════════════════════════

create table project_templates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  template_id uuid not null references content_templates(id) on delete cascade,
  pillar_affinity text[],
  is_default boolean not null default false,
  overrides_json jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (project_id, template_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- 3. brand_assets — per-project brand components
-- ═══════════════════════════════════════════════════════════════════

create table brand_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  asset_type text not null check (asset_type in ('logo','background','texture','icon','font','photo','pattern','other')),
  name text not null,
  description text,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  metadata_json jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_brand_assets_project on brand_assets(project_id);

-- ═══════════════════════════════════════════════════════════════════
-- 4. visual_specs — per-project visual identity rules
-- ═══════════════════════════════════════════════════════════════════

create table visual_specs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  spec_key text not null,
  spec_value jsonb not null default '{}',
  asset_references uuid[] not null default '{}',
  prompt_text text not null default '',
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (project_id, spec_key)
);

create index idx_visual_specs_project on visual_specs(project_id);

-- ═══════════════════════════════════════════════════════════════════
-- 5. Trigger: clean asset references when brand_asset deleted
-- ═══════════════════════════════════════════════════════════════════

create or replace function clean_asset_references()
returns trigger as $$
begin
  update visual_specs
  set asset_references = array_remove(asset_references, OLD.id)
  where OLD.id = any(asset_references);
  return OLD;
end;
$$ language plpgsql;

create trigger trg_clean_asset_refs
  before delete on brand_assets
  for each row execute function clean_asset_references();

-- ═══════════════════════════════════════════════════════════════════
-- 6. RLS policies
-- ═══════════════════════════════════════════════════════════════════

alter table content_templates enable row level security;
alter table project_templates enable row level security;
alter table brand_assets enable row level security;
alter table visual_specs enable row level security;

-- content_templates: full CRUD for authenticated
create policy "Authenticated users can read content_templates"
  on content_templates for select to authenticated using (true);
create policy "Authenticated users can insert content_templates"
  on content_templates for insert to authenticated with check (true);
create policy "Authenticated users can update content_templates"
  on content_templates for update to authenticated using (true);
create policy "Authenticated users can delete content_templates"
  on content_templates for delete to authenticated using (true);

-- project_templates: full CRUD
create policy "Authenticated users can read project_templates"
  on project_templates for select to authenticated using (true);
create policy "Authenticated users can insert project_templates"
  on project_templates for insert to authenticated with check (true);
create policy "Authenticated users can update project_templates"
  on project_templates for update to authenticated using (true);
create policy "Authenticated users can delete project_templates"
  on project_templates for delete to authenticated using (true);

-- brand_assets: full CRUD
create policy "Authenticated users can read brand_assets"
  on brand_assets for select to authenticated using (true);
create policy "Authenticated users can insert brand_assets"
  on brand_assets for insert to authenticated with check (true);
create policy "Authenticated users can update brand_assets"
  on brand_assets for update to authenticated using (true);
create policy "Authenticated users can delete brand_assets"
  on brand_assets for delete to authenticated using (true);

-- visual_specs: full CRUD
create policy "Authenticated users can read visual_specs"
  on visual_specs for select to authenticated using (true);
create policy "Authenticated users can insert visual_specs"
  on visual_specs for insert to authenticated with check (true);
create policy "Authenticated users can update visual_specs"
  on visual_specs for update to authenticated using (true);
create policy "Authenticated users can delete visual_specs"
  on visual_specs for delete to authenticated using (true);

-- ═══════════════════════════════════════════════════════════════════
-- 7. Seed: default content templates (15 = 5 formats × 3 tones)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO content_templates (slug, name, format, tone, structure_json, composition_rules, prompt_injection) VALUES

-- ── CARRUSEL ──────────────────────────────────────────────────────

('carrusel-emocional', 'Carrusel Emocional', 'carrusel', 'emocional',
  '{
    "slide_count_range": {"min": 5, "max": 10},
    "slides": [
      {"position": "cover", "has_title": true, "has_subtitle": true, "has_background_image": true, "text_style": "emotional_hook"},
      {"position": "interior", "repeatable": true, "max_words": 25, "style": "storytelling_progression", "has_visual": true},
      {"position": "closing", "has_logo": true, "has_cta": true, "logo_position": "center"}
    ],
    "text_distribution": "front_loaded",
    "visual_flow": "progressive_emotional_arc"
  }',
  '{
    "font_sizes": {"title": 48, "subtitle": 28, "body": 18, "cta": 22},
    "text_placement": {"title_zone": "center", "body_zone": "lower_two_thirds"},
    "logo_rules": {"position": "center", "on_slides": ["closing"], "size": "medium"},
    "color_usage": {"cover_bg": "warm_gradient", "interior_bg": "soft_brand_tones", "accent": "cta_only"},
    "image_treatment": "warm_editorial_with_grain"
  }',
  'TEMPLATE: Carrusel Emocional. Portada con hook emocional grande centrado sobre imagen cálida de fondo con overlay suave. Slides interiores: un punto narrativo por slide, máximo 25 palabras, progresión de historia emotiva, imágenes editoriales cálidas. Slide final: logo centrado + CTA emocional, fondo con tono de marca suave. Estilo visual: editorial cálido tipo Kinfolk, grano fotográfico sutil, iluminación natural lateral.'
),

('carrusel-educativo', 'Carrusel Educativo', 'carrusel', 'educativo',
  '{
    "slide_count_range": {"min": 5, "max": 10},
    "slides": [
      {"position": "cover", "has_title": true, "has_data_hook": true, "has_background_image": true, "text_style": "data_driven_hook"},
      {"position": "interior", "repeatable": true, "max_words": 30, "style": "data_point_with_visual", "has_visual": true, "has_icon_or_number": true},
      {"position": "closing", "has_logo": true, "has_cta": true, "has_summary": true, "logo_position": "bottom_right"}
    ],
    "text_distribution": "balanced",
    "visual_flow": "structured_information_hierarchy"
  }',
  '{
    "font_sizes": {"title": 44, "subtitle": 24, "body": 18, "data_highlight": 56, "cta": 20},
    "text_placement": {"title_zone": "upper_third", "data_zone": "center", "body_zone": "lower_half"},
    "logo_rules": {"position": "bottom_right", "on_slides": ["closing"], "size": "small"},
    "color_usage": {"cover_bg": "brand_primary_dark", "interior_bg": "neutral_light", "accent": "data_highlights_and_icons"},
    "image_treatment": "clean_professional_with_subtle_texture"
  }',
  'TEMPLATE: Carrusel Educativo. Portada con dato impactante o pregunta provocadora sobre fondo de color de marca oscuro. Slides interiores: un dato/tip por slide, máximo 30 palabras, incluir número o ícono destacado, fondo neutral claro, jerarquía visual clara. Slide final: resumen de 1 línea + CTA informativo + logo pequeño abajo a la derecha. Estilo visual: limpio, profesional, tipografía clara, textura sutil de papel.'
),

('carrusel-directo', 'Carrusel Directo', 'carrusel', 'directo',
  '{
    "slide_count_range": {"min": 5, "max": 8},
    "slides": [
      {"position": "cover", "has_title": true, "has_urgency_element": true, "has_background_image": true, "text_style": "bold_cta_hook"},
      {"position": "interior", "repeatable": true, "max_words": 20, "style": "benefit_focused", "has_visual": true},
      {"position": "closing", "has_logo": true, "has_cta": true, "has_offer_summary": true, "logo_position": "bottom_right"}
    ],
    "text_distribution": "cta_heavy",
    "visual_flow": "benefit_escalation"
  }',
  '{
    "font_sizes": {"title": 52, "subtitle": 24, "body": 18, "cta": 26},
    "text_placement": {"title_zone": "center", "cta_zone": "lower_third"},
    "logo_rules": {"position": "bottom_right", "on_slides": ["cover", "closing"], "size": "small"},
    "color_usage": {"cover_bg": "high_contrast_brand", "interior_bg": "alternating_brand_neutral", "accent": "cta_buttons_urgency"},
    "image_treatment": "bold_high_contrast_product_focus"
  }',
  'TEMPLATE: Carrusel Directo. Portada con hook de urgencia/FOMO en tipografía bold grande sobre fondo de alto contraste. Slides interiores: un beneficio claro por slide, máximo 20 palabras, orientado a conversión, imágenes de producto/resultado. Slide final: oferta resumida + CTA prominente con color de acento + logo. Estilo visual: bold, alto contraste, colores de marca saturados, sin ambigüedad.'
),

-- ── REEL ──────────────────────────────────────────────────────────

('reel-emocional', 'Reel Emocional', 'reel', 'emocional',
  '{
    "duration_seconds": 30,
    "scenes": [
      {"position": "hook", "duration": "0-3s", "style": "emotional_visual_hook", "has_text_overlay": true},
      {"position": "context", "duration": "3-12s", "style": "personal_story_setup"},
      {"position": "value", "duration": "12-25s", "style": "emotional_payoff_with_insight"},
      {"position": "cta", "duration": "25-30s", "style": "warm_invitation", "has_logo": true}
    ],
    "pacing": "slow_build_to_emotional_peak"
  }',
  '{
    "text_overlay": {"max_words": 8, "zone": "center", "font_weight": "bold"},
    "logo_rules": {"position": "bottom_right", "on_scenes": ["cta"], "size": "small"},
    "color_usage": {"overlay_tint": "warm_brand_30_opacity"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Reel Emocional. Hook visual emotivo en primeros 3 segundos con texto overlay breve (máx 8 palabras). Desarrollo narrativo personal (3-12s). Payoff emocional con insight de valor (12-25s). Cierre con invitación cálida + logo (25-30s). Estilo: cinematográfico íntimo, iluminación natural, movimientos de cámara suaves, grano de película analógica.'
),

('reel-educativo', 'Reel Educativo', 'reel', 'educativo',
  '{
    "duration_seconds": 30,
    "scenes": [
      {"position": "hook", "duration": "0-3s", "style": "surprising_data_hook", "has_text_overlay": true},
      {"position": "context", "duration": "3-10s", "style": "problem_or_myth_setup"},
      {"position": "value", "duration": "10-25s", "style": "step_by_step_or_explanation"},
      {"position": "cta", "duration": "25-30s", "style": "authority_cta", "has_logo": true}
    ],
    "pacing": "structured_information_delivery"
  }',
  '{
    "text_overlay": {"max_words": 10, "zone": "upper_third", "font_weight": "bold"},
    "logo_rules": {"position": "bottom_right", "on_scenes": ["cta"], "size": "small"},
    "color_usage": {"overlay_tint": "neutral_dark_60_opacity"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Reel Educativo. Hook con dato sorprendente o pregunta en primeros 3 segundos (texto overlay, máx 10 palabras). Contexto del problema o mito (3-10s). Explicación paso a paso o revelación de datos (10-25s). CTA de autoridad + logo (25-30s). Estilo: profesional y claro, tipografía legible, fondo limpio, ritmo informativo.'
),

('reel-directo', 'Reel Directo', 'reel', 'directo',
  '{
    "duration_seconds": 25,
    "scenes": [
      {"position": "hook", "duration": "0-3s", "style": "urgency_fomo_hook", "has_text_overlay": true},
      {"position": "benefit", "duration": "3-10s", "style": "rapid_benefit_showcase"},
      {"position": "proof", "duration": "10-18s", "style": "social_proof_or_demo"},
      {"position": "cta", "duration": "18-25s", "style": "aggressive_cta", "has_logo": true}
    ],
    "pacing": "fast_cuts_urgency"
  }',
  '{
    "text_overlay": {"max_words": 6, "zone": "center", "font_weight": "extra_bold"},
    "logo_rules": {"position": "bottom_right", "on_scenes": ["hook", "cta"], "size": "small"},
    "color_usage": {"overlay_tint": "brand_accent_bold"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Reel Directo. Hook de urgencia/FOMO en primeros 3 segundos (texto bold, máx 6 palabras). Beneficios rápidos (3-10s). Prueba social o demo (10-18s). CTA agresivo + logo (18-25s). Estilo: cortes rápidos, alto contraste, colores saturados, ritmo acelerado, enfoque en producto/resultado.'
),

-- ── STORY ─────────────────────────────────────────────────────────

('story-emocional', 'Story Emocional', 'story', 'emocional',
  '{
    "format": "single_frame_or_sequence",
    "has_text_overlay": true,
    "text_style": "intimate_question_or_reflection",
    "has_interactive": true,
    "interactive_type": "poll_or_emoji_slider"
  }',
  '{
    "text_overlay": {"max_words": 15, "zone": "center", "font_weight": "medium"},
    "logo_rules": {"position": "none"},
    "color_usage": {"background": "warm_brand_gradient"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Story Emocional. Frame único o secuencia corta. Texto overlay íntimo (pregunta o reflexión, máx 15 palabras) centrado. Elemento interactivo (encuesta o slider de emoji). Fondo: gradiente cálido con colores de marca. Sin logo. Estilo: cercano, auténtico, como si hablara un amigo.'
),

('story-educativo', 'Story Educativo', 'story', 'educativo',
  '{
    "format": "single_frame_or_sequence",
    "has_text_overlay": true,
    "text_style": "quick_tip_or_fact",
    "has_interactive": true,
    "interactive_type": "quiz_or_poll"
  }',
  '{
    "text_overlay": {"max_words": 20, "zone": "center", "font_weight": "bold"},
    "logo_rules": {"position": "none"},
    "color_usage": {"background": "neutral_with_accent"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Story Educativo. Frame con tip rápido o dato curioso. Texto overlay informativo (máx 20 palabras) en tipografía bold. Elemento interactivo (quiz o encuesta de conocimiento). Fondo neutral con acento de marca. Sin logo. Estilo: claro, didáctico, fácil de consumir en 5 segundos.'
),

('story-directo', 'Story Directo', 'story', 'directo',
  '{
    "format": "single_frame",
    "has_text_overlay": true,
    "text_style": "offer_or_urgency",
    "has_interactive": true,
    "interactive_type": "link_or_swipe_up",
    "has_countdown": true
  }',
  '{
    "text_overlay": {"max_words": 10, "zone": "center", "font_weight": "extra_bold"},
    "logo_rules": {"position": "top_left", "size": "small"},
    "color_usage": {"background": "high_contrast_brand_accent"},
    "aspect_ratio": "9:16"
  }',
  'TEMPLATE: Story Directo. Frame único con oferta o urgencia. Texto overlay bold (máx 10 palabras) centrado. Countdown o sticker de link. Logo pequeño arriba a la izquierda. Fondo de alto contraste con color acento de marca. Estilo: impactante, directo, sin distracción, orientado 100% a conversión.'
),

-- ── STATIC ────────────────────────────────────────────────────────

('static-emocional', 'Post Estático Emocional', 'static', 'emocional',
  '{
    "format": "single_image",
    "caption_versions": ["short", "medium", "long"],
    "caption_words": {"short": 50, "medium": 120, "long": 250},
    "image_style": "emotional_editorial"
  }',
  '{
    "text_overlay": {"on_image": false, "caption_only": true},
    "logo_rules": {"position": "none_in_image"},
    "color_usage": {"image_tone": "warm_brand_palette"},
    "aspect_ratio": "1:1"
  }',
  'TEMPLATE: Post Estático Emocional. Imagen cuadrada editorial emotiva sin texto overlay (todo va en caption). Caption en 3 versiones (corto ~50 palabras, medio ~120, largo ~250). Estilo de imagen: editorial cálido, iluminación natural, grano sutil, conexión humana. El caption cuenta una historia y conecta emocionalmente.'
),

('static-educativo', 'Post Estático Educativo', 'static', 'educativo',
  '{
    "format": "single_image",
    "caption_versions": ["short", "medium", "long"],
    "caption_words": {"short": 50, "medium": 120, "long": 250},
    "image_style": "informative_clean"
  }',
  '{
    "text_overlay": {"on_image": true, "max_words": 8, "purpose": "key_data_point"},
    "logo_rules": {"position": "bottom_right_subtle"},
    "color_usage": {"image_tone": "neutral_professional"},
    "aspect_ratio": "1:1"
  }',
  'TEMPLATE: Post Estático Educativo. Imagen cuadrada con dato clave overlay (máx 8 palabras). Logo sutil abajo a la derecha. Caption en 3 versiones. Estilo de imagen: profesional, limpio, fondo neutro, tipografía clara. El caption aporta contexto educativo, datos y tips prácticos.'
),

('static-directo', 'Post Estático Directo', 'static', 'directo',
  '{
    "format": "single_image",
    "caption_versions": ["short", "medium"],
    "caption_words": {"short": 50, "medium": 120},
    "image_style": "product_focused_bold"
  }',
  '{
    "text_overlay": {"on_image": true, "max_words": 6, "purpose": "offer_or_cta"},
    "logo_rules": {"position": "top_left", "size": "small"},
    "color_usage": {"image_tone": "high_contrast_brand"},
    "aspect_ratio": "1:1"
  }',
  'TEMPLATE: Post Estático Directo. Imagen cuadrada enfocada en producto/resultado con CTA overlay bold (máx 6 palabras). Logo pequeño arriba a la izquierda. Caption corto y medio solamente (orientado a conversión). Estilo: alto contraste, colores de marca saturados, producto/beneficio como protagonista.'
),

-- ── VIDEO ─────────────────────────────────────────────────────────

('video-emocional', 'Video Emocional', 'video', 'emocional',
  '{
    "duration_seconds": 45,
    "scenes": [
      {"position": "hook", "duration": "0-5s", "style": "cinematic_emotional_open"},
      {"position": "narrative", "duration": "5-30s", "style": "story_arc_with_tension"},
      {"position": "resolution", "duration": "30-40s", "style": "emotional_payoff"},
      {"position": "cta", "duration": "40-45s", "style": "brand_reveal_warm", "has_logo": true}
    ],
    "pacing": "cinematic_slow_build"
  }',
  '{
    "logo_rules": {"position": "end_card", "on_scenes": ["cta"], "size": "large"},
    "color_usage": {"grading": "warm_cinematic"},
    "aspect_ratio": "16:9"
  }',
  'TEMPLATE: Video Emocional. Apertura cinematográfica emotiva (0-5s). Arco narrativo con tensión (5-30s). Resolución emocional (30-40s). Reveal de marca cálido + logo grande (40-45s). Estilo: cinematográfico, color grading cálido, ritmo pausado, iluminación natural, música emotiva.'
),

('video-educativo', 'Video Educativo', 'video', 'educativo',
  '{
    "duration_seconds": 45,
    "scenes": [
      {"position": "hook", "duration": "0-5s", "style": "question_or_myth_buster"},
      {"position": "explanation", "duration": "5-35s", "style": "structured_teaching"},
      {"position": "cta", "duration": "35-45s", "style": "authority_close", "has_logo": true}
    ],
    "pacing": "clear_structured_delivery"
  }',
  '{
    "logo_rules": {"position": "end_card", "on_scenes": ["cta"], "size": "medium"},
    "color_usage": {"grading": "neutral_professional"},
    "aspect_ratio": "16:9"
  }',
  'TEMPLATE: Video Educativo. Apertura con pregunta o mito a destruir (0-5s). Enseñanza estructurada con apoyo visual (5-35s). Cierre de autoridad + logo (35-45s). Estilo: profesional, claro, gráficos de apoyo, tipografía legible, ritmo informativo constante.'
),

('video-directo', 'Video Directo', 'video', 'directo',
  '{
    "duration_seconds": 30,
    "scenes": [
      {"position": "hook", "duration": "0-3s", "style": "bold_offer_reveal"},
      {"position": "benefits", "duration": "3-15s", "style": "rapid_feature_demo"},
      {"position": "proof", "duration": "15-22s", "style": "testimonial_or_results"},
      {"position": "cta", "duration": "22-30s", "style": "hard_sell_close", "has_logo": true}
    ],
    "pacing": "fast_commercial"
  }',
  '{
    "logo_rules": {"position": "persistent_watermark", "on_scenes": ["all"], "size": "small"},
    "color_usage": {"grading": "bold_saturated_brand"},
    "aspect_ratio": "16:9"
  }',
  'TEMPLATE: Video Directo. Reveal de oferta bold (0-3s). Demo rápida de beneficios (3-15s). Testimonial o resultados (15-22s). Cierre de venta duro + logo (22-30s). Estilo: comercial de alto impacto, cortes rápidos, colores saturados de marca, logo como watermark persistente.'
)

ON CONFLICT (slug) DO NOTHING;
