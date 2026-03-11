import {
  AddWordsToDeckRequest,
  CreateDeckRequest,
  Deck,
  DeckCard,
  DeckDetail,
  DeckListParams,
} from "@/types";
import type { AxiosInstance } from "axios";

export interface BulkImportResult {
  added: number;
  notFound: string[];
}

export interface BulkFileImportResult {
  added: number;
  skipped: number;
  total: number;
}

export interface UpdateDeckCardRequest {
  term?: string;
  meaning?: Record<string, string>;
  pronunciation?: string;
  imageUrl?: string;
  audioUrl?: string;
  notes?: string;
}

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

  async updateCard(
    deckId: string,
    cardId: string,
    data: UpdateDeckCardRequest,
  ): Promise<DeckCard> {
    const response = await this.client.patch<DeckCard>(
      `/decks/${deckId}/cards/${cardId}`,
      data,
    );
    return response.data;
  }

  async removeCard(deckId: string, cardId: string): Promise<void> {
    await this.client.delete(`/decks/${deckId}/cards/${cardId}`);
  }

  async bulkImportByText(
    deckId: string,
    texts: string[],
  ): Promise<BulkImportResult> {
    const response = await this.client.post<BulkImportResult>(
      `/decks/${deckId}/words/bulk-import`,
      { texts },
    );
    return response.data;
  }

  async bulkImportFromFile(
    deckId: string,
    file: File,
  ): Promise<BulkFileImportResult> {
    const form = new FormData();
    form.append("file", file);
    const response = await this.client.post<BulkFileImportResult>(
      `/decks/${deckId}/bulk-import/file`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  }
}
