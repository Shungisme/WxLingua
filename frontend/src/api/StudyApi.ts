import type { AxiosInstance } from "axios";
import type {
  StudyCard,
  StudyStats,
  StudySessionRequest,
  NextCardsParams,
  DailyReviewCount,
  ForecastDay,
} from "@/types";

export class StudyApi {
  constructor(private client: AxiosInstance) {}

  async nextCards(params?: NextCardsParams): Promise<StudyCard[]> {
    const response = await this.client.get<StudyCard[]>("/study/next", {
      params,
    });
    return response.data;
  }

  async logSession(data: StudySessionRequest): Promise<void> {
    await this.client.post("/study/session", data);
  }

  async undo(): Promise<void> {
    await this.client.post("/study/undo");
  }

  async stats(): Promise<StudyStats> {
    const response = await this.client.get<StudyStats>("/study/stats");
    return response.data;
  }

  async dailyStats(days?: number): Promise<DailyReviewCount[]> {
    const response = await this.client.get<DailyReviewCount[]>(
      "/study/daily-stats",
      {
        params: { days },
      },
    );
    return response.data;
  }

  async forecast(days?: number): Promise<ForecastDay[]> {
    const response = await this.client.get<ForecastDay[]>("/study/forecast", {
      params: { days },
    });
    return response.data;
  }

  async previewIntervals(
    wordId: string,
  ): Promise<Record<string, { days: number; label: string }>> {
    const response = await this.client.get("/study/preview-intervals", {
      params: { wordId },
    });
    return response.data;
  }
}
