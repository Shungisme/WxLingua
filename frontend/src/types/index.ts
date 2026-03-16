export * from "./User";
export * from "./Word";
export * from "./Radical";
export * from "./Deck";
export * from "./Study";
export type { CardState, Rating, DailyReviewCount, ForecastDay } from "./Study";
export * from "./Dictionary";
export * from "./Social";

// Common Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
