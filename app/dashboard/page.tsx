import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import SiteHeader from "@/components/SiteHeader";

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString();
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString();
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

  const runList = runs ?? [];

  const totalRuns = runList.length;
  const completedRuns = runList.filter((r: any) => r.status === "completed").length;
  const processingRuns = runList.filter((r: any) => r.status === "processing" || r.status === "pending").length;
  const failedRuns = runList.filter((r: any) => r.status === "failed").length;

  const lastVisit =
    user.last_sign_in_at || user.created_at || null;

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
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
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

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/upload"
                      className="rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-5 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-[1.02] hover:bg-cyan-400/30"
                    >
                      Upload New Sample
                    </Link>

                    <Link
                      href="/services"
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total Analyses
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalRuns}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Completed
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-300">{completedRuns}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Processing
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-cyan-300">{processingRuns}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Failed
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-red-300">{failedRuns}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Recent Testing Activity</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Your analysis history and downloadable results.
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
                  Once uploads are saved into your account, they will appear here with date, status, and download links.
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
                        const sample = Array.isArray(run.samples) ? run.samples[0] : run.samples;
                        const downloadLink = getRunDownloadLink(run);

                        const displayTime = run.finished_at || run.started_at || sample?.created_at || null;
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
      </section>
    </main>
  );
}
