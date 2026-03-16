"use client";

import Image from "next/image";
import Link from "next/link";

const PIPELINE_STEPS = [
  "Image Upload",
  "Grain Detection",
  "Particle Measurement",
  "Shape Analysis",
  "Virtual Sieve Results",
];

const TECHNOLOGY_CARDS = [
  {
    title: "AI Grain Detection",
    description:
      "Individual sand grains are identified from uploaded images using computer vision and contour-based segmentation. This allows the platform to isolate particle boundaries from the background with high consistency.",
    points: [
      "Automated grain isolation",
      "Contour extraction",
      "Background separation",
    ],
  },
  {
    title: "Particle Size Measurement",
    description:
      "Each detected grain is measured digitally to estimate particle size and classify material into sieve-related ranges. This creates a repeatable and scalable alternative to manual inspection.",
    points: [
      "Digital particle sizing",
      "Mesh-range classification",
      "Consistent measurements",
    ],
  },
  {
    title: "Roundness & Sphericity",
    description:
      "The system evaluates grain shape characteristics from particle contours to estimate roundness and sphericity. These metrics support deeper quality assessment beyond size alone.",
    points: [
      "Shape descriptor analysis",
      "Roundness estimation",
      "Sphericity estimation",
    ],
  },
  {
    title: "Virtual Sieve Classification",
    description:
      "Measured particles are grouped into sieve-style categories to generate a digital size distribution. This helps transform grain images into practical laboratory-style outputs.",
    points: [
      "Automated class assignment",
      "Digital PSD workflow",
      "Sieve-style grouping",
    ],
  },
  {
    title: "Fast Batch Processing",
    description:
      "Multiple images can be processed in one workflow, making the platform suitable for high-throughput analysis. The pipeline is designed for speed, repeatability, and future industrial scaling.",
    points: [
      "Batch image analysis",
      "Repeatable workflow",
      "Scalable processing",
    ],
  },
  {
    title: "Reporting & Visualization",
    description:
      "Outputs are transformed into clean visual summaries such as particle size distributions, classification charts, and analysis-ready data views for technical review.",
    points: [
      "Distribution plots",
      "Analysis summaries",
      "Clear technical outputs",
    ],
  },
];

export default function TechnologyPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      </div>

      <section className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 pt-0 pb-8 sm:px-6 lg:px-8">
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
            <Link href="/technology" className="text-cyan-300">
              Technology
            </Link>
            <Link href="/services" className="transition hover:text-cyan-300">
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

        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2 text-base uppercase tracking-[0.35em] text-cyan-300">
            TECHNOLOGY
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            AI-Powered Sand Analysis Technology
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
            Our platform combines computer vision, particle measurement, and
            automated classification to transform grain images into actionable
            sand quality data. The workflow is designed to support fast,
            repeatable, and scalable digital analysis.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-6xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Processing Pipeline
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                From image input to technical results
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                Each uploaded image moves through a structured digital workflow
                that detects grains, measures particle characteristics, and
                organizes results into analysis-ready outputs.
              </p>
            </div>

            <div className="mt-8 hidden xl:grid xl:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] xl:items-center xl:gap-3">
              {PIPELINE_STEPS.map((step, index) => (
                <div
                  key={step}
                  className="contents"
                >
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-center text-sm font-medium text-cyan-200">
                    {step}
                  </div>

                  {index < PIPELINE_STEPS.length - 1 && (
                    <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-cyan-400/20 via-cyan-300/70 to-cyan-400/20" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-3 xl:hidden">
              {PIPELINE_STEPS.map((step) => (
                <div
                  key={step}
                  className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-center text-sm font-medium text-cyan-200"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 w-full max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {TECHNOLOGY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-md transition hover:border-cyan-300/20 hover:bg-white/[0.07]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10">
                  <div className="h-5 w-5 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-white">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {card.description}
                </p>

                <div className="mt-5 space-y-2">
                  {card.points.map((point) => (
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
