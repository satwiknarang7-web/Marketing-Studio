// ============== Request Params ==============

export interface GenerateTextParams {
  template: string;
  prompt: string;
  tone: string;
  length: string;
  variations_count: number;
}

export interface GenerateImageParams {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  style: string;
}

export interface GenerateVideoParams {
  prompt: string;
  duration_seconds: number;
  style: string;
  image_data?: string;
  camera_movement?: string;
}

export interface VoiceoverGenerateParams {
  script: string;
  preset_id?: string;
  voice?: string;
  rate?: string;
  pitch?: string;
}

export interface VoiceoverAttachParams {
  video_url: string;
  audio_url: string;
  /** "pad" holds the last video frame so the whole script is heard */
  fit?: "pad" | "truncate";
}

export interface PhotoshootGenerateParams {
  mode: string;
  prompt: string;
  image_data?: string;
  aspect_ratio: string;
  count: number;
  engine?: "auto" | "higgsfield" | "huggingface";
}

// ============== API Responses ==============

export interface TextGenerateResponse {
  id: string;
  contents: string[];
  model_used: string;
  created_at: string;
}

export interface ImageGenerateResponse {
  id: string;
  images: string[]; // base64 data URIs
  model_used: string;
  created_at: string;
}

export interface VideoGenerateResponse {
  id: string;
  video_url: string;
  model_used: string;
  /** "ltx-video" = real AI diffusion, "keyframe-motion" = stills + camera move */
  engine_used: "ltx-video" | "keyframe-motion";
  created_at: string;
}

export interface PhotoshootGenerateResponse {
  id: string;
  images: string[];
  mode: string;
  enhanced_prompt: string;
  engine_used: string;
  created_at: string;
}

export interface VoicePreset {
  id: string;
  name: string;
  tone: string;
  voice: string;
}

export interface CatalogueVoice {
  voice: string;
  locale: string;
  gender: string;
  personalities: string[];
}

export interface VoiceoverGenerateResponse {
  audio_url: string;
  duration_seconds: number | null;
  voice_used: string;
  engine_used: string;
}

export interface VoiceoverAttachResponse {
  video_url: string;
  fit: string;
}

export interface StudioAsset {
  url: string;
  filename: string;
  source: "generated" | "upload";
  bytes: number;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface StudioClip {
  url: string;
  filename: string;
  source: string;
  bytes: number;
  created_at: string;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  has_audio: boolean;
}

export interface VideoStitchParams {
  video_urls: string[];
  transition?: "cut" | "crossfade";
  transition_duration?: number;
}

export interface VideoStitchResponse {
  video_url: string;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  clip_count: number;
  has_audio: boolean;
  source_duration: number;
}

export interface PhotoshootMode {
  id: string;
  name: string;
  description: string;
  aspect_ratio: string;
}

export interface HistoryItem {
  id: string;
  type: "text" | "image" | "video";
  prompt: string;
  result: Record<string, unknown>;
  model_used: string;
  template?: string;
  created_at: string;
}

export interface HistoryListResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface BrandKit {
  id?: string;
  company_name: string;
  brand_colors: string[];
  tone_guidelines?: string;
  default_hashtags?: string;
  logo_path?: string;
  updated_at?: string;
}
