import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SiteHeader from "@/components/SiteHeader";

type SearchParams = Promise<{
  timeframe?: string;
  page?: string;
}>;

const PAGE_SIZE = 10;

const TIMEFRAME_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Past 7 Days" },
  { value: "30d", label: "Past Month" },
  { value: "90d", label: "Past 90 Days" },
  { value: "1y", label: "Past Year" },
  { value: "all", label: "Total" },
] as const;

type TimeframeValue = (typeof TIMEFRAME_OPTIONS)[number]["value"];

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTimeOnly(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleTimeString("en-CA", {
    timeZone: "America/Edmonton",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSeconds(value?: number | null) {
  if (value == null || Number.isNaN(value)) return "—";
  return `${value.toFixed(1)} s`;
}

function formatTotalSeconds(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0.0 s";

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)} s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds.toFixed(1)}s`;
  }

  return `${minutes}m ${seconds.toFixed(1)}s`;
}

function getBestResult(run: any) {
  const results = Array.isArray(run.test_results) ? run.test_results : [];
  if (results.length === 0) return null;

  const completedWithFile =
    results.find(
      (r: any) =>
        r?.result_json?.status === "completed" &&
        (r?.report_file || r?.result_json?.zip_url)
    ) ?? null;

  if (completedWithFile) return completedWithFile;

  const completed =
    results.find((r: any) => r?.result_json?.status === "completed") ?? null;

  if (completed) return completed;

  return results[results.length - 1] ?? null;
}

function getRunFilesCount(run: any) {
  const bestResult = getBestResult(run);
  return (
    bestResult?.result_json?.total_files ??
    bestResult?.result_json?.files ??
    bestResult?.result_json?.image_count ??
    "—"
  );
}

function getRunGrainsCount(run: any) {
  const bestResult = getBestResult(run);
  return bestResult?.result_json?.total_grains ?? "—";
}

function getRunProcessingTime(run: any) {
  const bestResult = getBestResult(run);
  return bestResult?.result_json?.processing_time_seconds ?? null;
}

function getRunDownloadLink(run: any) {
  const bestResult = getBestResult(run);
  return bestResult?.report_file || bestResult?.result_json?.zip_url || null;
}

function getDisplayStatus(run: any) {
  const bestResult = getBestResult(run);
  return bestResult?.result_json?.status || run.status || "—";
}

function getRunTimestamp(run: any) {
  return run.finished_at || run.started_at || run.samples?.created_at || null;
}

function getEdmontonDayBounds() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));

  return { start, end };
}

function getTimeframeCutoff(timeframe: TimeframeValue) {
  if (timeframe === "all") return null;

  if (timeframe === "today") {
    return getEdmontonDayBounds().start;
  }

  const now = new Date();
  const cutoff = new Date(now);

  if (timeframe === "7d") cutoff.setDate(cutoff.getDate() - 7);
  if (timeframe === "30d") cutoff.setDate(cutoff.getDate() - 30);
  if (timeframe === "90d") cutoff.setDate(cutoff.getDate() - 90);
  if (timeframe === "1y") cutoff.setFullYear(cutoff.getFullYear() - 1);

  return cutoff;
}

function filterRunsByTimeframe(runs: any[], timeframe: TimeframeValue) {
  if (timeframe === "all") return runs;

  if (timeframe === "today") {
    const { start, end } = getEdmontonDayBounds();

    return runs.filter((run) => {
      if (!run.timestamp) return false;
      const runDate = new Date(run.timestamp);
      return runDate >= start && runDate < end;
    });
  }

  const cutoff = getTimeframeCutoff(timeframe);
  if (!cutoff) return runs;

  return runs.filter((run) => {
    if (!run.timestamp) return false;
    const runDate = new Date(run.timestamp);
    return runDate >= cutoff;
  });
}

function buildPageHref(timeframe: string, page: number) {
  return `?timeframe=${timeframe}&page=${page}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;

  const rawTimeframe = resolvedSearchParams?.timeframe;
  const timeframe: TimeframeValue = TIMEFRAME_OPTIONS.some(
    (option) => option.value === rawTimeframe
  )
    ? (rawTimeframe as TimeframeValue)
    : "7d";

  const currentPage =
    Math.max(1, Number(resolvedSearchParams?.page || "1")) || 1;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  const { data: runs, error } = await supabase
    .from("test_runs")
    .select(`
      id,
      user_id,
      status,
      started_at,
      finished_at,
      samples (
        id,
        sample_name,
        created_at
      ),
      test_results (
        id,
        test_type,
        report_file,
        result_json,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Dashboard query error:", error);
  }

  const runList = (runs ?? []).map((run: any) => {
    const sample = Array.isArray(run.samples) ? run.samples[0] : run.samples;
    return {
      ...run,
      sample,
      timestamp: getRunTimestamp({ ...run, samples: sample }),
    };
  });

  const filteredRuns = filterRunsByTimeframe(runList, timeframe);

  const totalRuns = filteredRuns.length;
  const lastVisit = user.last_sign_in_at || user.created_at || null;

  const totalGrainsAnalyzed = filteredRuns.reduce((sum: number, run: any) => {
    const grains = getRunGrainsCount(run);
    return sum + (typeof grains === "number" ? grains : 0);
  }, 0);

  const totalProcessingTimeSeconds = filteredRuns.reduce(
    (sum: number, run: any) => {
      const seconds = getRunProcessingTime(run);
      return sum + (typeof seconds === "number" ? seconds : 0);
    },
    0
  );

  const totalImages = filteredRuns.reduce((sum: number, run: any) => {
    const files = getRunFilesCount(run);
    return sum + (typeof files === "number" ? files : 0);
  }, 0);

  const totalPages = Math.max(1, Math.ceil(filteredRuns.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedRuns = filteredRuns.slice(startIndex, startIndex + PAGE_SIZE);

  const selectedTimeframeLabel =
    TIMEFRAME_OPTIONS.find((option) => option.value === timeframe)?.label ??
    "Past 7 Days";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pb-8 sm:px-6 lg:px-8">
        <SiteHeader />

        <div className="mt-8 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-3 text-slate-400">
            Welcome <span className="text-cyan-300">{user.email}</span>
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Last visit: {formatDateTime(lastVisit)}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-400">Timeframe</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {selectedTimeframeLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TIMEFRAME_OPTIONS.map((option) => {
                const isActive = option.value === timeframe;

                return (
                  <Link
                    key={option.value}
                    href={buildPageHref(option.value, 1)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Stat title="Tests" value={totalRuns} />
          <Stat title="Images" value={totalImages} />
          <Stat title="Grains Analyzed" value={totalGrainsAnalyzed} />
          <Stat
            title="Processing Time"
            value={formatTotalSeconds(totalProcessingTimeSeconds)}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">History</h2>
              <p className="mt-1 text-sm text-slate-400">
                Showing {filteredRuns.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + PAGE_SIZE, filteredRuns.length)} of{" "}
                {filteredRuns.length} records
              </p>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Link
                  href={buildPageHref(timeframe, Math.max(1, safePage - 1))}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${
                    safePage === 1
                      ? "pointer-events-none border-white/10 bg-white/5 text-slate-600"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  Previous
                </Link>

                <span className="text-sm text-slate-400">
                  Page {safePage} of {totalPages}
                </span>

                <Link
                  href={buildPageHref(
                    timeframe,
                    Math.min(totalPages, safePage + 1)
                  )}
                  className={`rounded-xl border px-4 py-2 text-sm transition ${
                    safePage === totalPages
                      ? "pointer-events-none border-white/10 bg-white/5 text-slate-600"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white"
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </div>

          {paginatedRuns.length === 0 ? (
            <p className="text-slate-400">No records found for this timeframe.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="px-2 py-3 text-left">Sample</th>
                    <th className="px-2 py-3 text-left">Date</th>
                    <th className="px-2 py-3 text-left">Time</th>
                    <th className="px-2 py-3 text-left">Images</th>
                    <th className="px-2 py-3 text-left">Grains</th>
                    <th className="px-2 py-3 text-left">Processing Time</th>
                    <th className="px-2 py-3 text-left">Status</th>
                    <th className="px-2 py-3 text-left">Download</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRuns.map((run: any) => {
                    const sample = run.sample;
                    const time = run.timestamp;
                    const downloadLink = getRunDownloadLink(run);
                    const displayStatus = getDisplayStatus(run);
                    const processingTime = getRunProcessingTime(run);

                    return (
                      <tr key={run.id} className="border-t border-white/10">
                        <td className="px-2 py-4 text-white">
                          {sample?.sample_name || "Untitled Sample"}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {formatDateOnly(time)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {formatTimeOnly(time)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {getRunFilesCount(run)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {getRunGrainsCount(run)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {formatSeconds(processingTime)}
                        </td>

                        <td className="px-2 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              displayStatus === "completed"
                                ? "bg-emerald-400/15 text-emerald-300"
                                : displayStatus === "processing"
                                ? "bg-amber-400/15 text-amber-300"
                                : displayStatus === "failed"
                                ? "bg-red-400/15 text-red-300"
                                : "bg-slate-400/15 text-slate-300"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </td>

                        <td className="px-2 py-4">
                          {downloadLink ? (
                            <a
                              href={
                                downloadLink.startsWith("http")
                                  ? downloadLink
                                  : `https://api.molab.ca${downloadLink}`
                              }
                              className="text-cyan-300 transition hover:text-cyan-200 hover:underline"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
