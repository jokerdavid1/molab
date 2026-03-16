"use client";

import Image from "next/image";
import Link from "next/link";

const FOCUS = [
  {
    title: "Digital Grain Analysis",
    description:
      "Automated analysis of sand grains from microscope images using modern computer vision workflows.",
  },
  {
    title: "Particle Size & Shape Evaluation",
    description:
      "Measurement of grain size, morphology, and particle characteristics to support technical sand evaluation.",
  },
  {
    title: "Stockpile Volumetric Calculations",
    description:
      "Drone-based photogrammetry and 3D surface modeling to estimate stockpile volumes accurately.",
  },
  {
    title: "Sand Resource Modeling",
    description:
      "3D modeling of sand deposits from drilling data to estimate geometry, distribution, and tonnage.",
  },
];

export default function AboutPage() {
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
            <Link href="/services" className="transition hover:text-cyan-300">
              Services
            </Link>
            <Link href="/about" className="text-cyan-300">
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
            ABOUT
          </div>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            MoLab focuses on modern sand analysis through image-based
            workflows, digital particle measurement, and 3D technical modeling.
            The platform is designed to support faster, more consistent, and
            more scalable evaluation of sand materials.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            The project brings together practical experience in sand testing,
            geoscience, and engineering analysis. By combining laboratory
            thinking with modern computational tools, MoLab aims to improve how
            sand quality and sand resources are evaluated.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            From grain-scale characterization to deposit-scale resource
            modeling, the goal is to provide practical technical tools for
            laboratories, mining projects, and geological evaluation workflows.
          </p>
        </div>

        {/* Focus Areas */}
        <div className="mx-auto mt-10 w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {FOCUS.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:border-cyan-300/20 hover:bg-white/[0.07]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
                  <div className="h-5 w-5 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mx-auto mt-10 w-full max-w-5xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="rounded-[24px] border border-cyan-300/15 bg-black/20 px-6 py-8 text-center sm:px-10">
            <div className="mx-auto max-w-3xl">
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-sm uppercase tracking-[0.28em] text-cyan-300">
                Contact Us
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">
                Interested in working with us?
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-400">
                If you would like to learn more about MoLab or discuss a sand
                analysis project, feel free to get in touch.
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/contact"
                  className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
