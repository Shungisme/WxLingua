import type { AxiosInstance } from "axios";
import type { Radical, RadicalListParams } from "../lib/types";

export class RadicalsApi {
  constructor(private client: AxiosInstance) {}

  async list(params?: RadicalListParams): Promise<Radical[]> {
    const response = await this.client.get<Radical[]>("/radicals", { params });
    return response.data;
  }

  async getById(id: string): Promise<Radical> {
    const response = await this.client.get<Radical>(`/radicals/${id}`);
    return response.data;
  }
}
