"use client";

import Image from "next/image";
import Link from "next/link";

const SERVICES = [
  {
    title: "Virtual Sieve Analysis",
    badge: "Available Now",
    badgeClass:
      "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
    description:
      "Upload grain images and receive automated particle size classification with sieve-style distribution outputs. This service is designed to support fast and repeatable digital sand analysis.",
    points: [
      "Digital grain sizing",
      "PSD and sieve-style outputs",
      "Fast batch image analysis",
    ],
  },
  {
    title: "Roundness Analysis",
    badge: "Coming Soon",
    badgeClass:
      "border-amber-300/25 bg-amber-400/10 text-amber-200",
    description:
      "Advanced grain shape analysis for evaluating roundness and particle morphology from uploaded images. This feature is currently in development and will be added to the platform soon.",
    points: [
      "Shape-based quality insight",
      "Roundness estimation",
      "Particle morphology analysis",
    ],
  },
  {
    title: "Volumetric Pile Calculations",
    badge: "Available",
    badgeClass:
      "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
    description:
      "Calculate stockpile volumes using drone imagery, photogrammetry, and 3D surface reconstruction workflows. This service supports accurate pile measurement for operational and inventory purposes.",
    points: [
      "Drone-based modeling",
      "ODM / 3D reconstruction",
      "Stockpile volume estimation",
    ],
  },
  {
    title: "Sand Resource Modeling & Tonnage Estimation",
    badge: "Available",
    badgeClass:
      "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
    description:
      "Build 3D resource models from drilling data to estimate sand distribution, deposit geometry, and tonnage. This service supports technical evaluation of sand resources at the deposit scale.",
    points: [
      "Drill-data-based modeling",
      "3D subsurface interpretation",
      "Tonnage estimation",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pt-0 pb-8 sm:px-6 lg:px-8">
        {/* Header */}
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
            <Link href="/" className="transition hover:text-cyan-300">
              Home
            </Link>
            <Link href="/technology" className="transition hover:text-cyan-300">
              Technology
            </Link>
            <Link href="/services" className="text-cyan-300">
              Services
            </Link>
            <Link href="/about" className="transition hover:text-cyan-300">
              About
            </Link>
            <Link href="/contact" className="transition hover:text-cyan-300">
              Contact
            </Link>
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

        {/* Intro */}
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-base uppercase tracking-[0.35em] text-cyan-300">
            SERVICES
          </div>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            Our services combine AI image analysis, drone-based volumetrics,
            and 3D geological modeling to support modern sand evaluation
            workflows. From grain-scale characterization to deposit-scale
            resource estimation, the platform is designed for practical
            technical applications.
          </p>
        </div>

        {/* Service Cards */}
        <div className="mx-auto mt-10 w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:border-cyan-300/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
                    <div className="h-5 w-5 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
                  </div>

                  <div
                    className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] ${service.badgeClass}`}
                  >
                    {service.badge}
                  </div>
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {service.description}
                </p>

                <div className="mt-5 space-y-2">
                  {service.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center pb-2 pt-10">
          <Link
            href="/upload"
            className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105"
          >
            Upload Your Sample
          </Link>
        </div>
      </section>
    </main>
  );
}
