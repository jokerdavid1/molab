import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SiteHeader from "@/components/SiteHeader";

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

export default async function DashboardPage() {
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

  const totalRuns = runList.length;
  const lastVisit = user.last_sign_in_at || user.created_at || null;

  const totalGrainsAnalyzed = runList.reduce((sum: number, run: any) => {
    const grains = getRunGrainsCount(run);
    return sum + (typeof grains === "number" ? grains : 0);
  }, 0);

  const totalProcessingTimeSeconds = runList.reduce((sum: number, run: any) => {
    const seconds = getRunProcessingTime(run);
    return sum + (typeof seconds === "number" ? seconds : 0);
  }, 0);

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

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Stat title="Total Tests" value={totalRuns} />
          <Stat title="Total Grains Analyzed" value={totalGrainsAnalyzed} />
          <Stat
            title="Total Processing Time"
            value={formatTotalSeconds(totalProcessingTimeSeconds)}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="mb-4 text-2xl font-semibold">History</h2>

          {runList.length === 0 ? (
            <p className="text-slate-400">No records yet.</p>
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
                  {runList.map((run: any) => {
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
