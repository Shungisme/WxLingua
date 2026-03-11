import { Radical, RadicalListParams } from "@/types";
import type { AxiosInstance } from "axios";

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
