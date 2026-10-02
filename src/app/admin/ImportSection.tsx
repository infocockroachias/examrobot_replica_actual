"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import StatCard from "@/components/StatCard";
import SlideOverDrawer from "@/components/SlideOverDrawer";
import {
  ImportPreview,
  QuestionDetail,
  QuestionStatus,
  StagedQuestion,
} from "@/lib/types";
import {
  commitBulkImport,
  CommitImportResult,
  discardBulkImport,
  fileSourceType,
  getBulkImportPreview,
  getBulkImportProgress,
  getQuestion,
  startBulkImport,
  UploadProgress,
} from "@/lib/api";

type UploadStep = "idle" | "uploading" | "preview" | "committing" | "done";

const STATUS_META: Record<
  QuestionStatus,
  { label: string; variant: "green" | "amber" | "red" | "gray"; icon: typeof CheckCircle2 }
> = {
  READY: { label: "Ready", variant: "green", icon: CheckCircle2 },
  REVIEW: { label: "Review", variant: "amber", icon: AlertTriangle },
  REVIEW_REQUIRED: { label: "Review", variant: "amber", icon: AlertTriangle },
  DUPLICATE: { label: "Duplicate", variant: "red", icon: Copy },
  INVALID: { label: "Invalid", variant: "red", icon: ShieldAlert },
  AI_EXTRACTION_FAILED: { label: "AI Failed", variant: "red", icon: Bot },
  DETECTED: { label: "Detected", variant: "gray", icon: Eye },
  PROCESSING: { label: "Processing", variant: "gray", icon: Eye },
};

export default function ImportSection() {
  const [step, setStep] = useState<UploadStep>("idle");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [skipSet, setSkipSet] = useState<Set<string>>(new Set());
  const [commitMsg, setCommitMsg] = useState<string | null>(null);
  const [distribution, setDistribution] = useState<CommitImportResult["distribution"] | null>(null);
  const [sourceType, setSourceType] = useState<"markdown" | "pdf">("markdown");
  // Phase 7.4–7.6: per-question admin edits keyed by temp_id. These flow into
  // the commit overrides so the backend writes the corrected data.
  const [overrides, setOverrides] = useState<Record<string, Record<string, unknown>>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  // Polling tracker so we can stop when the upload finishes or the component unmounts.
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setStep("idle");
    setPreview(null);
    setError(null);
    setUploading(false);
    setProgress(null);
    setSelectedId(null);
    setSkipSet(new Set());
    setCommitMsg(null);
    setDistribution(null);
    setOverrides({});
    setSourceType("markdown");
  };

  // Apply a field edit from the review drawer into the overrides map.
  const applyOverride = (tempId: string, patch: Record<string, unknown>) => {
    setOverrides((prev) => ({
      ...prev,
      [tempId]: { ...(prev[tempId] || {}), ...patch },
    }));
  };

  // Poll the progress endpoint until the background job finishes, then load the preview.
  const pollUntilDone = (uploadId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const prog = await getBulkImportProgress(uploadId);
        setProgress(prog);
        if (prog.done) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          // Load the finished preview.
          const finished = await getBulkImportPreview(uploadId);
          setPreview(finished);
          setStep("preview");
          setUploading(false);
          const dupIds = new Set(
            finished.questions.filter((q) => q.status === "DUPLICATE").map((q) => q.temp_id),
          );
          setSkipSet(dupIds);
        }
      } catch {
        // 404 means the job finished and progress was cleared, or it errored.
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
        // Try to load the preview anyway (job may have completed).
        try {
          const finished = await getBulkImportPreview(uploadId);
          setPreview(finished);
          setStep("preview");
          const dupIds = new Set(
            finished.questions.filter((q) => q.status === "DUPLICATE").map((q) => q.temp_id),
          );
          setSkipSet(dupIds);
        } catch {
          setError("Upload failed — the file could not be processed.");
          setStep("idle");
        } finally {
          setUploading(false);
        }
      }
    }, 500);
  };

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(null);
    setStep("uploading");
    setSourceType(fileSourceType(file));
    try {
      // Start the background job — returns upload_id immediately.
      const { upload_id } = await startBulkImport(file, "Admin");
      // Begin polling for progress.
      pollUntilDone(upload_id);
    } catch (e) {
      setError((e as Error).message);
      setStep("idle");
      setUploading(false);
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toggleSkip = (tempId: string) => {
    setSkipSet((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };

  const handleCommit = async () => {
    if (!preview) return;
    setStep("committing");
    setCommitMsg(null);
    try {
      const result = await commitBulkImport(preview.upload_id, overrides, Array.from(skipSet));
      setCommitMsg(
        `Committed ${result.committed} questions (skipped ${result.skipped}). Import batch #${result.import_batch_id}.`,
      );
      setDistribution(result.distribution);
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
      setStep("preview");
    }
  };

  const handleDiscard = async () => {
    if (!preview) return;
    try {
      await discardBulkImport(preview.upload_id);
    } catch {
      // ignore discard errors
    }
    reset();
  };

  const selectedQuestion = preview?.questions.find((q) => q.temp_id === selectedId) ?? null;

  // Resolve the selected question with any admin overrides applied, so the
  // drawer always shows the data that will actually be committed.
  const resolvedQuestion: StagedQuestion | null = selectedQuestion
    ? { ...selectedQuestion, ...(overrides[selectedQuestion.temp_id] || {}) }
    : null;

  const commitCount = preview
    ? preview.questions.filter(
        (q) => q.status !== "DUPLICATE" && !skipSet.has(q.temp_id),
      ).length
    : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bulk Import</h1>
          <p className="mt-1 text-sm text-text-muted">
            Upload a Markdown or PDF file of questions. Preview, review, then commit.
          </p>
        </div>
        {step === "preview" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </button>
            <button
              disabled={commitCount === 0}
              onClick={handleCommit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-success-green px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              Commit {commitCount} question{commitCount !== 1 ? "s" : ""}
            </button>
          </div>
        )}
        {step === "done" && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-blue px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue-dark"
          >
            <Upload className="h-4 w-4" />
            New Import
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-danger-red/30 bg-danger-bg p-3 text-sm text-danger-red">
          {error}
        </div>
      )}

      {commitMsg && (
        <div className="mt-4 rounded-xl border border-success-green/30 bg-success-bg p-3 text-sm text-success-green">
          {commitMsg}
        </div>
      )}

      {/* Upload zone */}
      {step === "idle" && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="mt-6 cursor-pointer rounded-xl border-2 border-dashed border-card-border bg-white p-12 text-center transition-colors hover:border-primary-blue hover:bg-gray-50"
        >
          <Upload className="mx-auto h-10 w-10 text-text-muted" />
          <p className="mt-3 text-sm font-medium text-text-primary">
            Drop a Markdown or PDF file here, or click to browse
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Supports .md, .markdown, and .pdf files with numbered questions (1., 2., …) and A–D options.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,text/markdown,text/plain,.pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      )}

      {/* Uploading progress */}
      {step === "uploading" && (
        <div className="mt-6 flex flex-col items-center gap-4 py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-blue border-t-transparent" />
          {progress && progress.total > 0 ? (
            <div className="w-full max-w-sm space-y-2 text-center">
              <p className="text-sm font-semibold text-text-primary">
                {progress.processed} / {progress.total} questions
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary-blue transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-text-muted capitalize">
                {progress.stage === "parsing" ? "Parsing document…" :
                 progress.stage === "classifying" ? "Classifying questions…" :
                 progress.stage === "ai_extraction" ? "AI extracting orphaned blocks…" :
                 progress.stage === "pdf_extraction" ? "Extracting PDF text…" :
                 progress.stage === "ocr" ? "Running OCR…" :
                 progress.stage === "done" ? "Finalizing…" :
                 progress.stage}
              </p>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Uploading file…</p>
          )}
        </div>
      )}

      {/* Preview */}
      {step === "preview" && preview && (
        <div className="mt-6 space-y-6">
          {/* Document meta */}
          {(typeof preview.document_meta?.title === "string" || preview.source_meta) && (
            <div className="flex items-start gap-3 rounded-xl border border-card-border bg-white p-4">
              <FileText className="mt-0.5 h-5 w-5 text-primary-blue" />
              <div>
                {typeof preview.document_meta?.title === "string" ? (
                  <p className="text-sm font-semibold text-text-primary">
                    {preview.document_meta.title}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-text-primary">
                    {preview.source_meta?.source_type === "pdf" ? "PDF Document" : "Markdown Document"}
                  </p>
                )}
                <p className="text-xs text-text-muted">{preview.filename}</p>
                {preview.source_meta?.source_type === "pdf" && (
                  <p className="mt-1 text-xs text-text-muted">
                    PDF · {preview.source_meta.page_count ?? "?"} pages ·{" "}
                    {preview.source_meta.ocr_used ? "OCR used" : "Text extraction"}
                    {preview.source_meta.extraction_method
                      ? ` · ${preview.source_meta.extraction_method}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
            <StatCard
              icon={<FileText className="h-5 w-5 text-text-secondary" />}
              value={String(preview.total_detected ?? preview.total_parsed)}
              label="Detected"
              sublabel={`${preview.total_parsed} extracted`}
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5 text-success-green" />}
              value={String(preview.ready_count)}
              label="Ready"
              sublabel="will be committed"
            />
            <StatCard
              icon={<AlertTriangle className="h-5 w-5 text-warning-amber" />}
              value={String(preview.review_count)}
              label="Needs Review"
              sublabel={`${preview.invalid_count} invalid`}
            />
            <StatCard
              icon={<Copy className="h-5 w-5 text-danger-red" />}
              value={String(preview.duplicate_count)}
              label="Duplicates"
              sublabel="pre-skipped"
            />
            <StatCard
              icon={<Bot className="h-5 w-5 text-purple-accent" />}
              value={String(preview.ai_processed ?? 0)}
              label="AI Processed"
              sublabel={`${preview.ai_reconstructions_proposed ?? 0} proposals`}
            />
          </div>

          {/* Question integrity (Parts 13–14) */}
          <div
            className={`rounded-xl border p-4 ${
              preview.integrity_ok
                ? "border-success-green/30 bg-success-bg"
                : "border-danger-red/30 bg-danger-bg"
            }`}
          >
            <div className="flex items-start gap-3">
              {preview.integrity_ok ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-success-green" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 text-danger-red" />
              )}
              <div className="flex-1">
                <h3
                  className={`text-sm font-bold ${
                    preview.integrity_ok ? "text-success-green" : "text-danger-red"
                  }`}
                >
                  Question Integrity —{" "}
                  {preview.integrity_ok
                    ? "All detected questions are staged"
                    : "Missing questions detected"}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-text-secondary sm:grid-cols-4">
                  <div>
                    <span className="font-semibold text-text-primary">
                      {preview.expected_question_numbers?.length ?? 0}
                    </span>{" "}
                    detected in source
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">
                      {preview.staged_question_numbers?.length ?? 0}
                    </span>{" "}
                    staged
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">
                      {preview.missing_question_numbers?.length ?? 0}
                    </span>{" "}
                    missing
                  </div>
                  <div>
                    <span className="font-semibold text-text-primary">
                      {preview.total_parsed ?? 0}
                    </span>{" "}
                    total records
                  </div>
                </div>
                {preview.missing_question_numbers &&
                  preview.missing_question_numbers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-danger-red">
                        Missing question numbers:
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {preview.missing_question_numbers
                          .map((n) => `Q${n}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Recovery report (BUG 4): merged-question detection results */}
          {preview.recovery_report &&
            preview.recovery_report.suspicious_gaps.length > 0 && (
              <div
                className={`rounded-xl border p-4 ${
                  preview.recovery_report.unresolved.length === 0
                    ? "border-success-green/30 bg-success-bg"
                    : "border-warning-amber/30 bg-warning-bg"
                }`}
              >
                <div className="flex items-start gap-3">
                  {preview.recovery_report.unresolved.length === 0 ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success-green" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-amber" />
                  )}
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-bold ${
                        preview.recovery_report.unresolved.length === 0
                          ? "text-success-green"
                          : "text-warning-amber"
                      }`}
                    >
                      Recovery Scan —{" "}
                      {preview.recovery_report.unresolved.length === 0
                        ? "All gaps resolved"
                        : `${preview.recovery_report.unresolved.length} gap${
                            preview.recovery_report.unresolved.length !== 1 ? "s" : ""
                          } could not be recovered`}
                    </h3>
                    <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-text-secondary sm:grid-cols-4">
                      <div>
                        <span className="font-semibold text-text-primary">
                          {preview.recovery_report.suspicious_gaps.length}
                        </span>{" "}
                        suspicious gaps found
                      </div>
                      <div>
                        <span className="font-semibold text-success-green">
                          {preview.recovery_report.recovered.length}
                        </span>{" "}
                        recovered (merged)
                      </div>
                      <div>
                        <span className="font-semibold text-text-muted">
                          {preview.recovery_report.confirmed_absent.length}
                        </span>{" "}
                        confirmed absent
                      </div>
                      <div>
                        <span className="font-semibold text-warning-amber">
                          {preview.recovery_report.unresolved.length}
                        </span>{" "}
                        unresolved
                      </div>
                    </div>
                    {preview.recovery_report.recovered.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-success-green">
                          Recovered merged questions:
                        </p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {preview.recovery_report.recovered
                            .map((n) => `Q${n}`)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                    {preview.recovery_report.unresolved.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-warning-amber">
                          Unresolved (exist in source but could not be parsed):
                        </p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {preview.recovery_report.unresolved
                            .map((n) => `Q${n}`)
                            .join(", ")}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          These questions may use a non-standard format (e.g. tables,
                          dash-style options) or be malformed in the source document.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Question table */}
          <div className="overflow-hidden rounded-xl border border-card-border bg-white">
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-card-border bg-gray-50 text-xs uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-4 py-3">Q#</th>
                    <th className="px-4 py-3">Text</th>
                    <th className="px-4 py-3">Subject / Topic</th>
                    <th className="px-4 py-3">Options</th>
                    <th className="px-4 py-3">Conf.</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Commit?</th>
                    <th className="px-4 py-3 text-right">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {preview.questions.map((q) => {
                    const meta = STATUS_META[q.status] ?? STATUS_META.REVIEW_REQUIRED;
                    const skipped = skipSet.has(q.temp_id);
                    const conf = q.confidence;
                    const minConf = conf
                      ? Math.min(conf.question_text, conf.options, conf.answer, conf.solution)
                      : (q.status === "READY" ? 1.0 : 0.5);
                    const confVariant = minConf >= 0.8 ? "green" : minConf >= 0.5 ? "amber" : "red";
                    const method = q.extraction_method ?? "deterministic";
                    return (
                      <tr key={q.temp_id} className={skipped ? "bg-gray-50/50 opacity-60" : ""}>
                        <td className="px-4 py-3 text-text-muted">{q.index}</td>
                        <td className="max-w-md truncate px-4 py-3 text-text-primary">
                          {q.question_text}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-text-secondary">
                            {q.subject ?? "—"} &rsaquo; {q.topic ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{q.options.length}</td>
                        <td className="px-4 py-3">
                          <Badge variant={confVariant}>{Math.round(minConf * 100)}%</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {method === "ai" || method === "hybrid" ? (
                            <Badge variant="purple">{method}</Badge>
                          ) : (
                            <span className="text-xs text-text-muted">{method}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={meta.variant as "green" | "amber" | "red" | "gray"}>{meta.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {q.status === "DUPLICATE" ? (
                            <input
                              type="checkbox"
                              checked={!skipped}
                              onChange={() => toggleSkip(q.temp_id)}
                              className="h-4 w-4 rounded border-card-border"
                              title="Include this duplicate"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={!skipped}
                              onChange={() => toggleSkip(q.temp_id)}
                              className="h-4 w-4 rounded border-card-border"
                              title="Skip this question"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedId(q.temp_id)}
                            className="rounded-lg p-1.5 text-text-muted hover:bg-gray-100 hover:text-primary-blue"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Parse errors */}
          {preview.errors.length > 0 && (
            <div className="rounded-xl border border-danger-red/30 bg-danger-bg p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-danger-red">
                <ShieldAlert className="h-4 w-4" />
                {preview.errors.length} question{preview.errors.length !== 1 ? "s" : ""} could not be parsed
              </h3>
              <div className="mt-3 space-y-2">
                {preview.errors.map((err) => (
                  <div key={err.index} className="rounded-lg border border-danger-red/20 bg-white p-3">
                    <p className="text-xs font-semibold text-text-primary">Question #{err.index}</p>
                    <p className="mt-0.5 text-xs text-danger-red">{err.error}</p>
                    <p className="mt-1 font-mono text-[11px] text-text-muted">
                      {err.raw_block.slice(0, 120)}…
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done state */}
      {step === "done" && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-10 w-10 text-success-green" />
            <p className="text-sm font-medium text-text-primary">Import complete</p>
          </div>

          {/* Distribution summary */}
          {distribution && (
            <div className="rounded-xl border border-card-border bg-white p-5">
              <h3 className="text-sm font-bold text-text-primary">Distributed into features</h3>
              <p className="mt-1 text-xs text-text-muted">
                New questions were wired into the four feature modules automatically.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DistCard
                  title="Topic Intelligence"
                  detail={
                    distribution.topic_intelligence?.error
                      ? `Error: ${distribution.topic_intelligence.error}`
                      : `${distribution.topic_intelligence?.invalidated ?? 0} cache entries invalidated`
                  }
                  ok={!distribution.topic_intelligence?.error}
                />
                <DistCard
                  title="Pattern X-Ray"
                  detail={
                    distribution.pattern_xray?.error
                      ? `Error: ${distribution.pattern_xray.error}`
                      : `${distribution.pattern_xray?.patterns_created ?? 0} new · ${distribution.pattern_xray?.patterns_updated ?? 0} updated · ${distribution.pattern_xray?.links_created ?? 0} links`
                  }
                  ok={!distribution.pattern_xray?.error}
                />
                <DistCard
                  title="Topic Mastery"
                  detail={
                    distribution.topic_mastery?.error
                      ? `Error: ${distribution.topic_mastery.error}`
                      : `${distribution.topic_mastery?.matched ?? 0} matched · ${distribution.topic_mastery?.unmatched ?? 0} unmatched · ${distribution.topic_mastery?.links_created ?? 0} links`
                  }
                  ok={!distribution.topic_mastery?.error}
                />
                <DistCard
                  title="PYQ Deep Decode"
                  detail="Provenance generated on first view (lazy)"
                  ok
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question preview + edit drawer (Phases 7.4–7.6) */}
      <SlideOverDrawer
        open={!!resolvedQuestion}
        onClose={() => setSelectedId(null)}
        title={resolvedQuestion ? `Question #${resolvedQuestion.index}` : ""}
        subtitle={resolvedQuestion?.status}
        icon={resolvedQuestion ? <Eye className="h-5 w-5" /> : undefined}
        width="w-[600px]"
      >
        {selectedQuestion && resolvedQuestion && (
          <QuestionReviewDetail
            question={selectedQuestion}
            resolved={resolvedQuestion}
            isSkipped={skipSet.has(selectedQuestion.temp_id)}
            onToggleSkip={() => toggleSkip(selectedQuestion.temp_id)}
            onOverride={(patch) => applyOverride(selectedQuestion.temp_id, patch)}
          />
        )}
      </SlideOverDrawer>
    </div>
  );
}

function QuestionReviewDetail({
  question,
  resolved,
  isSkipped,
  onToggleSkip,
  onOverride,
}: {
  question: StagedQuestion;
  /** The question with admin overrides applied — what will actually commit. */
  resolved: StagedQuestion;
  isSkipped: boolean;
  onToggleSkip: () => void;
  onOverride: (patch: Record<string, unknown>) => void;
}) {
  const meta = STATUS_META[resolved.status];
  const Icon = meta.icon;

  // Local editable copies initialized from the resolved (override-applied) data.
  // Edits are flushed to the parent override map on every change so the commit
  // always carries the latest corrections.
  const [text, setText] = useState(resolved.question_text);
  const [options, setOptions] = useState(resolved.options);
  const [subject, setSubject] = useState(resolved.subject ?? "");
  const [topic, setTopic] = useState(resolved.topic ?? "");
  const [subtopic, setSubtopic] = useState(resolved.subtopic ?? "");
  const [solution, setSolution] = useState(resolved.solution);

  // AI proposal tracking: which proposals the admin has applied or rejected.
  // Keyed by `${field}:${index}` so each proposal is independently actionable.
  const [appliedProposals, setAppliedProposals] = useState<Set<string>>(new Set());
  const [rejectedProposals, setRejectedProposals] = useState<Set<string>>(new Set());

  // Reset local state whenever the selected question changes.
  useEffect(() => {
    setText(resolved.question_text);
    setOptions(resolved.options);
    setSubject(resolved.subject ?? "");
    setTopic(resolved.topic ?? "");
    setSubtopic(resolved.subtopic ?? "");
    setSolution(resolved.solution);
    setAppliedProposals(new Set());
    setRejectedProposals(new Set());
  }, [resolved.temp_id, resolved.question_text, resolved.options, resolved.subject, resolved.topic, resolved.subtopic, resolved.solution]);

  const flush = (patch: Record<string, unknown>) => onOverride(patch);

  // --- Duplicate side-by-side (Phase 7.6) -----------------------------------
  const isDup = resolved.is_duplicate;
  const [dupExisting, setDupExisting] = useState<QuestionDetail | null>(null);
  const [dupLoading, setDupLoading] = useState(false);

  useEffect(() => {
    // duplicate_of > 0 means a real existing DB question; fetch it for comparison.
    if (isDup && typeof resolved.duplicate_of === "number" && resolved.duplicate_of > 0) {
      setDupLoading(true);
      getQuestion(resolved.duplicate_of)
        .then(setDupExisting)
        .catch(() => setDupExisting(null))
        .finally(() => setDupLoading(false));
    } else {
      setDupExisting(null);
    }
    // within-upload duplicates use a negative duplicate_of; the "other"
    // question lives in the same preview and is surfaced via review_reasons.
  }, [resolved.temp_id, isDup, resolved.duplicate_of]);

  return (
    <div className="space-y-4">
      {/* Status + skip toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.variant === "green" ? "text-success-green" : meta.variant === "amber" ? "text-warning-amber" : "text-danger-red"}`} />
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {resolved.classification_confidence && (
            <Badge variant="gray">
              {resolved.classification_confidence} ({resolved.classification_method})
            </Badge>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={!isSkipped}
            onChange={onToggleSkip}
            className="h-4 w-4 rounded border-card-border"
          />
          Commit
        </label>
      </div>

      {/* Duplicate side-by-side (Phase 7.6) */}
      {isDup && (
        <div className="rounded-xl border border-danger-red/30 bg-danger-bg p-4">
          <div className="flex items-center gap-2">
            <Copy className="h-4 w-4 text-danger-red" />
            <p className="text-sm font-semibold text-danger-red">Possible duplicate</p>
            {resolved.duplicate_match_type && (
              <Badge variant="red">{resolved.duplicate_match_type}</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            {typeof resolved.duplicate_of === "number" && resolved.duplicate_of > 0
              ? `Matches existing question #${resolved.duplicate_of} in the database.`
              : "Matches another question in this upload."}
          </p>

          {/* Existing question preview for DB duplicates */}
          {typeof resolved.duplicate_of === "number" && resolved.duplicate_of > 0 && (
            <div className="mt-3 rounded-lg border border-card-border bg-white p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Existing question #{resolved.duplicate_of}
              </p>
              {dupLoading ? (
                <p className="text-xs text-text-muted">Loading…</p>
              ) : dupExisting ? (
                <div className="space-y-2">
                  <p className="text-sm text-text-primary">{dupExisting.question_text}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="gray">{dupExisting.subject}</Badge>
                    <Badge variant="gray">{dupExisting.topic}</Badge>
                    {dupExisting.subtopic && <Badge variant="gray">{dupExisting.subtopic}</Badge>}
                    <Badge variant="gray">{dupExisting.exam_name} · {dupExisting.year}</Badge>
                  </div>
                  {!isSkipped && (
                    <p className="text-xs text-warning-amber">
                      ⚠ This duplicate is set to be committed. Uncheck "Commit" to skip it.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-muted">Could not load existing question.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review reasons */}
      {resolved.review_reasons.length > 0 && (
        <div className="rounded-lg border border-warning-amber/30 bg-warning-bg p-3">
          <p className="mb-1 text-xs font-semibold text-warning-amber">Review reasons</p>
          <ul className="space-y-0.5">
            {resolved.review_reasons.map((r, i) => (
              <li key={i} className="text-xs text-text-secondary">• {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Question text (editable) */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Question text
        </label>
        <textarea
          value={text}
          rows={4}
          onChange={(e) => {
            setText(e.target.value);
            flush({ question_text: e.target.value });
          }}
          className="w-full rounded-lg border border-card-border bg-gray-50 p-3 text-sm text-text-primary outline-none focus:border-primary-blue"
        />
      </div>

      {/* Options (editable) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Options
          <span className="ml-1 font-normal normal-case text-text-muted">
            (click the letter to mark correct)
          </span>
        </p>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div
              key={opt.label}
              className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                opt.is_correct
                  ? "border-success-green/40 bg-success-bg"
                  : "border-card-border bg-white"
              }`}
            >
              <button
                type="button"
                title="Mark as correct answer"
                onClick={() => {
                  const next = options.map((o, i) => ({
                    ...o,
                    is_correct: i === idx,
                  }));
                  setOptions(next);
                  flush({ options: next });
                }}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold transition-colors ${
                  opt.is_correct
                    ? "bg-success-green text-white"
                    : "bg-gray-100 text-text-secondary hover:bg-success-bg hover:text-success-green"
                }`}
              >
                {opt.label}
              </button>
              <input
                value={opt.text}
                onChange={(e) => {
                  const next = options.map((o, i) =>
                    i === idx ? { ...o, text: e.target.value } : o,
                  );
                  setOptions(next);
                  flush({ options: next });
                }}
                className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none"
              />
              {opt.is_correct && (
                <Badge variant="green" className="ml-auto">
                  Correct
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Classification (editable) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Classification
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-text-muted">Subject</label>
            <input
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                flush({ subject: e.target.value });
              }}
              className="w-full rounded-lg border border-card-border bg-gray-50 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-muted">Topic</label>
            <input
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                flush({ topic: e.target.value });
              }}
              className="w-full rounded-lg border border-card-border bg-gray-50 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-text-muted">Subtopic</label>
            <input
              value={subtopic}
              placeholder="—"
              onChange={(e) => {
                const v = e.target.value;
                setSubtopic(v);
                flush({ subtopic: v || null });
              }}
              className="w-full rounded-lg border border-card-border bg-gray-50 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary-blue"
            />
          </div>
        </div>
      </div>

      {/* Year (editable) */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Year
        </label>
        <input
          type="number"
          value={resolved.year ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            const year = v === "" ? null : parseInt(v, 10);
            flush({ year: Number.isNaN(year) ? null : year });
          }}
          className="w-32 rounded-lg border border-card-border bg-gray-50 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-primary-blue"
        />
      </div>

      {/* Solution (editable) */}
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Solution
        </label>
        <textarea
          value={solution}
          rows={6}
          onChange={(e) => {
            setSolution(e.target.value);
            flush({ solution: e.target.value });
          }}
          className="w-full rounded-lg border border-card-border bg-gray-50 p-3 text-xs text-text-secondary outline-none focus:border-primary-blue"
        />
      </div>

      {/* AI extraction metadata */}
      {(question.proposed_changes && question.proposed_changes.length > 0) ||
      (question.issues && question.issues.length > 0) ||
      question.raw_block ||
      question.extraction_method === "ai" ||
      question.extraction_method === "hybrid" ? (
        <div className="space-y-4 border-t border-card-border pt-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-accent" />
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-accent">
              AI Extraction Details
            </p>
            {question.extraction_method && (
              <Badge variant="purple">{question.extraction_method}</Badge>
            )}
            {question.confidence && (
              <Badge variant="gray">
                conf {Math.round(Math.min(question.confidence.question_text, question.confidence.options, question.confidence.answer, question.confidence.solution) * 100)}%
              </Badge>
            )}
          </div>

          {/* Section A — Original Source */}
          {question.raw_block && (
            <div>
              <details className="group">
                <summary className="cursor-pointer text-xs font-semibold text-text-muted hover:text-text-primary">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Original Source (raw markdown)
                    <span className="text-text-muted group-open:hidden">▼</span>
                  </span>
                </summary>
                <pre className="thin-scroll mt-2 max-h-60 overflow-auto rounded-lg border border-card-border bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {question.raw_block}
                </pre>
              </details>
            </div>
          )}

          {/* Section C — AI Proposed Changes */}
          {question.proposed_changes && question.proposed_changes.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-text-muted">
                  AI Proposed Changes ({question.proposed_changes.length})
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      // Bulk-apply: merge each proposal's value into overrides.
                      const patch: Record<string, unknown> = {};
                      question.proposed_changes?.forEach((p, i) => {
                        const key = `${p.field}:${i}`;
                        if (!rejectedProposals.has(key)) {
                          patch[p.field] = p.proposed_value;
                        }
                      });
                      flush(patch);
                      setAppliedProposals(
                        new Set(question.proposed_changes?.map((p, i) => `${p.field}:${i}`) ?? []),
                      );
                    }}
                    className="rounded-md bg-purple-accent px-2 py-1 text-[11px] font-medium text-white hover:opacity-90"
                  >
                    Apply All
                  </button>
                  <button
                    onClick={() => {
                      const allKeys = question.proposed_changes?.map((p, i) => `${p.field}:${i}`) ?? [];
                      setRejectedProposals(new Set(allKeys));
                      setAppliedProposals(new Set());
                    }}
                    className="rounded-md border border-card-border px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-gray-50"
                  >
                    Reject All
                  </button>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {question.proposed_changes.map((change, i) => {
                  const key = `${change.field}:${i}`;
                  const applied = appliedProposals.has(key);
                  const rejected = rejectedProposals.has(key);
                  return (
                    <div
                      key={key}
                      className={`rounded-lg border p-3 ${
                        applied
                          ? "border-success-green/40 bg-success-bg"
                          : rejected
                            ? "border-card-border bg-gray-50 opacity-60"
                            : "border-purple-accent/30 bg-purple-50/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="purple">{change.action}</Badge>
                          <span className="text-sm font-semibold text-text-primary">
                            {change.field}
                          </span>
                          <Badge variant="gray">
                            {Math.round(change.confidence * 100)}%
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <button
                            disabled={applied}
                            onClick={() => {
                              flush({ [change.field]: change.proposed_value });
                              setAppliedProposals((prev) => new Set(prev).add(key));
                              setRejectedProposals((prev) => {
                                const n = new Set(prev);
                                n.delete(key);
                                return n;
                              });
                            }}
                            className="rounded-md bg-success-green px-2 py-1 text-[11px] font-medium text-white hover:opacity-90 disabled:opacity-40"
                          >
                            {applied ? "✓ Applied" : "Apply"}
                          </button>
                          <button
                            disabled={rejected}
                            onClick={() => {
                              setRejectedProposals((prev) => new Set(prev).add(key));
                              setAppliedProposals((prev) => {
                                const n = new Set(prev);
                                n.delete(key);
                                return n;
                              });
                            }}
                            className="rounded-md border border-card-border px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-40"
                          >
                            {rejected ? "✗ Rejected" : "Reject"}
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">{change.reason}</p>
                      {change.original_value != null && (
                        <div className="mt-2">
                          <p className="text-[10px] font-semibold uppercase text-text-muted">
                            Original
                          </p>
                          <p className="text-xs text-danger-red line-through">
                            {typeof change.original_value === "string"
                              ? change.original_value.slice(0, 160)
                              : JSON.stringify(change.original_value).slice(0, 160)}
                          </p>
                        </div>
                      )}
                      <div className="mt-1">
                        <p className="text-[10px] font-semibold uppercase text-text-muted">
                          Proposed
                        </p>
                        <p className="text-xs text-success-green">
                          {typeof change.proposed_value === "string"
                            ? change.proposed_value.slice(0, 160)
                            : JSON.stringify(change.proposed_value).slice(0, 160)}
                        </p>
                      </div>
                      {change.evidence && (
                        <p className="mt-1 text-[11px] italic text-text-muted">
                          Evidence: {change.evidence.slice(0, 120)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section D — Issues */}
          {question.issues && question.issues.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-warning-amber">
                ⚠ Issues ({question.issues.length})
              </p>
              <ul className="space-y-1">
                {question.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning-amber" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function DistCard({ title, detail, ok }: { title: string; detail: string; ok: boolean }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-card-border p-3">
      {ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-green" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-amber" />
      )}
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="mt-0.5 text-xs text-text-secondary">{detail}</p>
      </div>
    </div>
  );
}
