import type { AxiosInstance } from "axios";
import type {
  StudyCard,
  StudyStats,
  StudySessionRequest,
  NextCardsParams,
} from "../lib/types";

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

  async stats(): Promise<StudyStats> {
    const response = await this.client.get<StudyStats>("/study/stats");
    return response.data;
  }
}
