import { apiClient } from "./client";
import { AuthApi } from "../api/AuthApi";
import { WordsApi } from "../api/WordsApi";
import { RadicalsApi } from "../api/RadicalsApi";
import { DecksApi } from "../api/DecksApi";
import { StudyApi } from "../api/StudyApi";
import { DictionaryApi } from "../api/DictionaryApi";

// Re-export the axios client for backward compatibility
export const api = apiClient;

// Create API instances
export const authApi = new AuthApi(apiClient);
export const wordsApi = new WordsApi(apiClient);
export const radicalsApi = new RadicalsApi(apiClient);
export const decksApi = new DecksApi(apiClient);
export const studyApi = new StudyApi(apiClient);
export const dictionaryApi = new DictionaryApi(apiClient);

// Re-export all types for backward compatibility
export type {
  // User types
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  // Word types
  Word,
  WordDetail,
  WordListParams,
  // Radical types
  Radical,
  RadicalListParams,
  // Deck types
  Deck,
  DeckDetail,
  DeckListParams,
  CreateDeckRequest,
  AddWordsToDeckRequest,
  // Study types
  StudyCard,
  StudyStats,
  StudySessionRequest,
  NextCardsParams,
  // Dictionary types
  DictionarySearchType,
  DictionarySearchParams,
  DictionaryWord,
  DictionarySearchResult,
} from "../types";
