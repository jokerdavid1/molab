import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SiteHeader from "@/components/SiteHeader";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function getRunFilesCount(run: any) {
  const firstResult = Array.isArray(run.test_results) ? run.test_results[0] : null;
  return (
    firstResult?.result_json?.total_files ??
    firstResult?.result_json?.files ??
    firstResult?.result_json?.image_count ??
    "—"
  );
}

function getRunGrainsCount(run: any) {
  const firstResult = Array.isArray(run.test_results) ? run.test_results[0] : null;
  return firstResult?.result_json?.total_grains ?? "—";
}

function getRunDownloadLink(run: any) {
  const firstResult = Array.isArray(run.test_results) ? run.test_results[0] : null;
  return firstResult?.report_file || firstResult?.result_json?.zip_url || null;
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

  const { data: runs } = await supabase
    .from("test_runs")
    .select(`
      id,
      status,
      started_at,
      finished_at,
      samples (
        id,
        sample_name,
        sample_type,
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
    .order("started_at", { ascending: false });

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

  const now = new Date();
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

  const days = Math.max(1, Math.min(30, runList.length));
  const avgPerDay30 = Math.round(last30Runs / days);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(last7Start);
    d.setDate(last7Start.getDate() + i);

    const label = d.toLocaleDateString(undefined, { weekday: "short" });
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

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pt-0 pb-8 sm:px-6 lg:px-8">
        <SiteHeader />

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-base uppercase tracking-[0.35em] text-cyan-300">
            CLIENT DASHBOARD
          </div>

          <p className="mt-4 max-w-2xl text-base text-slate-400">
            View your analysis history, recent activity, and downloadable results in one place.
          </p>
        </div>

        <div className="mx-auto mt-8 w-full max-w-7xl space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                  Welcome
                </p>

                <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold text-white lg:text-4xl">
                      Dashboard
                    </h1>
                    <p className="mt-3 text-base text-slate-400">
                      Signed in as{" "}
                      <span className="font-medium text-cyan-300">{user.email}</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Last visit: {formatDateTime(lastVisit)}
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/upload"
                      className="rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-5 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-[1.02] hover:bg-cyan-400/30"
                    >
                      Upload New Sample
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total Analyses
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{totalRuns}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    This Month
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{thisMonthRuns}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Past 7 Days
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{last7Runs}</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Avg / Day (30d)
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-white">{avgPerDay30}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Activity Overview</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Recent analysis volume and short-term trends.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Past 30 Days
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">{last30Runs}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Current Time Window
                  </p>
                  <p className="mt-2 text-sm text-cyan-300">
                    Weekly and monthly activity
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-end justify-between gap-3 h-48">
                  {last7Days.map((day, index) => {
                    const height = `${Math.max((day.count / maxChartValue) * 100, day.count > 0 ? 16 : 6)}%`;

                    return (
                      <div key={`${day.label}-${index}`} className="flex flex-1 flex-col items-center justify-end gap-3">
                        <div className="text-xs text-slate-400">{day.count}</div>
                        <div className="flex h-32 w-full items-end">
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-sky-300 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                            style={{ height }}
                          />
                        </div>
                        <div className="text-xs text-slate-400">{day.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Testing History</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Date, time, image count, status, and result download links.
                  </p>
                </div>

                <Link
                  href="/upload"
                  className="rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-5 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-400/30"
                >
                  Start New Analysis
                </Link>
              </div>

              {runList.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
                  <p className="text-lg font-medium text-white">No testing records yet</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Once your uploads are saved to your account, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-white/[0.04]">
                        <tr>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Sample
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Date
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Time
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Images
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Grains
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Status
                          </th>
                          <th className="px-4 py-4 text-left text-xs uppercase tracking-wide text-slate-400">
                            Download
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/10 bg-black/20">
                        {runList.map((run: any) => {
                          const sample = run.sample;
                          const downloadLink = getRunDownloadLink(run);
                          const displayTime = run.timestamp;
                          const timeObj = displayTime ? new Date(displayTime) : null;

                          return (
                            <tr key={run.id} className="hover:bg-white/[0.03]">
                              <td className="px-4 py-4">
                                <div>
                                  <p className="font-medium text-white">
                                    {sample?.sample_name || "Untitled Sample"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {sample?.sample_type || "No type"}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-300">
                                {formatDateOnly(displayTime)}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-300">
                                {timeObj ? timeObj.toLocaleTimeString() : "—"}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-300">
                                {getRunFilesCount(run)}
                              </td>

                              <td className="px-4 py-4 text-sm text-slate-300">
                                {getRunGrainsCount(run)}
                              </td>

                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    run.status === "completed"
                                      ? "bg-emerald-400/15 text-emerald-300"
                                      : run.status === "failed"
                                      ? "bg-red-400/15 text-red-300"
                                      : "bg-cyan-400/15 text-cyan-300"
                                  }`}
                                >
                                  {run.status || "pending"}
                                </span>
                              </td>

                              <td className="px-4 py-4">
                                {downloadLink ? (
                                  <a
                                    href={
                                      typeof downloadLink === "string" &&
                                      downloadLink.startsWith("http")
                                        ? downloadLink
                                        : typeof downloadLink === "string"
                                        ? `https://api.molab.ca${downloadLink}`
                                        : "#"
                                    }
                                    className="inline-flex rounded-lg border border-cyan-300/30 bg-cyan-400/20 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/30"
                                  >
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-sm text-slate-500">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
