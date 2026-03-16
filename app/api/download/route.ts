import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const fileUrl = req.nextUrl.searchParams.get("url");
    const filenameParam = req.nextUrl.searchParams.get("filename");

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
    }

    const parsedUrl = new URL(fileUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    const isAllowed =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".ngrok-free.app") ||
      hostname.endsWith(".ngrok-free.dev") ||
      hostname.endsWith(".ngrok.app");

    if (!isAllowed) {
      return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
    }

    const upstream = await fetch(fileUrl, {
      method: "GET",
      headers: {
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

    let filename = filenameParam || "analysis-results.zip";

    const contentDisposition = upstream.headers.get("content-disposition");
    if (!filenameParam && contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/i);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    const fileBuffer = await upstream.arrayBuffer();

    return new NextResponse(fileBuffer, {
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
