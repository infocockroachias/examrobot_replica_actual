import Navbar from "@/components/Navbar";
import {
  getPatternCategories,
  getPatterns,
} from "@/lib/api";
import type { PatternCategoriesResponse, PatternsListResponse } from "@/lib/types";
import PatternXrayClient from "./PatternXrayClient";

// Fresh data on every request. The list endpoints are cheap; the per-pattern
// brief is generated lazily by the backend on first fetch and cached, so we
// only pull the list here and let the client fetch a pattern's detail (brief +
// timeline + practice) on demand.
export const dynamic = "force-dynamic";

export default async function PatternXrayPage() {
  const [categories, patterns]: [PatternCategoriesResponse, PatternsListResponse] =
    await Promise.all([getPatternCategories(), getPatterns()]);

  return (
    <PatternXrayClient
      categories={categories}
      patterns={patterns}
    />
  );
}
