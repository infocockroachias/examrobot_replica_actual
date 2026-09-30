import {
  CategoriesResponse,
  Exam,
  EventsResponse,
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
  WorldEvent,
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
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Generic helpers for admin (non-GET, 204-aware)
// ---------------------------------------------------------------------------

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  return fetchJSON<T>(`${API_BASE}/admin${path}`, options);
}

// --- Admin: stats + exams/papers ---

export interface AdminStats {
  exams: number;
  papers: number;
  questions: number;
  questions_with_provenance: number;
  topic_intelligence_cache: number;
  test_categories: number;
  tests: number;
  pattern_categories: number;
  patterns: number;
  patterns_with_brief: number;
}

export function getAdminStats(): Promise<AdminStats> {
  return adminFetch<AdminStats>("/stats");
}

export interface AdminExam {
  id: number;
  name: string;
  paper_count: number;
  question_count: number;
  papers: { id: number; year: number; question_count: number }[];
}

export function getAdminExams(): Promise<AdminExam[]> {
  return adminFetch<AdminExam[]>("/exams");
}

export function createExam(name: string): Promise<{ id: number; name: string }> {
  return adminFetch("/exams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export interface AdminPaper {
  id: number;
  exam_id: number;
  exam_name: string;
  year: number;
  question_count: number;
}

export function getAdminPapers(): Promise<AdminPaper[]> {
  return adminFetch<AdminPaper[]>("/papers");
}

export function createPaper(exam_id: number, year: number): Promise<AdminPaper> {
  return adminFetch("/papers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exam_id, year }),
  });
}

// --- Admin: questions ---

export interface AdminOption {
  id?: number;
  label: string;
  option_text: string;
  is_correct: boolean;
}

export interface AdminQuestion {
  id: number;
  paper_id: number;
  exam_name: string | null;
  year: number | null;
  question_number: number;
  question_text: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  is_mock_data: boolean;
  options: AdminOption[];
}

export interface AdminQuestionPage {
  total: number;
  page: number;
  page_size: number;
  questions: AdminQuestion[];
}

export interface AdminQuestionInput {
  paper_id: number;
  question_number: number;
  question_text: string;
  subject?: string;
  topic?: string;
  subtopic?: string | null;
  options: { label: string; text: string; is_correct: boolean }[];
}

export function getAdminQuestions(params: {
  search?: string;
  subject?: string;
  topic?: string;
  exam_id?: number;
  year?: number;
  page?: number;
  page_size?: number;
}): Promise<AdminQuestionPage> {
  const p = new URLSearchParams();
  if (params.search) p.set("search", params.search);
  if (params.subject) p.set("subject", params.subject);
  if (params.topic) p.set("topic", params.topic);
  if (params.exam_id !== undefined) p.set("exam_id", String(params.exam_id));
  if (params.year !== undefined) p.set("year", String(params.year));
  if (params.page) p.set("page", String(params.page));
  if (params.page_size) p.set("page_size", String(params.page_size));
  const qs = p.toString();
  return adminFetch<AdminQuestionPage>(`/questions${qs ? `?${qs}` : ""}`);
}

export function getAdminQuestion(id: number): Promise<AdminQuestion> {
  return adminFetch<AdminQuestion>(`/questions/${id}`);
}

export function createQuestion(q: AdminQuestionInput): Promise<AdminQuestion> {
  return adminFetch("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
}

export function bulkCreateQuestions(
  questions: AdminQuestionInput[],
): Promise<{ created: number; questions: { id: number; question_number: number }[] }> {
  return adminFetch("/questions/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions }),
  });
}

export function updateQuestion(
  id: number,
  q: Partial<AdminQuestionInput>,
): Promise<AdminQuestion> {
  return adminFetch(`/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(q),
  });
}

export function deleteQuestion(id: number): Promise<void> {
  return adminFetch(`/questions/${id}`, { method: "DELETE" });
}

// --- Admin: topic intelligence cache ---

export interface TICacheEntry {
  id: number;
  query: string;
  total_matches: number;
  frequency_classification: string;
  recommendation: string | null;
  has_narrative: boolean;
  generated_at: string;
}

export function getTICache(): Promise<TICacheEntry[]> {
  return adminFetch<TICacheEntry[]>("/topic-intelligence");
}

export function clearTICache(): Promise<void> {
  return adminFetch("/topic-intelligence", { method: "DELETE" });
}

export function deleteTICacheEntry(id: number): Promise<void> {
  return adminFetch(`/topic-intelligence/${id}`, { method: "DELETE" });
}

// --- Admin: provenance ---

export interface ProvenanceEntry {
  question_id: number;
  source_guess: string;
  schema_version: number;
  generated_at: string;
}

export function getAdminProvenance(questionId?: number): Promise<ProvenanceEntry[]> {
  const qs = questionId !== undefined ? `?question_id=${questionId}` : "";
  return adminFetch<ProvenanceEntry[]>(`/provenance${qs}`);
}

export function deleteProvenance(questionId: number): Promise<void> {
  return adminFetch(`/provenance/${questionId}`, { method: "DELETE" });
}

export function regenerateProvenance(
  questionId: number,
): Promise<{ question_id: number; source_guess: string; generated_at: string }> {
  return adminFetch(`/provenance/${questionId}/regenerate`, { method: "POST" });
}

// --- Admin: test series ---

export interface TestCategory {
  id: number;
  name: string;
  parent_id: number | null;
  level: number;
  display_order: number;
  children: TestCategory[];
}

export function getTestCategories(): Promise<TestCategory[]> {
  return adminFetch<TestCategory[]>("/test-categories");
}

export function createTestCategory(input: {
  name: string;
  parent_id?: number | null;
  level: number;
  display_order?: number;
}): Promise<{ id: number; name: string; level: number }> {
  return adminFetch("/test-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateTestCategory(
  id: number,
  input: { name?: string; display_order?: number },
): Promise<void> {
  return adminFetch(`/test-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteTestCategory(id: number): Promise<void> {
  return adminFetch(`/test-categories/${id}`, { method: "DELETE" });
}

export interface AdminTest {
  id: number;
  category_id: number;
  category_name: string | null;
  code: string;
  title: string;
  exam_name: string;
  year: number;
  duration_minutes: number;
  question_count: number;
  marks: number;
  tier: string;
  status: string;
  assigned_questions: number;
}

export function getAdminTests(categoryId?: number): Promise<AdminTest[]> {
  const qs = categoryId !== undefined ? `?category_id=${categoryId}` : "";
  return adminFetch<AdminTest[]>(`/tests${qs}`);
}

export function createTest(input: {
  category_id: number;
  code: string;
  title: string;
  exam_name: string;
  year: number;
  duration_minutes: number;
  question_count: number;
  marks: number;
  tier?: string;
  status?: string;
}): Promise<{ id: number; code: string; title: string }> {
  return adminFetch("/tests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateTest(
  id: number,
  input: { title?: string; duration_minutes?: number; marks?: number; tier?: string; status?: string },
): Promise<void> {
  return adminFetch(`/tests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteTest(id: number): Promise<void> {
  return adminFetch(`/tests/${id}`, { method: "DELETE" });
}

export interface TestQuestion {
  order: number;
  question_id: number;
  question_number: number;
  question_text: string;
  subject: string;
  topic: string;
  exam_name: string | null;
  year: number | null;
}

export function getTestQuestions(testId: number): Promise<TestQuestion[]> {
  return adminFetch<TestQuestion[]>(`/tests/${testId}/questions`);
}

export function assignTestQuestion(
  testId: number,
  questionId: number,
  difficultyOrder?: number,
): Promise<void> {
  return adminFetch(`/tests/${testId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId, difficulty_order: difficultyOrder }),
  });
}

export function unassignTestQuestion(testId: number, questionId: number): Promise<void> {
  return adminFetch(`/tests/${testId}/questions/${questionId}`, { method: "DELETE" });
}

// --- Admin: pattern x-ray ---

export interface AdminPatternCategory {
  id: number;
  name: string;
  display_order: number;
  pattern_count: number;
}

export function getAdminPatternCategories(): Promise<AdminPatternCategory[]> {
  return adminFetch<AdminPatternCategory[]>("/pattern-categories");
}

export function createPatternCategory(input: {
  name: string;
  display_order?: number;
}): Promise<{ id: number; name: string }> {
  return adminFetch("/pattern-categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updatePatternCategory(
  id: number,
  input: { name: string; display_order?: number },
): Promise<void> {
  return adminFetch(`/pattern-categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deletePatternCategory(id: number): Promise<void> {
  return adminFetch(`/pattern-categories/${id}`, { method: "DELETE" });
}

export interface AdminPattern {
  id: number;
  category_id: number;
  category_name: string | null;
  title: string;
  classification: string;
  tested_score: number;
  year_min: number;
  year_max: number;
  exams_covered: string[];
  question_count: number;
  has_brief: boolean;
}

export function getAdminPatterns(categoryId?: number): Promise<AdminPattern[]> {
  const qs = categoryId !== undefined ? `?category_id=${categoryId}` : "";
  return adminFetch<AdminPattern[]>(`/patterns${qs}`);
}

export function createPattern(input: {
  category_id: number;
  title: string;
  classification?: string;
  tested_score?: number;
  year_min?: number;
  year_max?: number;
  exams_covered?: string[];
}): Promise<AdminPattern> {
  return adminFetch("/patterns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updatePattern(
  id: number,
  input: {
    title?: string;
    classification?: string;
    tested_score?: number;
    year_min?: number;
    year_max?: number;
    exams_covered?: string[];
  },
): Promise<AdminPattern> {
  return adminFetch(`/patterns/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deletePattern(id: number): Promise<void> {
  return adminFetch(`/patterns/${id}`, { method: "DELETE" });
}

export interface PatternQuestionLink {
  difficulty_order: number;
  question_id: number;
  question_number: number;
  question_text: string;
  subject: string;
  topic: string;
  exam_name: string | null;
  year: number | null;
}

export function getPatternQuestions(patternId: number): Promise<PatternQuestionLink[]> {
  return adminFetch<PatternQuestionLink[]>(`/patterns/${patternId}/questions`);
}

export function linkPatternQuestion(
  patternId: number,
  questionId: number,
  difficultyOrder?: number,
): Promise<void> {
  return adminFetch(`/patterns/${patternId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question_id: questionId, difficulty_order: difficultyOrder }),
  });
}

export function unlinkPatternQuestion(patternId: number, questionId: number): Promise<void> {
  return adminFetch(`/patterns/${patternId}/questions/${questionId}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/*  World Events (3D globe)                                             */
/* ------------------------------------------------------------------ */

export interface EventFilters {
  category?: string;
  limit?: number;
  offset?: number;
  include_sample?: boolean;
}

export function getEvents(filters: EventFilters = {}): Promise<EventsResponse> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.limit !== undefined) params.set("limit", String(filters.limit));
  if (filters.offset !== undefined) params.set("offset", String(filters.offset));
  if (filters.include_sample) params.set("include_sample", "true");
  const qs = params.toString();
  return fetchJSON<EventsResponse>(`${API_BASE}/events${qs ? `?${qs}` : ""}`);
}

export { type WorldEvent };
