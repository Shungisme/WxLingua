import type { AxiosInstance } from "axios";
import type { Word, WordDetail, WordListParams } from "../lib/types";

export class WordsApi {
  constructor(private client: AxiosInstance) {}

  async list(params?: WordListParams): Promise<Word[]> {
    const response = await this.client.get<Word[]>("/words", { params });
    return response.data;
  }

  async getById(id: string): Promise<WordDetail> {
    const response = await this.client.get<WordDetail>(`/words/${id}`);
    return response.data;
  }
}
