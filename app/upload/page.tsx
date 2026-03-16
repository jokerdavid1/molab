"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type SieveRow = {
  mesh: string;
  percent: number;
};

type AnalysisResponse = {
  status?: string;
  job_id?: string;
  total_files?: number;
  total_grains?: number;
  processing_time_seconds?: number;
  sieve_results?: SieveRow[];
  zip_url?: string;
  error?: string;
  processed_files?: number;
};

const BATCH_SIZE = 8;
const SECONDS_PER_IMAGE = 10;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "uploading" | "processing" | "completed" | "failed"
  >("idle");

  const [currentStep, setCurrentStep] = useState("Idle");
  const [progressText, setProgressText] = useState<string | null>(null);

  const [uploadedBatches, setUploadedBatches] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);
  const [statusPollEnabled, setStatusPollEnabled] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const estimatedSeconds = useMemo(
    () => files.length * SECONDS_PER_IMAGE,
    [files.length]
  );

  const totalFilesText = useMemo(() => {
    if (files.length === 0) return "No files selected yet.";
    if (files.length === 1) return "1 image selected.";
    return `${files.length} images selected.`;
  }, [files.length]);

  const totalImages = files.length;
  const totalSteps = totalBatches + totalImages;
  const completedSteps =
    phase === "completed" ? totalSteps : uploadedBatches + processedImages;

  const computedProgressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const newFiles = selected.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      });

      return [...prev, ...newFiles];
    });

    setError(null);
    setResult(null);
    setJobId(null);
    setPhase("idle");
    setCurrentStep("Idle");
    setProgressText(null);
    setUploadedBatches(0);
    setTotalBatches(0);
    setProcessedImages(0);
    setStatusPollEnabled(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setError(null);
    setResult(null);
    setJobId(null);
    setPhase("idle");
    setCurrentStep("Idle");
    setProgressText(null);
    setUploadedBatches(0);
    setTotalBatches(0);
    setProcessedImages(0);
    setStatusPollEnabled(false);
  };

  const chunkFiles = (inputFiles: File[], chunkSize: number) => {
    const chunks: File[][] = [];
    for (let i = 0; i < inputFiles.length; i += chunkSize) {
      chunks.push(inputFiles.slice(i, i + chunkSize));
    }
    return chunks;
  };

  useEffect(() => {
    if (!statusPollEnabled || !jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analyze/status/${jobId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data: AnalysisResponse = await res.json();

        const total = data.total_files ?? files.length;
        const done = data.processed_files ?? 0;

        if (data.status === "processing") {
          setPhase("processing");
          setProcessedImages(done);
          setCurrentStep("Processing images...");
          if (done < total) {
            setProgressText(`Image ${done + 1} of ${total}`);
          } else {
            setProgressText(`Image ${total} of ${total}`);
          }
        }

        if (data.status === "completed") {
          setProcessedImages(total);
          setPhase("completed");
          setCurrentStep("Completed");
          setProgressText("Analysis completed.");
          setResult(data);
          setIsLoading(false);
          setStatusPollEnabled(false);
          clearInterval(interval);
        }

        if (data.status === "failed") {
          setPhase("failed");
          setCurrentStep("Failed");
          setProgressText(null);
          setError(data.error || "Analysis failed.");
          setIsLoading(false);
          setStatusPollEnabled(false);
          clearInterval(interval);
        }
      } catch {
        // ignore temporary polling issues
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [statusPollEnabled, jobId, files.length]);

  const startAnalysis = async () => {
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setJobId(null);
    setPhase("uploading");
    setCurrentStep("Initializing job...");
    setProgressText("Starting analysis...");
    setUploadedBatches(0);
    setProcessedImages(0);
    setStatusPollEnabled(false);

    try {
      const startRes = await fetch("/api/analyze/start", {
        method: "POST",
      });

      const startData = await startRes.json();

      if (!startRes.ok || !startData.job_id) {
        throw new Error(startData?.error || "Failed to start job.");
      }

      const newJobId = startData.job_id as string;
      setJobId(newJobId);

      const fileChunks = chunkFiles(files, BATCH_SIZE);
      setTotalBatches(fileChunks.length);

      for (let i = 0; i < fileChunks.length; i++) {
        const batch = fileChunks[i];

        setPhase("uploading");
        setCurrentStep("Uploading images...");
        setProgressText("Uploading images...");

        const formData = new FormData();
        batch.forEach((file) => {
          formData.append("files", file);
        });

        const uploadRes = await fetch(`/api/analyze/upload/${newJobId}`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(
            uploadData?.error ||
              uploadData?.detail ||
              "Batch upload failed."
          );
        }

        setUploadedBatches(i + 1);
      }

      const completeRes = await fetch(`/api/analyze/complete/${newJobId}`, {
        method: "POST",
      });

      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        throw new Error(
          completeData?.error ||
            completeData?.detail ||
            "Failed to start analysis."
        );
      }

      setPhase("processing");
      setCurrentStep("Processing images...");
      setProgressText(`Image 1 of ${files.length}`);
      setStatusPollEnabled(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during analysis."
      );
      setPhase("failed");
      setCurrentStep("Failed");
      setProgressText(null);
      setIsLoading(false);
      setStatusPollEnabled(false);
    }
  };

  const showBottomSummary = files.length > 0 && !isLoading && !result;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pt-0 pb-8 sm:px-6 lg:px-8">
        <header className="grid h-20 grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/logo/logo.png"
                alt="MoLab"
                width={190}
                height={72}
                priority
                sizes="190px"
                className="w-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.28)]"
              />
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-8 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 backdrop-blur-md md:flex">
            <Link href="/" className="transition hover:text-cyan-300">
              Home
            </Link>
            <Link href="/technology" className="transition hover:text-cyan-300">
              Technology
            </Link>
            <Link href="/services" className="transition hover:text-cyan-300">
              Services
            </Link>
            <Link href="/about" className="transition hover:text-cyan-300">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-cyan-300">
              Contact
            </Link>
          </nav>

          <div className="flex justify-end">
            <Link
              href="/upload"
              className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
            >
              Upload Sample
            </Link>
          </div>
        </header>

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-base uppercase tracking-[0.35em] text-cyan-300">
            UPLOAD SAMPLE IMAGES
          </div>

          <p className="mt-4 max-w-2xl text-base text-slate-400">
            Upload all grain images you want to analyze in one premium batch
            workflow.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="rounded-[24px] border border-dashed border-cyan-300/30 bg-black/20 p-10 text-center">
            <div className="mx-auto max-w-2xl">
              <p className="text-lg font-medium text-white">
                Drag and drop your images here
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Or click below to browse files.
              </p>

              <div className="mt-6">
                <label className="inline-flex cursor-pointer rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105">
                  Choose Images
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Supported formats: PNG, JPG, JPEG
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div
              className={`mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 transition ${
                isLoading ? "pointer-events-none opacity-70 blur-[1px]" : ""
              }`}
            >
              <h2 className="text-lg font-medium text-white">Selected files</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="truncate">{file.name}</span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-300 transition hover:bg-red-500/40"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={startAnalysis}
                  disabled={isLoading}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.22)] transition duration-300 hover:scale-105 hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isLoading ? "Processing Sample..." : "Start Analysis"}
                </button>

                {showBottomSummary && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-300">{totalFilesText}</p>
                    <p className="mt-1 text-sm text-cyan-300">
                      Estimated time: {estimatedSeconds} second
                      {estimatedSeconds !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(isLoading || progressText || phase === "completed") && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/40 to-blue-500/10 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-xs uppercase tracking-[0.25em] ${
                      phase === "completed"
                        ? "text-emerald-300"
                        : "animate-pulse text-cyan-300"
                    }`}
                  >
                    {phase === "completed" ? "Completed" : "Processing"}
                  </p>

                  <p className="mt-2 text-lg font-medium text-white">
                    {currentStep}
                  </p>

                  {progressText && (
                    <p className="mt-1 text-sm text-slate-400">
                      {progressText}
                    </p>
                  )}
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_0_30px_rgba(34,211,238,0.12)] ${
                    phase === "completed"
                      ? "border-emerald-300/30 bg-emerald-400/10"
                      : "border-cyan-300/20 bg-cyan-400/10"
                  }`}
                >
                  {phase === "completed" ? (
                    <svg
                      className="h-7 w-7 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      phase === "completed"
                        ? "bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500"
                        : "bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
                    }`}
                    style={{ width: `${computedProgressPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>{computedProgressPercent}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Files
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {files.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Done
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {phase === "completed" ? files.length : processedImages}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {phase === "uploading"
                      ? "Uploading"
                      : phase === "processing"
                      ? "Analyzing"
                      : phase === "completed"
                      ? "Finished"
                      : "Idle"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && phase === "completed" && (
            <div className="mt-6 w-full rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-cyan-500/10 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
              <h3 className="text-lg font-medium text-emerald-200">
                Analysis Completed Successfully
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Your sample has been processed and the final sieve results are
                ready.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Files
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.total_files ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total Grains
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.total_grains ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Processing Time
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.processing_time_seconds?.toFixed(1) ?? "0.0"} s
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-medium text-white">
                  Sieve Result Table
                </h4>

                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/[0.04]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                          Mesh
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                          Percent (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {result.sieve_results && result.sieve_results.length > 0 ? (
                        result.sieve_results.map((row, index) => (
                          <tr key={`${row.mesh}-${index}`}>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              {row.mesh}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              {row.percent.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-4 text-sm text-slate-400"
                          >
                            No sieve results available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {result.zip_url && (
                <div className="mt-6 flex justify-center">
                  <a
                    href={`/api/download?url=${encodeURIComponent(
                      result.zip_url
                    )}&filename=${encodeURIComponent("analysis-results.zip")}`}
                    className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
                  >
                    Download Results ZIP
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
