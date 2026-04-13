import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-10">
      <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>

      <p className="text-slate-400 mb-8">
        Logged in as: <span className="text-cyan-300">{user.email}</span>
      </p>

      <div className="flex gap-4">
        <Link
          href="/upload"
          className="rounded-lg bg-cyan-500 px-6 py-3 text-black font-medium hover:bg-cyan-400 transition"
        >
          Upload Sample
        </Link>

        <Link
          href="/"
          className="rounded-lg border border-white/20 px-6 py-3 hover:bg-white/10 transition"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
