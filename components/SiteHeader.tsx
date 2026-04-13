"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SiteHeader() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUserEmail(user?.email ?? null);
      setAuthChecked(true);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setUserEmail(null);
    setSigningOut(false);
    router.push("/signin");
    router.refresh();
  };

  const navLinkClass = (href: string) =>
    `transition hover:text-cyan-300 ${
      pathname === href ? "text-cyan-300" : "text-slate-300"
    }`;

  return (
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

      <nav className="hidden items-center justify-center gap-8 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm backdrop-blur-md md:flex">
        <Link href="/" className={navLinkClass("/")}>Home</Link>
        <Link href="/technology" className={navLinkClass("/technology")}>Technology</Link>
        <Link href="/services" className={navLinkClass("/services")}>Services</Link>
        <Link href="/dashboard" className={navLinkClass("/dashboard")}>Dashboard</Link>
        <Link href="/about" className={navLinkClass("/about")}>About</Link>
        <Link href="/contact" className={navLinkClass("/contact")}>Contact</Link>
      </nav>

      <div className="flex items-center justify-end gap-3">
        {!authChecked ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-400">
            Loading...
          </div>
        ) : userEmail ? (
          <>
            <Link
              href="/upload"
              className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
            >
              Upload Sample
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 transition hover:scale-105 hover:bg-white/10 disabled:opacity-60"
            >
              {signingOut ? "Signing Out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/upload"
              className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
            >
              Upload Sample
            </Link>

            <Link
              href="/signin"
              className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 transition hover:scale-105 hover:bg-white/10"
            >
              Sign In
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
