export async function POST() {
  try {
    const analysisServerUrl = process.env.ANALYSIS_SERVER_URL;

    if (!analysisServerUrl) {
      return Response.json(
        { error: "ANALYSIS_SERVER_URL is not set." },
        { status: 500 }
      );
    }

    const response = await fetch(`${analysisServerUrl}/analyze/start`, {
      method: "POST",
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await response.text();
    const data = JSON.parse(text);

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error: "Failed to start analysis job.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
