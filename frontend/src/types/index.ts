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
