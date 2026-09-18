import type {
  GenerateTextParams,
  GenerateImageParams,
  GenerateVideoParams,
  PhotoshootGenerateParams,
  VoiceoverGenerateParams,
  VoiceoverGenerateResponse,
  VoiceoverAttachParams,
  VoiceoverAttachResponse,
  VoicePreset,
  CatalogueVoice,
  PhotoshootGenerateResponse,
  PhotoshootMode,
  TextGenerateResponse,
  ImageGenerateResponse,
  VideoGenerateResponse,
  HistoryListResponse,
  BrandKit,
} from "@/types";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = "API request failed";
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Generation
  generateText: (params: GenerateTextParams) =>
    fetchApi<TextGenerateResponse>("/text/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  generateImage: (params: GenerateImageParams) =>
    fetchApi<ImageGenerateResponse>("/image/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  generateVideo: (params: GenerateVideoParams) =>
    fetchApi<VideoGenerateResponse>("/video/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Higgsfield Product Photoshoot
  getPhotoshootModes: () =>
    fetchApi<PhotoshootMode[]>("/photoshoot/modes", { method: "GET" }),

  generatePhotoshoot: (params: PhotoshootGenerateParams) =>
    fetchApi<PhotoshootGenerateResponse>("/photoshoot/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // Voiceover
  getVoicePresets: () => fetchApi<VoicePreset[]>("/audio/presets", { method: "GET" }),

  getVoiceCatalogue: (locale = "en-") =>
    fetchApi<CatalogueVoice[]>(`/audio/voices?locale=${encodeURIComponent(locale)}`, {
      method: "GET",
    }),

  generateVoiceover: (params: VoiceoverGenerateParams) =>
    fetchApi<VoiceoverGenerateResponse>("/audio/tts", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  attachVoiceover: (params: VoiceoverAttachParams) =>
    fetchApi<VoiceoverAttachResponse>("/audio/attach", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  // History
  getHistory: (params?: { type?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set("type", params.type);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const qs = searchParams.toString();
    return fetchApi<HistoryListResponse>(`/history${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  deleteHistory: (id: string) =>
    fetchApi<{ status: string; message: string }>(`/history/${id}`, { method: "DELETE" }),

  // Brand Kit
  getBrandKit: () => fetchApi<BrandKit>("/brand-kit", { method: "GET" }),

  updateBrandKit: (data: Omit<BrandKit, "id" | "updated_at">) =>
    fetchApi<BrandKit>("/brand-kit", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
