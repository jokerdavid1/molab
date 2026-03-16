import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const fileUrl = req.nextUrl.searchParams.get("url");
    const filenameParam = req.nextUrl.searchParams.get("filename");

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
    }

    // Optional safety: only allow your own backend/ngrok domain
    const allowedHosts = [
      "your-ngrok-subdomain.ngrok-free.app",
      "your-company-server-domain.com",
      "localhost",
      "127.0.0.1",
    ];

    const parsed = new URL(fileUrl);
    if (!allowedHosts.includes(parsed.hostname)) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    const upstream = await fetch(fileUrl, {
      method: "GET",
      headers: {
        // This header helps bypass ngrok browser warning pages
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream download failed: ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    const contentDispositionUpstream =
      upstream.headers.get("content-disposition");

    let filename = filenameParam || "downloaded-file";

    if (!filenameParam && contentDispositionUpstream) {
      const match = contentDispositionUpstream.match(/filename="?([^"]+)"?/i);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const arrayBuffer = await upstream.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
