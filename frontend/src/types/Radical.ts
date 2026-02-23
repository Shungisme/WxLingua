export interface Radical {
  id: string;
  char: string;
  variant: string;
  strokeCount: number;
  meaning: Record<string, string>;
  imageUrl?: string;
  frequency: number;
  createdAt: string;
}

export interface RadicalListParams {
  limit?: number;
}
