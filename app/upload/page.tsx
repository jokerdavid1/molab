"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useMemo, useRef, useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    if (selected.length === 0) return;

    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      );

      const newFiles = selected.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      });

      return [...prev, ...newFiles];
    });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalFilesText = useMemo(() => {
    if (files.length === 0) return "No files selected yet.";
    if (files.length === 1) return "1 image selected.";
    return `${files.length} images selected.`;
  }, [files.length]);

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
            <Link href="/technology" className="transition hover:text-cyan-300">
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
            UPLOAD SAMPLE IMAGES
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Select all images for analysis
          </h1>

          <p className="mt-3 max-w-2xl text-base text-slate-400">
            Upload all grain images you want to analyze in one batch.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="rounded-[24px] border border-dashed border-cyan-300/30 bg-black/20 p-10 text-center">
            <div className="mx-auto max-w-2xl">
              <p className="text-lg font-medium text-white">
                Drag and drop your images here
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Or click below to browse files.
              </p>

              <div className="mt-6">
                <label className="inline-flex cursor-pointer rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105">
                  Choose Images
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="mt-5 text-sm text-slate-300">{totalFilesText}</p>

              <div className="mt-4 text-sm text-slate-500">
                Supported formats: PNG, JPG, JPEG
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium text-white">Selected files</h2>

                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Clear All
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="truncate">{file.name}</span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 text-base font-semibold leading-none text-red-300 transition hover:scale-105 hover:bg-red-400/20"
                      aria-label={`Remove ${file.name}`}
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
                >
                  Start Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
