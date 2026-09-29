import {
  CategoriesResponse,
  Exam,
  PatternCategoriesResponse,
  PatternDetail,
  PatternListItem,
  PatternsListResponse,
  Provenance,
  Question,
  QuestionDetail,
  SimilarQuestion,
  TestSeriesSummary,
  TopicIntelligence,
  Year,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class APIError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getExams(): Promise<Exam[]> {
  return fetchJSON<Exam[]>(`${API_BASE}/exams`);
}

export function getYears(): Promise<Year[]> {
  return fetchJSON<Year[]>(`${API_BASE}/years`);
}

export interface QuestionFilters {
  exam_ids?: number[];
  years?: number[];
  search?: string;
  page?: number;
  page_size?: number;
}

export function getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
  const params = new URLSearchParams();
  filters.exam_ids?.forEach((id) => params.append("exam_ids", String(id)));
  filters.years?.forEach((y) => params.append("years", String(y)));
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const qs = params.toString();
  return fetchJSON<Question[]>(`${API_BASE}/questions${qs ? `?${qs}` : ""}`);
}

export function getQuestion(id: number): Promise<QuestionDetail> {
  return fetchJSON<QuestionDetail>(`${API_BASE}/questions/${id}`);
}

export function getSimilarQuestions(id: number): Promise<SimilarQuestion[]> {
  return fetchJSON<{ results: SimilarQuestion[] }>(`${API_BASE}/questions/${id}/similar`).then(
    (r) => r.results,
  );
}

export function getProvenance(id: number): Promise<Provenance> {
  return fetchJSON<Provenance>(`${API_BASE}/questions/${id}/provenance`);
}

export function getTopicIntelligence(query: string): Promise<TopicIntelligence> {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  const qs = params.toString();
  return fetchJSON<TopicIntelligence>(`${API_BASE}/topic-intelligence${qs ? `?${qs}` : ""}`);
}

export function getTestSeriesSummary(): Promise<TestSeriesSummary> {
  return fetchJSON<TestSeriesSummary>(`${API_BASE}/test-series/summary`);
}

export function getTestSeriesCategories(): Promise<CategoriesResponse> {
  return fetchJSON<CategoriesResponse>(`${API_BASE}/test-series/categories`);
}

// --- Pattern X-Ray ---

export function getPatternCategories(): Promise<PatternCategoriesResponse> {
  return fetchJSON<PatternCategoriesResponse>(`${API_BASE}/pattern-categories`);
}

export function getPatterns(
  categoryId?: number,
): Promise<PatternsListResponse> {
  const params = new URLSearchParams();
  if (categoryId !== undefined) params.set("category_id", String(categoryId));
  const qs = params.toString();
  return fetchJSON<PatternsListResponse>(
    `${API_BASE}/patterns${qs ? `?${qs}` : ""}`,
  );
}

export function getPattern(id: number): Promise<PatternDetail> {
  return fetchJSON<PatternDetail>(`${API_BASE}/patterns/${id}`);
}

export function startTest(testId: number): Promise<QuestionDetail[]> {
  return fetchJSON<QuestionDetail[]>(`${API_BASE}/tests/${testId}/start`, {
    method: "POST",
  });
}

// --- overload so POST works above ---
async function fetchJSON<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...options });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new APIError(res.status, (body as any).detail || `API error: ${res.status}`);
  }
  return res.json();
}
