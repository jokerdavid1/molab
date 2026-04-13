import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SiteHeader from "@/components/SiteHeader";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

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
            Access your uploads, sample history, and analysis results from one secure dashboard.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Welcome
              </p>

              <h1 className="mt-3 text-4xl font-semibold text-white">
                Dashboard
              </h1>

              <p className="mt-4 text-base text-slate-400">
                Logged in as{" "}
                <span className="font-medium text-cyan-300">{user.email}</span>
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-8">
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                Account
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    User
                  </p>
                  <p className="mt-2 text-lg font-medium text-white">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-medium text-emerald-300">
                    Signed In
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Next Step
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Open the upload page and submit a sample for analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Upload Samples
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Start a new image analysis workflow from the upload page.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Results History
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Your previous sample results will appear here next.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Secure Access
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Each account will only see its own uploads and reports.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
