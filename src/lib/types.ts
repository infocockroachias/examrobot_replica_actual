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
