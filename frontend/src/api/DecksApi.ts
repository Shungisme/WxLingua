import type { AxiosInstance } from "axios";
import type {
  Deck,
  DeckDetail,
  DeckListParams,
  CreateDeckRequest,
  AddWordsToDeckRequest,
} from "../lib/types";

export class DecksApi {
  constructor(private client: AxiosInstance) {}

  async list(params?: DeckListParams): Promise<Deck[]> {
    const response = await this.client.get<Deck[]>("/decks", { params });
    return response.data;
  }

  async getById(id: string): Promise<DeckDetail> {
    const response = await this.client.get<DeckDetail>(`/decks/${id}/cards`);
    return response.data;
  }

  async create(data: CreateDeckRequest): Promise<Deck> {
    const response = await this.client.post<Deck>("/decks", data);
    return response.data;
  }

  async addWords(deckId: string, data: AddWordsToDeckRequest): Promise<void> {
    await this.client.post(`/decks/${deckId}/words`, data);
  }
}
