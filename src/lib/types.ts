export interface Exam {
  id: number;
  name: string;
  question_count: number;
}

export interface Year {
  year: number;
  question_count: number;
}

export interface QuestionOption {
  id: number;
  label: string;
  option_text: string;
  is_correct?: boolean;
}

export interface OptionOut {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  question_number: number;
  question_text: string;
  exam_name: string;
  year: number;
  options: QuestionOption[];
}

export interface QuestionDetail {
  id: number;
  exam_name: string;
  year: number;
  question_number: number;
  question_text: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  options: OptionOut[];
  explanation: string | null;
}

export interface SimilarQuestion {
  id: number;
  exam_name: string;
  year: number;
  question_number: number;
  relevance_score: number;
  question_text: string;
  options: OptionOut[];
}

export interface StatementBreakdownItem {
  statement: string;
  why_it_matters: string;
}

export interface Provenance {
  source_guess: string;
  statement_breakdown: StatementBreakdownItem[];
  micro_concepts: string[];
  generated_at: string;
  verdict?: string;
  how_to_study?: string;
  origin_classification?: string;
  fairness_rating?: string;
  fairness_reasoning?: string;
  books_score?: number;
  current_affairs_score?: number;
}

export interface SubareaBreakdownItem {
  name: string;
  count: number;
  example_question_id: number;
}

export interface TopicIntelligence {
  query: string;
  total_matches: number;
  years_covered: number[];
  exams_covered: string[];
  subarea_breakdown: SubareaBreakdownItem[];
  frequency_classification: string;
  recommendation: string | null;
  narrative: string | null;
}

// ---------------------------------------------------------------------------
// Test Series
// ---------------------------------------------------------------------------

export interface TestSeriesSummary {
  title: string;
  total_tests: number;
  total_questions: number;
  active_tests: number;
}

export interface TestOut {
  id: number;
  code: string;
  title: string;
  exam_name: string;
  year: number;
  duration_minutes: number;
  question_count: number;
  marks: number;
  tier: "free" | "pro";
  status: "open" | "coming_soon";
}

export interface TopicOut {
  id: number;
  name: string;
  tests: TestOut[];
}

export interface SubcategoryOut {
  id: number;
  name: string;
  topics: TopicOut[];
}

export interface CategoryOut {
  id: number;
  name: string;
  subcategories: SubcategoryOut[];
}

export interface CategoriesResponse {
  categories: CategoryOut[];
}

// ---------------------------------------------------------------------------
// Pattern X-Ray
// ---------------------------------------------------------------------------

export type PatternClassification =
  | "hot"
  | "rising"
  | "evergreen"
  | "sporadic"
  | "fading";

export interface PatternCategory {
  id: number;
  name: string;
  pattern_count: number;
}

export interface PatternCategoriesResponse {
  categories: PatternCategory[];
}

export interface PatternListItem {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  classification: PatternClassification;
  tested_score: number;
  year_min: number;
  year_max: number;
  exams_covered: string[];
  question_count: number;
  has_brief: boolean;
}

export interface PatternsListResponse {
  patterns: PatternListItem[];
}

export interface ExamTimelineItem {
  year: number;
  exam_name: string;
  question_count: number;
}

export interface PatternPracticeQuestion {
  id: number;
  exam_name: string;
  year: number;
  question_number: number;
  question_text: string;
  subject: string;
  topic: string;
  subtopic: string | null;
  options: OptionOut[];
  difficulty_order: number;
}

export interface PatternDetail {
  id: number;
  category_id: number;
  category_name: string;
  title: string;
  classification: PatternClassification;
  tested_score: number;
  year_min: number;
  year_max: number;
  exams_covered: string[];
  question_count: number;
  why_upsc_tests_this: string | null;
  how_it_evolved: string | null;
  key_insight: string | null;
  generated_at: string | null;
  exam_timeline: ExamTimelineItem[];
  practice_questions: PatternPracticeQuestion[];
}

/* ------------------------------------------------------------------ */
/*  World Events (3D globe)                                             */
/* ------------------------------------------------------------------ */

export const EVENT_CATEGORIES = [
  "Politics & Governance",
  "Conflict & Security",
  "Economy",
  "Science & Technology",
  "Environment",
  "Disaster",
  "Society",
  "Health",
  "Other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface WorldEvent {
  id: number;
  external_id: string;
  source_name: string;
  title: string;
  description: string | null;
  category: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  source_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  is_sample: boolean;
}

export interface EventsResponse {
  events: WorldEvent[];
  total: number;
  categories: string[];
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Bulk Markdown Import
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// AI Extraction
// ---------------------------------------------------------------------------

export interface ProposedChange {
  field: string;
  action: "ADD" | "REPLACE" | "REMOVE";
  original_value: unknown;
  proposed_value: unknown;
  reason: string;
  evidence: string;
  confidence: number;
}

export interface ConfidenceScores {
  question_boundary: number;
  question_text: number;
  options: number;
  answer: number;
  solution: number;
}

export type QuestionStatus =
  | "READY"
  | "REVIEW_REQUIRED"
  | "REVIEW"
  | "DUPLICATE"
  | "INVALID"
  | "AI_EXTRACTION_FAILED"
  | "DETECTED"
  | "PROCESSING";

export interface StagedQuestion {
  temp_id: string;
  index: number | string;
  question_text: string;
  options: { label: string; text: string; is_correct: boolean }[];
  correct_answer: string | null;
  solution: string;
  year: number | null;
  subject: string | null;
  topic: string | null;
  subtopic: string | null;
  status: QuestionStatus;
  classification_confidence: string | null;
  classification_method: string | null;
  is_duplicate: boolean;
  duplicate_of: number | null;
  duplicate_match_type: string | null;
  needs_review: boolean;
  review_reasons: string[];
  // AI extraction fields.
  extraction_method?: "deterministic" | "ai" | "hybrid" | "failed";
  proposed_changes?: ProposedChange[];
  issues?: string[];
  confidence?: ConfidenceScores;
  raw_block?: string;
  // Stable identity.
  block_hash?: string;
}

export interface ImportPreview {
  upload_id: string;
  filename: string;
  document_meta: Record<string, unknown>;
  total_parsed: number;
  ready_count: number;
  review_count: number;
  duplicate_count: number;
  invalid_count: number;
  questions: StagedQuestion[];
  errors: { index: number; raw_block: string; error: string; status: string }[];
  // Enhanced summary stats.
  total_detected?: number;
  successfully_extracted?: number;
  ai_processed?: number;
  ai_reconstructions_proposed?: number;
  // Reconciliation / integrity (Parts 12–14).
  ai_failed_count?: number;
  expected_question_numbers?: number[];
  staged_question_numbers?: number[];
  missing_question_numbers?: number[];
  integrity_ok?: boolean;
  // Recovery report (BUG 4): gap analysis + merged-question recovery.
  recovery_report?: {
    total_extracted: number;
    extracted_numbers: number[];
    expected_numbers: number[];
    suspicious_gaps: number[];
    recovered: number[];
    confirmed_absent: number[];
    unresolved: number[];
  };
  // Source provenance (PDF vs Markdown).
  source_meta?: {
    source_type: "markdown" | "pdf";
    page_count?: number;
    ocr_used?: boolean;
    extraction_method?: string;
    pdf_warnings?: string[];
  };
}

export interface ImportBatch {
  id: number;
  filename: string;
  source_document: string | null;
  uploaded_at: string;
  status: string;
  admin_user: string | null;
  total_parsed: number;
  committed_count: number;
  duplicate_count: number;
  needs_review_count: number;
  invalid_count: number;
  committed_question_ids: number[];
}
