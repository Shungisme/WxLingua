import type { AxiosInstance } from "axios";
import type {
  DictionarySearchParams,
  DictionaryWord,
  DictionarySearchResult,
} from "../types/Dictionary";

export class DictionaryApi {
  constructor(private client: AxiosInstance) {}

  /**
   * Search dictionary by character, pinyin, meaning, or all
   */
  async search(
    params: DictionarySearchParams,
  ): Promise<DictionarySearchResult> {
    const response = await this.client.get<DictionarySearchResult>(
      "/dictionary/search",
      {
        params: {
          q: params.q,
          type: params.type || "all",
          limit: params.limit || 20,
        },
      },
    );
    console.log("Dictionary search response:", response.data);
    return response.data;
  }

  /**
   * Get a specific word by ID
   */
  async getWordById(id: string): Promise<DictionaryWord> {
    const response = await this.client.get<DictionaryWord>(
      `/dictionary/word/${id}`,
    );
    return response.data;
  }
}
