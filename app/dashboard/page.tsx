import { redirect } from "next/navigation";
import Link from "next/link";
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
      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pb-8 sm:px-6 lg:px-8">
        <SiteHeader />

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Welcome <span className="text-cyan-300">{user.email}</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Last visit: {formatDateTime(lastVisit)}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Stat title="Total" value={totalRuns} />
          <Stat title="This Month" value={thisMonthRuns} />
          <Stat title="7 Days" value={last7Runs} />
          <Stat title="Avg/Day" value={avgPerDay30} />
        </div>

        {/* Chart */}
        <div className="mt-8 bg-black/20 p-6 rounded-2xl">
          <h2 className="text-xl mb-4">Last 7 Days</h2>
          <div className="flex items-end gap-2 h-40">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="text-xs">{d.count}</div>
                <div
                  className="w-full bg-cyan-400 rounded-t"
                  style={{
                    height: `${(d.count / maxChartValue) * 100}%`,
                    minHeight: d.count ? "10px" : "4px",
                  }}
                />
                <div className="text-xs mt-1">{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 bg-black/20 rounded-2xl p-6">
          <h2 className="text-xl mb-4">History</h2>

          {runList.length === 0 ? (
            <p className="text-slate-400">No records yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th>Sample</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Images</th>
                  <th>Status</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {runList.map((run: any) => {
                  const sample = run.sample;
                  const time = run.timestamp;

                  return (
                    <tr key={run.id} className="border-t border-white/10">
                      <td>{sample?.sample_name}</td>
                      <td>{formatDateOnly(time)}</td>
                      <td>{formatDateTime(time)}</td>
                      <td>{getRunFilesCount(run)}</td>
                      <td>{run.status}</td>
                      <td>
                        {getRunDownloadLink(run) && (
                          <a
                            href={`https://api.molab.ca${getRunDownloadLink(run)}`}
                            className="text-cyan-300"
                          >
                            Download
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="bg-black/20 p-4 rounded-xl text-center">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-2xl text-white mt-2">{value}</p>
    </div>
  );
}
