export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const analysisServerUrl = process.env.ANALYSIS_SERVER_URL;

    if (!analysisServerUrl) {
      return Response.json(
        { error: "ANALYSIS_SERVER_URL is not set." },
        { status: 500 }
      );
    }

    const response = await fetch(`${analysisServerUrl}/analyze`, {
      method: "POST",
      body: formData,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    const data = await response.json();

    if (data?.zip_url && data.zip_url.startsWith("/")) {
      data.zip_url = `${analysisServerUrl}${data.zip_url}`;
    }

    return Response.json(data, { status: response.status });
  } catch (error) {
    return Response.json(
      {
        error: "Analysis server connection failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
