export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_supporter?: boolean;
}

export interface Report {
  id: string;
  user_id: string;
  game: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  resolution: string;
  preset: string;
  tweaks: string;
  fps_avg: number;
  fps_1low: number;
  stability_note: string;
  images?: string[];
  created_at: string;
  likes: number;
  profile?: Profile;
}

export interface HardwareConfig {
  cpu: string;
  gpu: string;
  ram_gb: number;
}