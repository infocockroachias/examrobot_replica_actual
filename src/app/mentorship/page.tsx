import Navbar from "@/components/Navbar";
import MentorshipClient from "./MentorshipClient";

// Student-specific data is fetched client-side (scoped to a localStorage token),
// so this page must never be cached or statically generated.
export const dynamic = "force-dynamic";

export default function MentorshipPage() {
  return (
    <main className="min-h-screen bg-page-bg">
      <Navbar authState="logged-in" username="Aspirant" variant="app" />
      <MentorshipClient />
    </main>
  );
}
