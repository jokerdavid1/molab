"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type SieveRow = {
  mesh: string;
  percent: number;
};

type AnalysisResponse = {
  status?: string;
  job_id?: string;
  total_files?: number;
  total_grains?: number;
  processing_time_seconds?: number;
  sieve_results?: SieveRow[];
  zip_url?: string;
  error?: string;
  processed_files?: number;
};

type CameraDevice = {
  deviceId: string;
  label: string;
};

const API_BASE = "https://api.molab.ca";
const BATCH_SIZE = 8;
const SECONDS_PER_IMAGE = 10;

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "uploading" | "processing" | "completed" | "failed"
  >("idle");

  const [currentStep, setCurrentStep] = useState("Idle");
  const [progressText, setProgressText] = useState<string | null>(null);

  const [uploadedBatches, setUploadedBatches] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [processedImages, setProcessedImages] = useState(0);
  const [statusPollEnabled, setStatusPollEnabled] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureCountRef = useRef(1);

  const estimatedSeconds = useMemo(
    () => files.length * SECONDS_PER_IMAGE,
    [files.length]
  );

  const totalFilesText = useMemo(() => {
    if (files.length === 0) return "No files selected yet.";
    if (files.length === 1) return "1 image selected.";
    return `${files.length} images selected.`;
  }, [files.length]);

  const totalImages = files.length;
  const totalSteps = totalBatches + totalImages;
  const completedSteps =
    phase === "completed" ? totalSteps : uploadedBatches + processedImages;

  const computedProgressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const resetAnalysisState = () => {
    setError(null);
    setResult(null);
    setJobId(null);
    setPhase("idle");
    setCurrentStep("Idle");
    setProgressText(null);
    setUploadedBatches(0);
    setTotalBatches(0);
    setProcessedImages(0);
    setStatusPollEnabled(false);
  };

  const addFiles = (incomingFiles: File[]) => {
    const selected = incomingFiles.filter((file) =>
      /\.(png|jpe?g)$/i.test(file.name)
    );

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

    resetAnalysisState();

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const relatedTarget = e.relatedTarget as Node | null;
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) return;

    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addFiles(droppedFiles);
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    resetAnalysisState();
  };

  const chunkFiles = (inputFiles: File[], chunkSize: number) => {
    const chunks: File[][] = [];
    for (let i = 0; i < inputFiles.length; i += chunkSize) {
      chunks.push(inputFiles.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }

    setCameraOpen(false);
  };

  const loadCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices
        .filter((d) => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));

      setCameraDevices(videos);

      if (!selectedCameraId && videos.length > 0) {
        const microscope =
          videos.find((d) =>
            d.label.toLowerCase().includes("micro")
          ) || videos[0];
        setSelectedCameraId(microscope.deviceId);
      }
    } catch {
      setCameraError("Could not load available cameras.");
    }
  };

  const startCameraStream = async (deviceId?: string) => {
    try {
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser.");
        return;
      }

      stopCamera();

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          : {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        setCameraError("Video preview element is not ready.");
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = async () => {
          try {
            await video.play();
            resolve();
          } catch (err) {
            reject(err);
          }
        };
      });

      setCameraOpen(true);
    } catch (err) {
      setCameraError(
        "Could not open the selected microscope/camera. Close any microscope software using it, allow browser camera permission, and try again."
      );
    }
  };

  const openCamera = async () => {
    try {
      setCameraError(null);

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      tempStream.getTracks().forEach((track) => track.stop());

      await loadCameraDevices();

      setTimeout(async () => {
        const preferredId =
          selectedCameraId ||
          (await navigator.mediaDevices.enumerateDevices())
            .filter((d) => d.kind === "videoinput")[0]?.deviceId ||
          "";

        if (preferredId) {
          await startCameraStream(preferredId);
        } else {
          await startCameraStream();
        }
      }, 100);
    } catch {
      setCameraError(
        "Could not access camera permission. Please allow camera access in Chrome."
      );
    }
  };

  const handleCameraChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);

    if (cameraOpen) {
      await startCameraStream(newId);
    }
  };

  const capturePhoto = async () => {
    try {
      if (!videoRef.current || !canvasRef.current) {
        setCameraError("Camera preview is not ready.");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        setCameraError("Camera preview is not ready yet.");
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setCameraError("Could not capture image.");
        return;
      }

      ctx.drawImage(video, 0, 0, width, height);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );

      if (!blob) {
        setCameraError("Could not create image file.");
        return;
      }

      const now = Date.now();
      const file = new File(
        [blob],
        `microscope_capture_${now}_${captureCountRef.current}.jpg`,
        {
          type: "image/jpeg",
          lastModified: now,
        }
      );

      captureCountRef.current += 1;

      setFiles((prev) => [...prev, file]);
      resetAnalysisState();
      setCameraError(null);
    } catch {
      setCameraError("Failed to capture image.");
    }
  };

  useEffect(() => {
    if (!statusPollEnabled || !jobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/analyze/status/${jobId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data: AnalysisResponse = await res.json();

        const total = data.total_files ?? files.length;
        const done = data.processed_files ?? 0;

        if (data.status === "processing") {
          setPhase("processing");
          setProcessedImages(done);
          setCurrentStep("Processing images...");
          if (done < total) {
            setProgressText(`Image ${done + 1} of ${total}`);
          } else {
            setProgressText(`Image ${total} of ${total}`);
          }
        }

        if (data.status === "completed") {
          const hasFinalData =
            typeof data.total_grains === "number" &&
            data.processing_time_seconds != null &&
            Array.isArray(data.sieve_results);

          if (!hasFinalData) return;

          setProcessedImages(total);
          setPhase("completed");
          setCurrentStep("Completed");
          setProgressText("Analysis completed.");
          setResult(data);
          setIsLoading(false);
          setStatusPollEnabled(false);
          clearInterval(interval);
        }

        if (data.status === "failed") {
          setPhase("failed");
          setCurrentStep("Failed");
          setProgressText(null);
          setError(data.error || "Analysis failed.");
          setIsLoading(false);
          setStatusPollEnabled(false);
          clearInterval(interval);
        }
      } catch {
        // ignore temporary polling issues
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [statusPollEnabled, jobId, files.length]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startAnalysis = async () => {
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setJobId(null);
    setPhase("uploading");
    setCurrentStep("Initializing job...");
    setProgressText("Starting analysis...");
    setUploadedBatches(0);
    setProcessedImages(0);
    setStatusPollEnabled(false);

    try {
      const startRes = await fetch(`${API_BASE}/analyze/start`, {
        method: "POST",
      });

      const startData = await startRes.json();

      if (!startRes.ok || !startData.job_id) {
        throw new Error(startData?.error || "Failed to start job.");
      }

      const newJobId = startData.job_id as string;
      setJobId(newJobId);

      const fileChunks = chunkFiles(files, BATCH_SIZE);
      setTotalBatches(fileChunks.length);

      for (let i = 0; i < fileChunks.length; i++) {
        const batch = fileChunks[i];

        setPhase("uploading");
        setCurrentStep("Uploading images...");
        setProgressText("Uploading images...");

        const formData = new FormData();
        batch.forEach((file) => {
          formData.append("files", file);
        });

        const uploadRes = await fetch(`${API_BASE}/analyze/upload/${newJobId}`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(
            uploadData?.error ||
              uploadData?.detail ||
              "Batch upload failed."
          );
        }

        setUploadedBatches(i + 1);
      }

      const completeRes = await fetch(`${API_BASE}/analyze/complete/${newJobId}`, {
        method: "POST",
      });

      const completeData = await completeRes.json();

      if (!completeRes.ok) {
        throw new Error(
          completeData?.error ||
            completeData?.detail ||
            "Failed to start analysis."
        );
      }

      setPhase("processing");
      setCurrentStep("Processing images...");
      setProgressText(`Image 1 of ${files.length}`);
      setStatusPollEnabled(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during analysis."
      );
      setPhase("failed");
      setCurrentStep("Failed");
      setProgressText(null);
      setIsLoading(false);
      setStatusPollEnabled(false);
    }
  };

  const showBottomSummary = files.length > 0 && !isLoading && !result;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_25%),radial-gradient(circle_at_18%_78%,rgba(59,130,246,0.08),transparent_18%),radial-gradient(circle_at_85%_24%,rgba(14,165,233,0.08),transparent_20%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute left-1/2 top-[-120px] h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
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
            <Link href="/" className="transition hover:text-cyan-300">Home</Link>
            <Link href="/technology" className="transition hover:text-cyan-300">Technology</Link>
            <Link href="/services" className="transition hover:text-cyan-300">Services</Link>
            <Link href="/about" className="transition hover:text-cyan-300">About</Link>
            <Link href="/contact" className="transition hover:text-cyan-300">Contact</Link>
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

          <p className="mt-4 max-w-2xl text-base text-slate-400">
            Upload all grain images you want to analyze in one premium batch workflow.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-[24px] border border-dashed bg-black/20 p-10 text-center transition ${
              isDragging
                ? "border-cyan-300/70 bg-cyan-400/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                : "border-cyan-300/30"
            }`}
          >
            <div className="mx-auto max-w-2xl">
              <p className="text-lg font-medium text-white">
                Drag and drop your images here
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Or click below to browse files.
              </p>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

                <button
                  type="button"
                  onClick={cameraOpen ? stopCamera : openCamera}
                  className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-semibold text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
                >
                  {cameraOpen ? "Close Microscope" : "Use Microscope / Camera"}
                </button>
              </div>

              <div className="mt-4 text-sm text-slate-500">
                Supported formats: PNG, JPG, JPEG
              </div>
            </div>
          </div>

          {(cameraDevices.length > 0 || cameraOpen) && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
              <h2 className="text-lg font-medium text-white">
                Microscope / Camera Capture
              </h2>

              {cameraDevices.length > 0 && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-slate-300">
                    Camera source
                  </label>
                  <select
                    value={selectedCameraId}
                    onChange={handleCameraChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    {cameraDevices.map((device) => (
                      <option
                        key={device.deviceId}
                        value={device.deviceId}
                        className="bg-slate-900 text-white"
                      >
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="block min-h-[320px] w-full object-contain bg-black"
                />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] transition hover:scale-105"
                >
                  Capture Photo
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 transition hover:scale-105 hover:bg-white/10"
                >
                  Done Capturing
                </button>
              </div>

              <p className="mt-3 text-center text-sm text-slate-400">
                Each captured image is automatically added to your selected files below.
                You can keep taking more pictures.
              </p>
            </div>
          )}

          {cameraError && (
            <div className="mt-6 w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {cameraError}
            </div>
          )}

          {files.length > 0 && (
            <div
              className={`mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 transition ${
                isLoading ? "pointer-events-none opacity-70 blur-[1px]" : ""
              }`}
            >
              <h2 className="text-lg font-medium text-white">Selected files</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300"
                  >
                    <span className="truncate">{file.name}</span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-4 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-300 transition hover:bg-red-500/40"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col items-center">
                <button
                  type="button"
                  onClick={startAnalysis}
                  disabled={isLoading}
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.22)] transition duration-300 hover:scale-105 hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isLoading ? "Processing Sample..." : "Start Analysis"}
                </button>

                {showBottomSummary && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-300">{totalFilesText}</p>
                    <p className="mt-1 text-sm text-cyan-300">
                      Estimated time: {estimatedSeconds} second
                      {estimatedSeconds !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(isLoading || progressText || phase === "completed") && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/40 to-blue-500/10 p-5 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`text-xs uppercase tracking-[0.25em] ${
                      phase === "completed"
                        ? "text-emerald-300"
                        : "animate-pulse text-cyan-300"
                    }`}
                  >
                    {phase === "completed" ? "Completed" : "Processing"}
                  </p>

                  <p className="mt-2 text-lg font-medium text-white">
                    {currentStep}
                  </p>

                  {progressText && (
                    <p className="mt-1 text-sm text-slate-400">
                      {progressText}
                    </p>
                  )}
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_0_30px_rgba(34,211,238,0.12)] ${
                    phase === "completed"
                      ? "border-emerald-300/30 bg-emerald-400/10"
                      : "border-cyan-300/20 bg-cyan-400/10"
                  }`}
                >
                  {phase === "completed" ? (
                    <svg
                      className="h-7 w-7 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
                  )}
                </div>
              </div>

              <div className="mt-5">
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      phase === "completed"
                        ? "bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-500"
                        : "bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
                    }`}
                    style={{ width: `${computedProgressPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>{computedProgressPercent}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Files
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {files.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Done
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {phase === "completed" ? files.length : processedImages}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {phase === "uploading"
                      ? "Uploading"
                      : phase === "processing"
                      ? "Analyzing"
                      : phase === "completed"
                      ? "Finished"
                      : "Idle"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {result && phase === "completed" && (
            <div className="mt-6 w-full rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/40 to-cyan-500/10 p-5 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
              <h3 className="text-lg font-medium text-emerald-200">
                Analysis Completed Successfully
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Your sample has been processed and the final sieve results are ready.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Files
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.total_files ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total Grains
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.total_grains ?? 0}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Processing Time
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {result.processing_time_seconds?.toFixed(1) ?? "0.0"} s
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-medium text-white">
                  Sieve Result Table
                </h4>

                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/[0.04]">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                          Mesh
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">
                          Percent (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {result.sieve_results && result.sieve_results.length > 0 ? (
                        result.sieve_results.map((row, index) => (
                          <tr key={`${row.mesh}-${index}`}>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              {row.mesh}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-200">
                              {row.percent.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-4 py-4 text-sm text-slate-400"
                          >
                            No sieve results available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {result.zip_url && (
                <div className="mt-6 flex justify-center">
                  <a
                    href={
                      result.zip_url.startsWith("http")
                        ? result.zip_url
                        : `${API_BASE}${result.zip_url}`
                    }
                    className="rounded-full border border-cyan-300/30 bg-cyan-400/20 px-6 py-3 text-sm font-medium text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.18)] transition hover:scale-105 hover:bg-cyan-400/30"
                  >
                    Download Results ZIP
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
