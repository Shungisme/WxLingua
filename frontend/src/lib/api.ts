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
