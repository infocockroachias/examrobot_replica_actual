import Navbar from "@/components/Navbar";
import { getTestSeriesSummary, getTestSeriesCategories } from "@/lib/api";
import TestSeriesClient from "./TestSeriesClient";

// Force a fresh server render on every request. Combined with prefetch={false}
// on the Dashboard link, this guarantees navigation always reflects current
// data rather than a stale prefetched snapshot.
export const dynamic = "force-dynamic";

export default async function TestSeriesPage() {
  const [summary, categories] = await Promise.all([
    getTestSeriesSummary(),
    getTestSeriesCategories(),
  ]);

  return <TestSeriesClient summary={summary} categories={categories} />;
}
