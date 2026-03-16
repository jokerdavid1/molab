"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useMemo, useRef, useState } from "react";

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
};

const BATCH_SIZE = 8;
const SECONDS_PER_IMAGE = 10;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressText, setProgressText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const estimatedSeconds = useMemo(() => files.length * SECONDS_PER_IMAGE, [files.length]);

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
    setProgressText(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setError(null);
    setResult(null);
    setProgressText(null);
  };

  const totalFilesText = useMemo(() => {
    if (files.length === 0) return "No files selected yet.";
    if (files.length === 1) return "1 image selected.";
    return `${files.length} images selected.`;
  }, [files.length]);

  const chunkFiles = (inputFiles: File[], chunkSize: number) => {
    const chunks: File[][] = [];
    for (let i = 0; i < inputFiles.length; i += chunkSize) {
      chunks.push(inputFiles.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const startAnalysis = async () => {
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressText("Starting analysis job...");

    try {
      const startRes = await fetch("/api/analyze/start", {
        method: "POST",
      });

      const startData = await startRes.json();

      if (!startRes.ok || !startData.job_id) {
        throw new Error(startData?.error || "Failed to start job.");
      }

      const jobId = startData.job_id as string;
      const fileChunks = chunkFiles(files, BATCH_SIZE);

      for (let i = 0; i < fileChunks.length; i++) {
        const batch = fileChunks[i];
        setProgressText(
          `Uploading batch ${i + 1} of ${fileChunks.length}...`
        );

        const formData = new FormData();
        batch.forEach((file) => {
          formData.append("files", file);
        });

        const uploadRes = await fetch(`/api/analyze/upload/${jobId}`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || uploadData?.detail || "Batch upload failed.");
        }
      }

      setProgressText("Running analysis on uploaded images...");

      const completeRes = await fetch(`/api/analyze/complete/${jobId}`, {
        method: "POST",
      });

      const completeData: AnalysisResponse = await completeRes.json();

      if (!completeRes.ok) {
        throw new Error(
          completeData?.error ||
            (completeData as unknown as { detail?: string })?.detail ||
            "Analysis failed."
        );
      }

      setResult(completeData);
      setProgressText("Analysis completed.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong during analysis."
      );
      setProgressText(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
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
            <Link href="/" className="transition hover:text-cyan-300">Home</Link>
            <Link href="/technology" className="transition hover:text-cyan-300">Technology</Link>
            <Link href="/services" className="transition hover:text-cyan-300">Services</Link>
            <Link href="/about" className="transition hover:text-cyan-300">About</Link>
            <Link href="/contact" className="transition hover:text-cyan-300">Contact</Link>
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
            Upload all grain images you want to analyze in one batch workflow.
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

              <p className="mt-5 text-sm text-slate-300">{totalFilesText}</p>

              {files.length > 0 && (
                <>
                  <p className="mt-2 text-sm text-cyan-300">
                    Estimated time: {estimatedSeconds} second{estimatedSeconds !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Uploads are sent automatically in batches of {BATCH_SIZE}.
                  </p>
                </>
              )}

              <div className="mt-4 text-sm text-slate-500">
                Supported formats: PNG, JPG, JPEG
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
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

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={startAnalysis}
                  disabled={isLoading}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Processing..." : "Start Analysis"}
                </button>
              </div>

              {progressText && (
                <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
                  {progressText}
                </div>
              )}

              {error && (
                <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                  <h3 className="text-lg font-medium text-emerald-200">
                    Analysis Completed
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Files</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {result.total_files ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Total Grains</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {result.total_grains ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Processing Time</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {result.processing_time_seconds?.toFixed(1) ?? "0.0"} s
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-base font-medium text-white">Sieve Result Table</h4>

                    <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                      <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-white/[0.04]">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Mesh</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Percent (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 bg-black/20">
                          {result.sieve_results && result.sieve_results.length > 0 ? (
                            result.sieve_results.map((row, index) => (
                              <tr key={`${row.mesh}-${index}`}>
                                <td className="px-4 py-3 text-sm text-slate-200">{row.mesh}</td>
                                <td className="px-4 py-3 text-sm text-slate-200">
                                  {row.percent.toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-4 text-sm text-slate-400">
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
                        href={result.zip_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
                      >
                        Download Results ZIP
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
