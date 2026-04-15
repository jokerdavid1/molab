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

function getBestResult(run: any) {
  const results = Array.isArray(run.test_results) ? run.test_results : [];

  const completedWithNumbers =
    results.find(
      (r: any) =>
        r?.result_json?.status === "completed" &&
        typeof r?.result_json?.total_files !== "undefined"
    ) || null;

  if (completedWithNumbers) return completedWithNumbers;

  const completed =
    results.find((r: any) => r?.result_json?.status === "completed") || null;

  if (completed) return completed;

  if (run?.result_json) {
    return {
      result_json: run.result_json,
      report_file: run.report_file ?? run.result_json?.zip_url ?? null,
    };
  }

  return results[results.length - 1] || null;
}

function getRunFilesCount(run: any) {
  const bestResult = getBestResult(run);
  return (
    bestResult?.result_json?.total_files ??
    bestResult?.result_json?.files ??
    bestResult?.result_json?.image_count ??
    run?.result_json?.total_files ??
    "—"
  );
}

function getRunGrainsCount(run: any) {
  const bestResult = getBestResult(run);
  return (
    bestResult?.result_json?.total_grains ??
    run?.result_json?.total_grains ??
    "—"
  );
}

function getRunDownloadLink(run: any) {
  const bestResult = getBestResult(run);
  return (
    bestResult?.report_file ||
    bestResult?.result_json?.zip_url ||
    run?.report_file ||
    run?.result_json?.zip_url ||
    null
  );
}

function getDisplayStatus(run: any) {
  const bestResult = getBestResult(run);
  return (
    bestResult?.result_json?.status ||
    run?.result_json?.status ||
    run.status ||
    "—"
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysAgoStart(days: number) {
  const d = startOfToday();
  d.setDate(d.getDate() - days);
  return d;
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
      sample_id,
      status,
      started_at,
      finished_at,
      result_json,
      report_file,
      samples (
        id,
        sample_name,
        created_at
      ),
      test_results (
        id,
        user_id,
        test_run_id,
        test_type,
        result_json,
        report_file,
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

  const monthStart = startOfMonth();
  const last7Start = daysAgoStart(6);
  const last30Start = daysAgoStart(29);

  const thisMonthRuns = runList.filter((run: any) => {
    if (!run.timestamp) return false;
    return new Date(run.timestamp) >= monthStart;
  }).length;

  const last7Runs = runList.filter((run: any) => {
    if (!run.timestamp) return false;
    return new Date(run.timestamp) >= last7Start;
  }).length;

  const last30Runs = runList.filter((run: any) => {
    if (!run.timestamp) return false;
    return new Date(run.timestamp) >= last30Start;
  }).length;

  const avgPerDay30 = Math.round((last30Runs / 30) * 10) / 10;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(last7Start);
    d.setDate(last7Start.getDate() + i);

    const label = d.toLocaleDateString("en-CA", {
      timeZone: "America/Edmonton",
      weekday: "short",
    });

    const key = d.toDateString();

    const count = runList.filter((run: any) => {
      if (!run.timestamp) return false;
      return new Date(run.timestamp).toDateString() === key;
    }).length;

    return { label, count };
  });

  const maxChartValue = Math.max(...last7Days.map((d) => d.count), 1);

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

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat title="Total" value={totalRuns} />
          <Stat title="This Month" value={thisMonthRuns} />
          <Stat title="7 Days" value={last7Runs} />
          <Stat title="Avg/Day" value={avgPerDay30} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Last 7 Days</h2>

          <div className="flex h-48 items-end gap-2">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center">
                <div className="mb-2 text-sm text-white">{d.count}</div>
                <div
                  className="w-full rounded-t bg-cyan-400"
                  style={{
                    height: `${(d.count / maxChartValue) * 100}%`,
                    minHeight: d.count ? "14px" : "4px",
                  }}
                />
                <div className="mt-2 text-sm text-white">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="mb-4 text-2xl font-semibold">History</h2>

          {runList.length === 0 ? (
            <p className="text-slate-400">No records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-sm">
                <thead className="text-slate-400">
                  <tr className="border-b border-white/10">
                    <th className="px-2 py-3 text-left">Sample</th>
                    <th className="px-2 py-3 text-left">Date</th>
                    <th className="px-2 py-3 text-left">Time</th>
                    <th className="px-2 py-3 text-left">Images</th>
                    <th className="px-2 py-3 text-left">Grains</th>
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

                    return (
                      <tr key={run.id} className="border-t border-white/10">
                        <td className="px-2 py-4 text-white">
                          {sample?.sample_name || "Untitled Sample"}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {formatDateOnly(time)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {formatDateTime(time)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {getRunFilesCount(run)}
                        </td>

                        <td className="px-2 py-4 text-white">
                          {getRunGrainsCount(run)}
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
